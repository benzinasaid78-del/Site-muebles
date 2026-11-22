import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Permission =
  | "products.write"
  | "products.delete"
  | "categories.write"
  | "categories.delete"
  | "projects.write"
  | "projects.delete"
  | "content.write"
  | "media.write"
  | "media.delete"
  | "contacts.read"
  | "logs.view"
  | "users.manage"
  | "security.manage";

export type CurrentProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  roleId: string;
  roleName: string;
  permissions: Set<string>;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  role_id: string | null;
  active: boolean;
};

const ROLE_NAMES: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
};

/**
 * Devuelve el perfil del usuario con sesión, solo si su cuenta está ACTIVA y
 * tiene rol. Cualquier otro caso devuelve null (denegar por defecto).
 * Se comprueba siempre en el servidor, con getUser() (valida el token con Supabase).
 */
export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Una sola consulta: perfil + permisos de su rol (menos viajes a la base de datos = panel más rápido).
  type WithPerms = ProfileRow & { roles: { role_permissions: Array<{ permission_id: string }> } | null };
  const joined = await supabase
    .from("profiles")
    .select("id, full_name, role_id, active, roles(role_permissions(permission_id))")
    .eq("id", user.id)
    .maybeSingle();

  let profile = joined.data as unknown as WithPerms | null;
  let perms: Array<{ permission_id: string }> = profile?.roles?.role_permissions ?? [];

  if (joined.error) {
    // Respaldo: si la consulta combinada falla, se usan dos consultas simples (nunca bloquear el acceso por esto).
    console.error("[auth] consulta combinada", { code: joined.error.code, message: joined.error.message });
    const simple = await supabase
      .from("profiles")
      .select("id, full_name, role_id, active")
      .eq("id", user.id)
      .maybeSingle();
    profile = simple.data as unknown as WithPerms | null;
    if (profile?.role_id) {
      const { data: permData } = await supabase
        .from("role_permissions")
        .select("permission_id")
        .eq("role_id", profile.role_id);
      perms = (permData as unknown as Array<{ permission_id: string }> | null) ?? [];
    }
  }
  if (!profile || !profile.active || !profile.role_id) return null;

  return {
    id: profile.id,
    email: user.email ?? null,
    fullName: profile.full_name,
    roleId: profile.role_id,
    roleName: ROLE_NAMES[profile.role_id] ?? profile.role_id,
    permissions: new Set(perms.map((p) => p.permission_id)),
  };
});

/** Para páginas y acciones: exige sesión válida y cuenta activa. */
export async function requireProfile(): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");
  return profile;
}

/** Para páginas y acciones: exige además un permiso concreto. Si falta, no entra. */
export async function requirePermission(permission: Permission): Promise<CurrentProfile> {
  const profile = await requireProfile();
  if (!profile.permissions.has(permission)) redirect("/admin?acceso=denegado");
  return profile;
}

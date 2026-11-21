import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { secondaryButton } from "@/components/admin/fields";
import { updateUser } from "./actions";

export const metadata: Metadata = { title: "Usuarios" };

type Search = Promise<{ guardado?: string; error?: string }>;
type Row = {
  id: string;
  email: string | null;
  full_name: string | null;
  role_id: string | null;
  active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
};

export default async function UsersPage({ searchParams }: { searchParams: Search }) {
  const me = await requirePermission("users.manage");
  const sp = await searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_list_users");
  if (error) console.error("[usuarios] listado", { code: error.code, message: error.message });
  const rows = (data as unknown as Row[] | null) ?? [];

  const fmt = new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Madrid" });
  const select = "mt-1 w-full border border-carbon/40 bg-white px-3 py-2 text-sm";

  return (
    <>
      <h1 className="font-heading text-3xl">Usuarios</h1>
      <p className="mt-2 max-w-2xl text-sm text-carbon/70">
        Las cuentas nuevas se crean en Supabase (Authentication → Add user) y quedan <strong>inactivas</strong> hasta que
        les asignes un rol aquí. No puedes modificar tu propia cuenta, y siempre debe quedar un Super Admin activo.
      </p>

      {sp.guardado && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">Cambios guardados.</p>
      )}
      {sp.error && (
        <p role="alert" className="mt-6 border border-red-700 px-4 py-3 text-sm text-red-800">
          No se pudo guardar{sp.error !== "1" ? `: ${sp.error}` : "."}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-6 border border-red-700 px-4 py-3 text-sm text-red-800">
          No se pudo cargar la lista. ¿Está aplicada la migración 004?
        </p>
      )}

      <ul className="mt-8 space-y-4">
        {rows.map((u) => {
          const isMe = u.id === me.id;
          return (
            <li key={u.id} className="border border-arena bg-white p-5">
              <p className="break-all font-medium">{u.email ?? u.full_name}</p>
              <p className="text-xs text-carbon/60">
                {u.active ? "Activo" : "Inactivo"} · alta {fmt.format(new Date(u.created_at))}
                {u.last_sign_in_at ? ` · último acceso ${fmt.format(new Date(u.last_sign_in_at))}` : ""}
                {isMe ? " · (tú)" : ""}
              </p>
              {isMe ? (
                <p className="mt-3 text-sm text-carbon/70">Tu propia cuenta no se puede modificar aquí.</p>
              ) : (
                <form action={updateUser} className="mt-4 grid gap-3 sm:grid-cols-3 sm:items-end">
                  <input type="hidden" name="id" value={u.id} />
                  <label className="text-sm">
                    Rol
                    <select name="role" defaultValue={u.role_id ?? ""} className={select}>
                      <option value="">Sin rol</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </label>
                  <label className="text-sm">
                    Estado
                    <select name="active" defaultValue={u.active ? "1" : "0"} className={select}>
                      <option value="1">Activo</option>
                      <option value="0">Inactivo</option>
                    </select>
                  </label>
                  <button type="submit" className={secondaryButton}>Guardar</button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

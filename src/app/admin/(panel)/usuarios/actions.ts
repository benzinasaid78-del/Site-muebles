"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { logActivity, text, uuidSchema } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const ROLES = ["super_admin", "admin", "editor"];

export async function updateUser(formData: FormData): Promise<void> {
  const profile = await requirePermission("users.manage");
  const id = uuidSchema.safeParse(text(formData, "id"));
  const role = text(formData, "role");
  const active = text(formData, "active") === "1";
  if (!id.success || (role !== "" && !ROLES.includes(role))) redirect("/admin/usuarios?error=1");

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_user", {
    p_user: id.data,
    p_role: role === "" ? null : role,
    p_active: active,
  });
  if (error) {
    console.error("[usuarios] error", { code: error.code, message: error.message });
    redirect(`/admin/usuarios?error=${encodeURIComponent(error.message.slice(0, 120))}`);
  }
  await logActivity(profile.id, "user.update", "user", id.data, { role: role || null, active });
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios?guardado=1");
}

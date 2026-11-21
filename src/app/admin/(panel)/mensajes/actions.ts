"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { logActivity, text, uuidSchema } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export async function setHandled(formData: FormData): Promise<void> {
  const profile = await requirePermission("contacts.read");
  const id = uuidSchema.safeParse(text(formData, "id"));
  if (!id.success) redirect("/admin/mensajes?error=1");
  const handled = text(formData, "handled") === "1";

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_submissions")
    .update({ handled })
    .eq("id", id.data);
  if (error) {
    console.error("[mensajes] error", { code: error.code, message: error.message });
    redirect("/admin/mensajes?error=1");
  }
  await logActivity(profile.id, handled ? "contact.handled" : "contact.reopened", "contact", id.data);
  revalidatePath("/admin/mensajes");
  redirect("/admin/mensajes");
}

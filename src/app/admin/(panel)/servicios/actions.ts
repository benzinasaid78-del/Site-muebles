"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import {
  type FormState,
  SLUG_REGEX,
  fieldErrorsFrom,
  logActivity,
  optionalText,
  snapshot,
  text,
  uuidSchema,
} from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const serviceSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio.").max(120, "Máximo 120 caracteres."),
  slug: z
    .string()
    .trim()
    .min(1, "El identificador es obligatorio.")
    .max(80, "Máximo 80 caracteres.")
    .regex(SLUG_REGEX, "Solo minúsculas, números y guiones."),
  description: optionalText(2000),
  display_order: z.coerce
    .number({ invalid_type_error: "Introduce un número." })
    .int("Debe ser un número entero.")
    .min(0, "Mínimo 0.")
    .max(9999, "Máximo 9999."),
  status: z.enum(["draft", "published", "archived"], { message: "Estado no válido." }),
});

export async function saveService(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requirePermission("content.write");
  const values = snapshot(formData);

  const parsed = serviceSchema.safeParse({
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
    display_order: text(formData, "display_order") || "0",
    status: text(formData, "status") || "draft",
  });
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFrom(parsed.error), values };
  }

  const rawId = text(formData, "id");
  const id = rawId ? uuidSchema.safeParse(rawId) : null;
  if (rawId && !id?.success) return { error: "Servicio no válido.", values };

  const supabase = await createClient();
  let savedId: string;

  if (id?.success) {
    const { error } = await supabase
      .from("services")
      .update(parsed.data)
      .eq("id", id.data)
      .is("deleted_at", null);
    if (error) return failure(error, values);
    savedId = id.data;
    await logActivity(profile.id, "service.update", "service", savedId, { status: parsed.data.status });
  } else {
    const { data, error } = await supabase.from("services").insert(parsed.data).select("id").single();
    if (error) return failure(error, values);
    savedId = String((data as unknown as { id: string }).id);
    await logActivity(profile.id, "service.create", "service", savedId, { status: parsed.data.status });
  }

  revalidatePath("/admin/servicios");
  revalidatePath("/servicios");
  revalidatePath("/");
  redirect("/admin/servicios?guardado=1");
}

function failure(error: { code?: string; message: string }, values: Record<string, string>): FormState {
  if (error.code === "23505") {
    return {
      error: "Revisa los campos marcados.",
      fieldErrors: { slug: "Ya existe un servicio con ese identificador." },
      values,
    };
  }
  console.error("[servicios] error al guardar", { code: error.code, message: error.message });
  return { error: "No se pudo guardar. Inténtalo de nuevo.", values };
}

export async function deleteService(formData: FormData): Promise<void> {
  const profile = await requirePermission("content.write");
  const parsed = uuidSchema.safeParse(text(formData, "id"));
  if (!parsed.success) redirect("/admin/servicios?error=invalido");

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .eq("id", parsed.data)
    .is("deleted_at", null);
  if (error) {
    console.error("[servicios] error al eliminar", { code: error.code, message: error.message });
    redirect("/admin/servicios?error=fallo");
  }
  await logActivity(profile.id, "service.delete", "service", parsed.data);
  revalidatePath("/admin/servicios");
  revalidatePath("/servicios");
  revalidatePath("/");
  redirect("/admin/servicios?eliminado=1");
}

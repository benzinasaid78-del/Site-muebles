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
import { resolveImageField } from "@/lib/media-upload";
import { createClient } from "@/lib/supabase/server";

const categorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio.").max(120, "Máximo 120 caracteres."),
  slug: z
    .string()
    .trim()
    .min(1, "El identificador es obligatorio.")
    .max(80, "Máximo 80 caracteres.")
    .regex(SLUG_REGEX, "Solo minúsculas, números y guiones (p. ej. salones-modernos)."),
  description: optionalText(2000),
  display_order: z.coerce
    .number({ invalid_type_error: "Introduce un número." })
    .int("Debe ser un número entero.")
    .min(0, "Mínimo 0.")
    .max(9999, "Máximo 9999."),
  active: z.boolean(),
  cover_media_id: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.string().uuid("Imagen no válida.").nullable()),
  seo_title: optionalText(70),
  seo_description: optionalText(160),
});

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  // El permiso se comprueba SIEMPRE aquí dentro, no solo en la página.
  const profile = await requirePermission("categories.write");
  const values = snapshot(formData);

  const parsed = categorySchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
    display_order: text(formData, "display_order") || "0",
    active: formData.get("active") === "on",
    cover_media_id: text(formData, "cover_media_id"),
    seo_title: text(formData, "seo_title"),
    seo_description: text(formData, "seo_description"),
  });
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFrom(parsed.error), values };
  }

  const rawId = text(formData, "id");
  const id = rawId ? uuidSchema.safeParse(rawId) : null;
  if (rawId && !id?.success) return { error: "Identificador de categoría no válido.", values };

  // Foto de portada: se sube la nueva (si hay) o se mantiene/quita la actual.
  const cover = await resolveImageField(formData, "cover_media_id", profile);
  if (cover.error) return { error: cover.error, values };
  parsed.data.cover_media_id = cover.id;

  const supabase = await createClient();
  let savedId: string;

  if (id?.success) {
    const { error } = await supabase
      .from("categories")
      .update(parsed.data)
      .eq("id", id.data)
      .is("deleted_at", null);
    if (error) return failure(error, values);
    savedId = id.data;
    await logActivity(profile.id, "category.update", "category", savedId, { name: parsed.data.name });
  } else {
    const { data, error } = await supabase
      .from("categories")
      .insert(parsed.data)
      .select("id")
      .single();
    if (error) return failure(error, values);
    savedId = String((data as unknown as { id: string }).id);
    await logActivity(profile.id, "category.create", "category", savedId, { name: parsed.data.name });
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/colecciones");
  redirect("/admin/categorias?guardado=1");
}

function failure(error: { code?: string; message: string }, values: Record<string, string>): FormState {
  if (error.code === "23505") {
    return {
      error: "Revisa los campos marcados.",
      fieldErrors: { slug: "Ya existe una categoría con ese identificador." },
      values,
    };
  }
  console.error("[categorias] error al guardar", { code: error.code, message: error.message });
  return { error: "No se pudo guardar. Inténtalo de nuevo.", values };
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const profile = await requirePermission("categories.delete");
  const parsed = uuidSchema.safeParse(text(formData, "id"));
  if (!parsed.success) redirect("/admin/categorias?error=invalida");

  const supabase = await createClient();

  // No se elimina una categoría que todavía tiene productos.
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", parsed.data)
    .is("deleted_at", null);
  if ((count ?? 0) > 0) redirect("/admin/categorias?error=con-productos");

  // Borrado lógico: se puede recuperar desde la base de datos.
  const { error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq("id", parsed.data)
    .is("deleted_at", null);
  if (error) {
    console.error("[categorias] error al eliminar", { code: error.code, message: error.message });
    redirect("/admin/categorias?error=fallo");
  }

  await logActivity(profile.id, "category.delete", "category", parsed.data);
  revalidatePath("/admin/categorias");
  revalidatePath("/colecciones");
  redirect("/admin/categorias?eliminada=1");
}

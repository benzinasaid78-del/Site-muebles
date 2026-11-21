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

const priceSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(",", "."))
  .refine((v) => v === "" || /^\d{1,7}(\.\d{1,2})?$/.test(v), "Precio no válido (p. ej. 1250,50).")
  .transform((v) => (v === "" ? null : Number(v)));

const productSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio.").max(160, "Máximo 160 caracteres."),
    slug: z
      .string()
      .trim()
      .min(1, "El identificador es obligatorio.")
      .max(80, "Máximo 80 caracteres.")
      .regex(SLUG_REGEX, "Solo minúsculas, números y guiones."),
    category_id: z
      .string()
      .trim()
      .transform((v) => (v === "" ? null : v))
      .pipe(z.string().uuid("Categoría no válida.").nullable()),
    short_description: optionalText(300),
    description: optionalText(10000),
    brand: optionalText(80),
    reference: optionalText(60),
    price: priceSchema,
    show_price: z.boolean(),
    dimensions: optionalText(200),
    materials: optionalText(300),
    finishes: optionalText(300),
    featured: z.boolean(),
    status: z.enum(["draft", "published", "archived"], { message: "Estado no válido." }),
    seo_title: optionalText(70),
    seo_description: optionalText(160),
  })
  .refine((d) => !d.show_price || d.price !== null, {
    message: "Introduce un precio o desactiva «Mostrar precio».",
    path: ["price"],
  });

export async function saveProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requirePermission("products.write");
  const values = snapshot(formData);

  const mediaIds = formData.getAll("media_ids").filter((v): v is string => typeof v === "string");
  const mainRaw = text(formData, "main_media");
  const lists = { media_ids: mediaIds, main_media: mainRaw ? [mainRaw] : [] };

  const parsed = productSchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    category_id: text(formData, "category_id"),
    short_description: text(formData, "short_description"),
    description: text(formData, "description"),
    brand: text(formData, "brand"),
    reference: text(formData, "reference"),
    price: text(formData, "price"),
    show_price: formData.get("show_price") === "on",
    dimensions: text(formData, "dimensions"),
    materials: text(formData, "materials"),
    finishes: text(formData, "finishes"),
    featured: formData.get("featured") === "on",
    status: text(formData, "status") || "draft",
    seo_title: text(formData, "seo_title"),
    seo_description: text(formData, "seo_description"),
  });
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFrom(parsed.error), values, lists };
  }

  const imagesParsed = z.array(z.string().uuid()).max(20, "Máximo 20 imágenes.").safeParse(mediaIds);
  if (!imagesParsed.success) {
    return { error: "Selección de imágenes no válida (máximo 20).", values, lists };
  }
  const images: string[] = [...new Set<string>(imagesParsed.data)];
  const mainId = images.includes(mainRaw) ? mainRaw : (images[0] ?? null);

  const rawId = text(formData, "id");
  const id = rawId ? uuidSchema.safeParse(rawId) : null;
  if (rawId && !id?.success) return { error: "Producto no válido.", values, lists };

  const supabase = await createClient();
  let productId: string;

  if (id?.success) {
    // published_at se fija la primera vez que se publica.
    const { data: existing } = await supabase
      .from("products")
      .select("published_at")
      .eq("id", id.data)
      .is("deleted_at", null)
      .maybeSingle();
    if (!existing) return { error: "El producto ya no existe.", values, lists };
    const prevPublished = (existing as unknown as { published_at: string | null }).published_at;
    const published_at =
      parsed.data.status === "published" && !prevPublished ? new Date().toISOString() : prevPublished;

    const { error } = await supabase
      .from("products")
      .update({ ...parsed.data, published_at })
      .eq("id", id.data)
      .is("deleted_at", null);
    if (error) return failure(error, values, lists);
    productId = id.data;
    await logActivity(profile.id, "product.update", "product", productId, {
      name: parsed.data.name,
      status: parsed.data.status,
    });
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert({
        ...parsed.data,
        published_at: parsed.data.status === "published" ? new Date().toISOString() : null,
        created_by: profile.id,
      })
      .select("id")
      .single();
    if (error) return failure(error, values, lists);
    productId = String((data as unknown as { id: string }).id);
    await logActivity(profile.id, "product.create", "product", productId, {
      name: parsed.data.name,
      status: parsed.data.status,
    });
  }

  const imgError = await syncImages(productId, images, mainId);
  if (imgError) {
    // El producto ya está guardado; se avisa de que las imágenes no.
    redirect(`/admin/productos/${productId}?aviso=imagenes`);
  }

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath(`/productos/${parsed.data.slug}`);
  redirect("/admin/productos?guardado=1");
}

function failure(
  error: { code?: string; message: string },
  values: Record<string, string>,
  lists: Record<string, string[]>,
): FormState {
  if (error.code === "23505") {
    return {
      error: "Revisa los campos marcados.",
      fieldErrors: { slug: "Ya existe un producto con ese identificador." },
      values,
      lists,
    };
  }
  if (error.code === "23503") {
    return { error: "La categoría elegida ya no existe.", values, lists };
  }
  console.error("[productos] error al guardar", { code: error.code, message: error.message });
  return { error: "No se pudo guardar. Inténtalo de nuevo.", values, lists };
}

/** Sincroniza las imágenes del producto sin borrar las que se mantienen. */
async function syncImages(productId: string, mediaIds: string[], mainId: string | null): Promise<boolean> {
  const supabase = await createClient();

  const { data: existing, error: readErr } = await supabase
    .from("product_images")
    .select("media_id")
    .eq("product_id", productId);
  if (readErr) return true;

  const current = ((existing as unknown as Array<{ media_id: string }> | null) ?? []).map((r) => r.media_id);
  const toRemove = current.filter((m) => !mediaIds.includes(m));
  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId)
      .in("media_id", toRemove);
    if (error) return true;
  }

  if (mediaIds.length === 0) return false;

  // Solo puede haber una imagen principal: primero se quita la anterior.
  const { error: clearErr } = await supabase
    .from("product_images")
    .update({ is_main: false })
    .eq("product_id", productId);
  if (clearErr) return true;

  const rows = mediaIds.map((media_id, position) => ({
    product_id: productId,
    media_id,
    position,
    is_main: media_id === mainId,
  }));
  const { error: upErr } = await supabase
    .from("product_images")
    .upsert(rows, { onConflict: "product_id,media_id" });
  if (upErr) {
    console.error("[productos] error en imágenes", { code: upErr.code, message: upErr.message });
    return true;
  }
  return false;
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const profile = await requirePermission("products.delete");
  const parsed = uuidSchema.safeParse(text(formData, "id"));
  if (!parsed.success) redirect("/admin/productos?error=invalido");

  const supabase = await createClient();
  // Borrado lógico: se puede recuperar desde la base de datos.
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .eq("id", parsed.data)
    .is("deleted_at", null);
  if (error) {
    console.error("[productos] error al eliminar", { code: error.code, message: error.message });
    redirect("/admin/productos?error=fallo");
  }

  await logActivity(profile.id, "product.delete", "product", parsed.data);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  redirect("/admin/productos?eliminado=1");
}

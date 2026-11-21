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

const projectSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio.").max(160, "Máximo 160 caracteres."),
  slug: z
    .string()
    .trim()
    .min(1, "El identificador es obligatorio.")
    .max(80, "Máximo 80 caracteres.")
    .regex(SLUG_REGEX, "Solo minúsculas, números y guiones."),
  description: optionalText(5000),
  project_category: optionalText(80),
  featured: z.boolean(),
  status: z.enum(["draft", "published", "archived"], { message: "Estado no válido." }),
  seo_title: optionalText(70),
  seo_description: optionalText(160),
});

export async function saveProject(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requirePermission("projects.write");
  const values = snapshot(formData);

  const mediaIds = formData.getAll("media_ids").filter((v): v is string => typeof v === "string");
  const mainRaw = text(formData, "main_media");
  const lists = { media_ids: mediaIds, main_media: mainRaw ? [mainRaw] : [] };

  const parsed = projectSchema.safeParse({
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
    project_category: text(formData, "project_category"),
    featured: formData.get("featured") === "on",
    status: text(formData, "status") || "draft",
    seo_title: text(formData, "seo_title"),
    seo_description: text(formData, "seo_description"),
  });
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFrom(parsed.error), values, lists };
  }

  const imagesParsed = z.array(z.string().uuid()).max(30, "Máximo 30 imágenes.").safeParse(mediaIds);
  if (!imagesParsed.success) {
    return { error: "Selección de imágenes no válida (máximo 30).", values, lists };
  }
  const images: string[] = [...new Set<string>(imagesParsed.data)];
  const mainId = images.includes(mainRaw) ? mainRaw : (images[0] ?? null);

  const rawId = text(formData, "id");
  const id = rawId ? uuidSchema.safeParse(rawId) : null;
  if (rawId && !id?.success) return { error: "Proyecto no válido.", values, lists };

  const supabase = await createClient();
  let projectId: string;

  if (id?.success) {
    const { data: existing } = await supabase
      .from("projects")
      .select("published_at")
      .eq("id", id.data)
      .is("deleted_at", null)
      .maybeSingle();
    if (!existing) return { error: "El proyecto ya no existe.", values, lists };
    const prev = (existing as unknown as { published_at: string | null }).published_at;
    const published_at = parsed.data.status === "published" && !prev ? new Date().toISOString() : prev;

    const { error } = await supabase
      .from("projects")
      .update({ ...parsed.data, published_at, cover_media_id: mainId })
      .eq("id", id.data)
      .is("deleted_at", null);
    if (error) return failure(error, values, lists);
    projectId = id.data;
    await logActivity(profile.id, "project.update", "project", projectId, { status: parsed.data.status });
  } else {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        ...parsed.data,
        cover_media_id: mainId,
        published_at: parsed.data.status === "published" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();
    if (error) return failure(error, values, lists);
    projectId = String((data as unknown as { id: string }).id);
    await logActivity(profile.id, "project.create", "project", projectId, { status: parsed.data.status });
  }

  if (await syncImages(projectId, images)) {
    redirect(`/admin/proyectos/${projectId}?aviso=imagenes`);
  }

  revalidatePath("/admin/proyectos");
  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${parsed.data.slug}`);
  revalidatePath("/");
  redirect("/admin/proyectos?guardado=1");
}

function failure(
  error: { code?: string; message: string },
  values: Record<string, string>,
  lists: Record<string, string[]>,
): FormState {
  if (error.code === "23505") {
    return {
      error: "Revisa los campos marcados.",
      fieldErrors: { slug: "Ya existe un proyecto con ese identificador." },
      values,
      lists,
    };
  }
  console.error("[proyectos] error al guardar", { code: error.code, message: error.message });
  return { error: "No se pudo guardar. Inténtalo de nuevo.", values, lists };
}

/** Sincroniza las imágenes del proyecto; devuelve true si algo falló. */
async function syncImages(projectId: string, mediaIds: string[]): Promise<boolean> {
  const supabase = await createClient();

  const { data: existing, error: readErr } = await supabase
    .from("project_images")
    .select("media_id")
    .eq("project_id", projectId);
  if (readErr) return true;

  const current = ((existing as unknown as Array<{ media_id: string }> | null) ?? []).map((r) => r.media_id);
  const toRemove = current.filter((m) => !mediaIds.includes(m));
  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("project_images")
      .delete()
      .eq("project_id", projectId)
      .in("media_id", toRemove);
    if (error) return true;
  }
  if (mediaIds.length === 0) return false;

  const rows = mediaIds.map((media_id, position) => ({ project_id: projectId, media_id, position }));
  const { error: upErr } = await supabase
    .from("project_images")
    .upsert(rows, { onConflict: "project_id,media_id" });
  if (upErr) {
    console.error("[proyectos] error en imágenes", { code: upErr.code, message: upErr.message });
    return true;
  }
  return false;
}

export async function deleteProject(formData: FormData): Promise<void> {
  const profile = await requirePermission("projects.delete");
  const parsed = uuidSchema.safeParse(text(formData, "id"));
  if (!parsed.success) redirect("/admin/proyectos?error=invalido");

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .eq("id", parsed.data)
    .is("deleted_at", null);
  if (error) {
    console.error("[proyectos] error al eliminar", { code: error.code, message: error.message });
    redirect("/admin/proyectos?error=fallo");
  }
  await logActivity(profile.id, "project.delete", "project", parsed.data);
  revalidatePath("/admin/proyectos");
  revalidatePath("/proyectos");
  revalidatePath("/");
  redirect("/admin/proyectos?eliminado=1");
}

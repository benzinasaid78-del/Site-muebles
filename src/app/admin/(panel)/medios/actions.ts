"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { type FormState, logActivity, text, uuidSchema } from "@/lib/admin";
import {
  MAX_FILES_PER_UPLOAD,
  MAX_UPLOAD_BYTES,
  cleanFileName,
  detectImage,
} from "@/lib/media";
import { createClient } from "@/lib/supabase/server";

export async function uploadMedia(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requirePermission("media.write");

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Selecciona al menos una imagen." };
  if (files.length > MAX_FILES_PER_UPLOAD) {
    return { error: `Sube como máximo ${MAX_FILES_PER_UPLOAD} imágenes cada vez.` };
  }

  const supabase = await createClient();
  const problems: string[] = [];
  let ok = 0;

  for (const file of files) {
    const label = cleanFileName(file.name) || "archivo";
    if (file.size > MAX_UPLOAD_BYTES) {
      problems.push(`${label}: supera 4 MB.`);
      continue;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const detected = detectImage(bytes);
    if (!detected) {
      problems.push(`${label}: formato no permitido (solo JPG, PNG, WEBP o AVIF).`);
      continue;
    }

    // Nombre aleatorio: nunca se usa el nombre que envía el usuario como ruta.
    const path = `${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${detected.ext}`;
    const { error: upErr } = await supabase.storage.from("media").upload(path, bytes, {
      contentType: detected.mime,
      upsert: false,
      cacheControl: "31536000",
    });
    if (upErr) {
      console.error("[medios] error al subir", { message: upErr.message });
      problems.push(`${label}: no se pudo subir.`);
      continue;
    }

    const { data, error: dbErr } = await supabase
      .from("media_assets")
      .insert({
        storage_path: path,
        original_name: label,
        mime_type: detected.mime,
        size_bytes: file.size,
        uploaded_by: profile.id,
      })
      .select("id")
      .single();
    if (dbErr) {
      console.error("[medios] error al registrar", { code: dbErr.code, message: dbErr.message });
      await supabase.storage.from("media").remove([path]); // no dejar archivos huérfanos
      problems.push(`${label}: no se pudo registrar.`);
      continue;
    }

    ok += 1;
    await logActivity(profile.id, "media.upload", "media", String((data as unknown as { id: string }).id), {
      mime: detected.mime,
      size: file.size,
    });
  }

  if (ok === 0) return { error: problems.join(" ") };

  revalidatePath("/admin/medios");
  redirect(`/admin/medios?subidas=${ok}${problems.length ? `&fallos=${problems.length}` : ""}`);
}

export async function updateMediaAlt(formData: FormData): Promise<void> {
  const profile = await requirePermission("media.write");
  const id = uuidSchema.safeParse(text(formData, "id"));
  if (!id.success) redirect("/admin/medios?error=invalida");
  const alt = text(formData, "alt_text").trim().slice(0, 200);

  const supabase = await createClient();
  const { error } = await supabase
    .from("media_assets")
    .update({ alt_text: alt === "" ? null : alt })
    .eq("id", id.data)
    .is("deleted_at", null);
  if (error) {
    console.error("[medios] error al guardar alt", { code: error.code, message: error.message });
    redirect("/admin/medios?error=fallo");
  }
  await logActivity(profile.id, "media.update", "media", id.data);
  revalidatePath("/admin/medios");
  redirect("/admin/medios?guardado=1");
}

export async function deleteMedia(formData: FormData): Promise<void> {
  const profile = await requirePermission("media.delete");
  const id = uuidSchema.safeParse(text(formData, "id"));
  if (!id.success) redirect("/admin/medios?error=invalida");

  const supabase = await createClient();

  // No se borra una imagen que alguna ficha sigue usando.
  const [pi, pj, cat] = await Promise.all([
    supabase.from("product_images").select("id", { count: "exact", head: true }).eq("media_id", id.data),
    supabase.from("project_images").select("id", { count: "exact", head: true }).eq("media_id", id.data),
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("cover_media_id", id.data),
  ]);
  if ((pi.count ?? 0) + (pj.count ?? 0) + (cat.count ?? 0) > 0) {
    redirect("/admin/medios?error=en-uso");
  }

  const { data } = await supabase
    .from("media_assets")
    .select("storage_path")
    .eq("id", id.data)
    .maybeSingle();
  const path = (data as unknown as { storage_path: string } | null)?.storage_path;

  const { error } = await supabase.from("media_assets").delete().eq("id", id.data);
  if (error) {
    console.error("[medios] error al eliminar", { code: error.code, message: error.message });
    redirect("/admin/medios?error=en-uso");
  }
  if (path) await supabase.storage.from("media").remove([path]);

  await logActivity(profile.id, "media.delete", "media", id.data);
  revalidatePath("/admin/medios");
  redirect("/admin/medios?eliminada=1");
}

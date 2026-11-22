import { MAX_UPLOAD_BYTES, cleanFileName, detectImage } from "@/lib/media";
import { logActivity } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Sube imágenes a Storage y las registra en media_assets.
 * Valida el tipo REAL por firma, el tamaño, y usa un nombre aleatorio.
 * Devuelve los ids creados y la lista de problemas (por archivo).
 */
export async function uploadImageFiles(
  files: File[],
  userId: string,
): Promise<{ ids: string[]; problems: string[] }> {
  const supabase = await createClient();
  const ids: string[] = [];
  const problems: string[] = [];

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

    const path = `${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${detected.ext}`;
    const { error: upErr } = await supabase.storage.from("media").upload(path, bytes, {
      contentType: detected.mime,
      upsert: false,
      cacheControl: "31536000",
    });
    if (upErr) {
      console.error("[media-upload] error al subir", { message: upErr.message });
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
        uploaded_by: userId,
      })
      .select("id")
      .single();
    if (dbErr) {
      console.error("[media-upload] error al registrar", { code: dbErr.code, message: dbErr.message });
      await supabase.storage.from("media").remove([path]);
      problems.push(`${label}: no se pudo registrar.`);
      continue;
    }

    const id = String((data as unknown as { id: string }).id);
    ids.push(id);
    await logActivity(userId, "media.upload", "media", id, { mime: detected.mime, size: file.size });
  }
  return { ids, problems };
}

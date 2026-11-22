import { MAX_UPLOAD_BYTES, cleanFileName, detectImage } from "@/lib/media";
import { logActivity, text } from "@/lib/admin";
import type { CurrentProfile } from "@/lib/auth";
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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Campo de UNA imagen: si se envía una foto nueva (`name_file`) se sube y se devuelve su id;
 * si no, se mantiene el id actual (`name`) o null si se quitó.
 */
export async function resolveImageField(
  formData: FormData,
  name: string,
  profile: CurrentProfile,
): Promise<{ id: string | null; error?: string }> {
  const file = formData.get(`${name}_file`);
  if (file instanceof File && file.size > 0) {
    if (!profile.permissions.has("media.write")) {
      return { id: null, error: "No tienes permiso para subir imágenes." };
    }
    const up = await uploadImageFiles([file], profile.id);
    const id = up.ids[0];
    if (!id) return { id: null, error: `No se pudo subir la foto. ${up.problems.join(" ")}`.trim() };
    return { id };
  }
  const current = text(formData, name).trim();
  return { id: UUID.test(current) ? current : null };
}

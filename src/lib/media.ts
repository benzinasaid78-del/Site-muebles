/** Límite por archivo. Vercel admite cuerpos de hasta ~4,5 MB, por eso 4 MB. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_FILES_PER_UPLOAD = 10;

export type DetectedImage = { mime: "image/jpeg" | "image/png" | "image/webp" | "image/avif"; ext: string };

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((b, i) => bytes[offset + i] === b);
}

/**
 * Detecta el tipo REAL de imagen por su firma (los primeros bytes), sin fiarse del
 * nombre ni del tipo que declara el navegador. Devuelve null si no es una imagen permitida.
 */
export function detectImage(bytes: Uint8Array): DetectedImage | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: "jpg" };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: "image/png", ext: "png" };
  }
  // WEBP: "RIFF" ???? "WEBP"
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return { mime: "image/webp", ext: "webp" };
  }
  // AVIF: ???? "ftyp" + "avif" o "avis"
  if (
    startsWith(bytes, [0x66, 0x74, 0x79, 0x70], 4) &&
    (startsWith(bytes, [0x61, 0x76, 0x69, 0x66], 8) || startsWith(bytes, [0x61, 0x76, 0x69, 0x73], 8))
  ) {
    return { mime: "image/avif", ext: "avif" };
  }
  return null;
}

/** Nombre original limpio: sin rutas, sin caracteres de control, longitud limitada. */
export function cleanFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  // eslint-disable-next-line no-control-regex
  return base.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 120);
}

/** URL pública de un archivo del bucket "media". */
export function mediaPublicUrl(storagePath: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
  return `${base}/storage/v1/object/public/media/${storagePath}`;
}

/** Utilidades de imagen que se ejecutan en el navegador (el móvil del administrador). */
const MAX_SIDE = 2000;

/** Reduce una foto del móvil (varios MB) a ~2000 px en WebP. Si falla, devuelve el original. */
export async function shrinkImage(file: File): Promise<File> {
  try {
    if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/webp", 0.85));
    if (!blob || blob.type !== "image/webp") return file;
    // Solo se usa si realmente pesa menos que el original.
    if (blob.size >= file.size && scale === 1) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

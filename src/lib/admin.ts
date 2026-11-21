import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/** Estado devuelto por las acciones de formulario del panel. */
export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Valores enviados, para no perder lo escrito cuando hay un error. */
  values?: Record<string, string>;
  /** Campos con varios valores (p. ej. imágenes elegidas). */
  lists?: Record<string, string[]>;
};

export const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const uuidSchema = z.string().uuid();

export { slugify } from "@/lib/slug";

/** Lee un campo de texto del formulario como string ("" si falta). */
export function text(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v : "";
}

/** Copia los campos de texto del formulario (sin contraseñas) para repintar el formulario. */
export function snapshot(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string" && !k.startsWith("$ACTION")) out[k] = v;
  }
  return out;
}

/** Convierte los errores de Zod en un mapa campo -> mensaje. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Texto opcional: cadena vacía pasa a null. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .transform((v) => (v === "" ? null : v));

/**
 * Registra una acción en activity_logs. Solo metadatos: NUNCA contraseñas,
 * tokens ni contenido de mensajes. Un fallo al registrar no debe romper la acción.
 */
export async function logActivity(
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("activity_logs").insert({
      user_id: userId,
      action,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      details: details ?? null,
    });
  } catch {
    // Silencioso a propósito.
  }
}

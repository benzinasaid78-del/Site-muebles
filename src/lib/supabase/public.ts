import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./server";

/**
 * Cliente de SOLO LECTURA PÚBLICA para la web (sin sesión ni cookies).
 * Usa la clave pública (anon/publishable): lo que puede leer lo decide RLS
 * (solo contenido publicado y activo). Las respuestas se guardan 60 s en la
 * caché de Next; los cambios del panel la invalidan con revalidatePath.
 */
export function createPublicClient() {
  const { url, key } = getSupabaseEnv();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 60 } }),
    },
  });
}

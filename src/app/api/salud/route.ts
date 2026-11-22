import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/server";

// Comprobación de salud: hace una consulta real y mínima a la base de datos.
// Sirve para vigilar el sitio y mantener activo el proyecto de Supabase (plan gratuito).
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const { url, key } = getSupabaseEnv();
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    });
    const { error } = await supabase.from("categories").select("id").limit(1);
    if (error) throw error;
    return Response.json({ ok: true }, { status: 200, headers });
  } catch (e) {
    console.error("[salud] fallo", e instanceof Error ? e.message : e);
    return Response.json({ ok: false }, { status: 503, headers });
  }
}

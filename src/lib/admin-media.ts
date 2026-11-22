import { mediaPublicUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";

export type MediaOption = { id: string; url: string; alt: string; name: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Solo las imágenes indicadas (las que ya usa la ficha). Nunca se lista la biblioteca entera. */
export async function loadMediaOptions(ids: Array<string | null | undefined>): Promise<MediaOption[]> {
  const wanted = [...new Set(ids.filter((v): v is string => typeof v === "string" && UUID.test(v)))];
  if (wanted.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("media_assets")
    .select("id, storage_path, original_name, alt_text")
    .in("id", wanted)
    .is("deleted_at", null);

  return (
    (data as unknown as Array<{
      id: string;
      storage_path: string;
      original_name: string | null;
      alt_text: string | null;
    }> | null) ?? []
  ).map((m) => ({
    id: m.id,
    url: mediaPublicUrl(m.storage_path),
    alt: m.alt_text ?? "",
    name: m.original_name ?? "",
  }));
}

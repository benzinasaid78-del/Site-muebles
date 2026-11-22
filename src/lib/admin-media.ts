import { mediaPublicUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";

export type MediaOption = { id: string; url: string; alt: string; name: string };

/** Imágenes de la mediateca disponibles para elegir en proyectos y categorías. */
export async function loadMediaOptions(): Promise<MediaOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media_assets")
    .select("id, storage_path, original_name, alt_text")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

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

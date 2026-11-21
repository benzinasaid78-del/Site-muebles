import { mediaPublicUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import type { MediaOption } from "./ProductForm";

/** Categorías y biblioteca de imágenes disponibles para el formulario de producto. */
export async function loadProductFormOptions(): Promise<{
  categories: Array<{ id: string; name: string }>;
  media: MediaOption[];
}> {
  const supabase = await createClient();
  const [{ data: cats }, { data: med }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name")
      .is("deleted_at", null)
      .order("display_order", { ascending: true }),
    supabase
      .from("media_assets")
      .select("id, storage_path, original_name, alt_text")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const categories = (cats as unknown as Array<{ id: string; name: string }> | null) ?? [];
  const media = (
    (med as unknown as Array<{
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
  return { categories, media };
}

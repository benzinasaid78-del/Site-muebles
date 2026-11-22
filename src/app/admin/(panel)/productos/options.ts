import { createClient } from "@/lib/supabase/server";

/** Categorías para el formulario de producto (las imágenes se cargan solo por id, no la biblioteca). */
export async function loadProductFormOptions(): Promise<{
  categories: Array<{ id: string; name: string }>;
}> {
  const supabase = await createClient();
  const { data: cats } = await supabase
    .from("categories")
    .select("id, name")
    .is("deleted_at", null)
    .order("display_order", { ascending: true });
  return { categories: (cats as unknown as Array<{ id: string; name: string }> | null) ?? [] };
}

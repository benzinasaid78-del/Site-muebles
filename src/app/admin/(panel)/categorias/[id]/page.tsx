import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { uuidSchema } from "@/lib/admin";
import { loadMediaOptions } from "@/lib/admin-media";
import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "../CategoryForm";

export const metadata: Metadata = { title: "Editar categoría" };

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  active: boolean;
  cover_media_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("categories.write");
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description, display_order, active, cover_media_id, seo_title, seo_description")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  const c = data as unknown as Row | null;
  if (!c) notFound();
  const media = await loadMediaOptions([c.cover_media_id]);

  return (
    <>
      <h1 className="font-heading text-3xl">Editar categoría</h1>
      <div className="mt-8">
        <CategoryForm
          category={{
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description ?? "",
            display_order: String(c.display_order),
            active: c.active,
            cover_media_id: c.cover_media_id ?? "",
            seo_title: c.seo_title ?? "",
            seo_description: c.seo_description ?? "",
          }}
          media={media}
        />
      </div>
    </>
  );
}

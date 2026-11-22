import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { loadMediaOptions } from "@/lib/admin-media";
import { CategoryForm } from "../CategoryForm";

export const metadata: Metadata = { title: "Nueva categoría" };

export default async function NewCategoryPage() {
  await requirePermission("categories.write");
  const media = await loadMediaOptions([]);
  return (
    <>
      <h1 className="font-heading text-3xl">Nueva categoría</h1>
      <div className="mt-8">
        <CategoryForm
          category={{
            name: "",
            slug: "",
            description: "",
            display_order: "0",
            active: true,
            cover_media_id: "",
            seo_title: "",
            seo_description: "",
          }}
          media={media}
        />
      </div>
    </>
  );
}

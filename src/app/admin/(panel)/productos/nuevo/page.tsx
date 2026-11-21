import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { ProductForm } from "../ProductForm";
import { loadProductFormOptions } from "../options";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  await requirePermission("products.write");
  const { categories, media } = await loadProductFormOptions();
  return (
    <>
      <h1 className="font-heading text-3xl">Nuevo producto</h1>
      <div className="mt-8">
        <ProductForm
          product={{
            name: "",
            slug: "",
            category_id: "",
            short_description: "",
            description: "",
            brand: "",
            reference: "",
            price: "",
            show_price: false,
            dimensions: "",
            materials: "",
            finishes: "",
            featured: false,
            status: "draft",
            seo_title: "",
            seo_description: "",
          }}
          categories={categories}
          media={media}
          selectedIds={[]}
          mainId={null}
        />
      </div>
    </>
  );
}

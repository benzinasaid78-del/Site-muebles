import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { uuidSchema } from "@/lib/admin";
import { loadMediaOptions } from "@/lib/admin-media";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../ProductForm";
import { loadProductFormOptions } from "../options";

export const metadata: Metadata = { title: "Editar producto" };

type Row = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  brand: string | null;
  reference: string | null;
  price: number | null;
  show_price: boolean;
  dimensions: string | null;
  materials: string | null;
  finishes: string | null;
  featured: boolean;
  status: "draft" | "published" | "archived";
  seo_title: string | null;
  seo_description: string | null;
};

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aviso?: string }>;
}) {
  await requirePermission("products.write");
  const { id } = await params;
  const { aviso } = await searchParams;
  if (!uuidSchema.safeParse(id).success) notFound();

  const supabase = await createClient();
  const [{ data }, { data: imgs }, options] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, slug, name, short_description, description, category_id, brand, reference, price, show_price, dimensions, materials, finishes, featured, status, seo_title, seo_description",
      )
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("product_images")
      .select("media_id, is_main, position")
      .eq("product_id", id)
      .order("position", { ascending: true }),
    loadProductFormOptions(),
  ]);
  const p = data as unknown as Row | null;
  if (!p) notFound();

  const images = (imgs as unknown as Array<{ media_id: string; is_main: boolean }> | null) ?? [];
  const media = await loadMediaOptions(images.map((i) => i.media_id));
  const mainId = images.find((i) => i.is_main)?.media_id ?? null;

  return (
    <>
      <h1 className="font-heading text-3xl">Editar producto</h1>
      {aviso === "fotos" && (
        <p role="alert" className="mt-6 border border-red-700 px-4 py-3 text-sm text-red-800">
          El producto se guardó, pero alguna foto nueva no se pudo subir. Revisa las imágenes e inténtalo de nuevo (JPG, PNG, WEBP o AVIF, hasta 4 MB).
        </p>
      )}
      {aviso === "imagenes" && (
        <p role="alert" className="mt-6 border border-red-700 px-4 py-3 text-sm text-red-800">
          El producto se guardó, pero las imágenes no. Vuelve a elegirlas y guarda de nuevo.
        </p>
      )}
      <div className="mt-8">
        <ProductForm
          product={{
            id: p.id,
            name: p.name,
            slug: p.slug,
            category_id: p.category_id ?? "",
            short_description: p.short_description ?? "",
            description: p.description ?? "",
            brand: p.brand ?? "",
            reference: p.reference ?? "",
            price: p.price === null ? "" : String(p.price).replace(".", ","),
            show_price: p.show_price,
            dimensions: p.dimensions ?? "",
            materials: p.materials ?? "",
            finishes: p.finishes ?? "",
            featured: p.featured,
            status: p.status,
            seo_title: p.seo_title ?? "",
            seo_description: p.seo_description ?? "",
          }}
          categories={options.categories}
          media={media}
          selectedIds={images.map((i) => i.media_id)}
          mainId={mainId}
        />
      </div>
    </>
  );
}

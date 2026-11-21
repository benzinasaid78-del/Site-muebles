/**
 * Capa de acceso a datos de la web pública.
 * Categorías y productos se leen de Supabase (solo lo publicado, lo garantiza RLS).
 * Proyectos y servicios siguen con contenido de demostración hasta que su gestión
 * esté activa en el panel.
 */
import { createPublicClient } from "@/lib/supabase/public";
import { mediaPublicUrl } from "@/lib/media";
import {
  demoProjects,
  demoServices,
  type Category,
  type MediaRef,
  type Product,
  type Project,
  type Service,
} from "./demo-data";

export type { Category, MediaRef, Product, Project, Service };

type MediaEmbed = { storage_path: string; alt_text: string | null } | null;

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  cover: MediaEmbed;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  brand: string | null;
  reference: string | null;
  price: number | null;
  show_price: boolean;
  dimensions: string | null;
  materials: string | null;
  finishes: string | null;
  featured: boolean;
  categories: { slug: string } | null;
  product_images: Array<{ position: number; is_main: boolean; media: MediaEmbed }> | null;
};

function toMedia(m: MediaEmbed, fallbackAlt: string): MediaRef | undefined {
  if (!m) return undefined;
  return { url: mediaPublicUrl(m.storage_path), alt: m.alt_text || fallbackAlt };
}

function mapCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? "",
    order: r.display_order,
    active: r.active,
    seoTitle: r.seo_title ?? "",
    seoDescription: r.seo_description ?? "",
    cover: toMedia(r.cover, r.name),
  };
}

function mapProduct(r: ProductRow): Product {
  const images = [...(r.product_images ?? [])]
    .sort((a, b) => Number(b.is_main) - Number(a.is_main) || a.position - b.position)
    .map((i) => toMedia(i.media, r.name))
    .filter((m): m is MediaRef => m !== undefined);

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    shortDescription: r.short_description ?? "",
    description: r.description ?? "",
    categorySlug: r.categories?.slug ?? "",
    brand: r.brand ?? undefined,
    reference: r.reference ?? undefined,
    price: r.price ?? undefined,
    showPrice: r.show_price,
    dimensions: r.dimensions ?? undefined,
    materials: r.materials ?? undefined,
    finishes: r.finishes ?? undefined,
    featured: r.featured,
    published: true,
    images,
  };
}

const PRODUCT_SELECT =
  "id, slug, name, short_description, description, brand, reference, price, show_price, dimensions, materials, finishes, featured, categories(slug), product_images(position, is_main, media:media_assets(storage_path, alt_text))";

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("categories")
      .select("id, slug, name, description, display_order, active, seo_title, seo_description, cover:media_assets(storage_path, alt_text)")
      .eq("active", true)
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return ((data as unknown as CategoryRow[] | null) ?? []).map(mapCategory);
  } catch (e) {
    console.error("[data] categorías", e instanceof Error ? e.message : e);
    return [];
  }
}

export async function getCategory(slug: string): Promise<Category | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

async function fetchPublishedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return ((data as unknown as ProductRow[] | null) ?? []).map(mapProduct);
  } catch (e) {
    console.error("[data] productos", e instanceof Error ? e.message : e);
    return [];
  }
}

export async function getProducts(opts?: {
  categorySlug?: string;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Product[]> {
  let list = await fetchPublishedProducts();
  if (opts?.categorySlug) list = list.filter((p) => p.categorySlug === opts.categorySlug);
  if (opts?.featuredOnly) list = list.filter((p) => p.featured);
  return opts?.limit ? list.slice(0, opts.limit) : list;
}

export async function getProduct(slug: string): Promise<Product | null> {
  return (await fetchPublishedProducts()).find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  if (!product.categorySlug) return [];
  return (await getProducts({ categorySlug: product.categorySlug }))
    .filter((p) => p.id !== product.id)
    .slice(0, limit);
}

// ---- Proyectos y servicios: demostración hasta activar su gestión en el panel ----

export async function getProjects(opts?: { featuredOnly?: boolean }): Promise<Project[]> {
  const list = opts?.featuredOnly ? demoProjects.filter((p) => p.featured) : demoProjects;
  return [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getProject(slug: string): Promise<Project | null> {
  return demoProjects.find((p) => p.slug === slug) ?? null;
}

export async function getServices(): Promise<Service[]> {
  return demoServices.filter((s) => s.confirmed);
}

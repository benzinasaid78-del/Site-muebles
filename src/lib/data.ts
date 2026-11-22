/**
 * Capa de acceso a datos de la web pública.
 * Todo se lee de Supabase y solo se ve lo publicado/activo (lo garantiza RLS).
 */
import { createPublicClient } from "@/lib/supabase/public";
import { mediaPublicUrl } from "@/lib/media";
import {
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
  rating_avg: number | string | null;
  rating_count: number | null;
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
    ratingAvg: Number(r.rating_avg ?? 0) || 0,
    ratingCount: r.rating_count ?? 0,
    images,
  };
}

const PRODUCT_SELECT =
  "id, slug, name, short_description, description, brand, reference, price, show_price, dimensions, materials, finishes, featured, rating_avg, rating_count, categories(slug), product_images(position, is_main, media:media_assets(storage_path, alt_text))";

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("categories")
      .select("id, slug, name, description, display_order, active, seo_title, seo_description, cover:media_assets!cover_media_id(storage_path, alt_text)")
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
  const run = (select: string) =>
    createPublicClient()
      .from("products")
      .select(select)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500);
  try {
    let { data, error } = await run(PRODUCT_SELECT);
    if (error) {
      // Respaldo: si aún no se aplicó la migración de valoraciones, el catálogo debe seguir funcionando.
      console.error("[data] productos (con valoraciones)", error.message);
      ({ data, error } = await run(PRODUCT_SELECT.replace("rating_avg, rating_count, ", "")));
    }
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

// ---- Proyectos y servicios (solo lo publicado; lo garantiza RLS) ----

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  project_category: string | null;
  featured: boolean;
  published_at: string | null;
  cover: MediaEmbed;
  project_images: Array<{ position: number; media: MediaEmbed }> | null;
};

function mapProject(r: ProjectRow): Project {
  const images = [...(r.project_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((i) => toMedia(i.media, r.title))
    .filter((m): m is MediaRef => m !== undefined);
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description ?? "",
    category: r.project_category ?? "",
    publishedAt: r.published_at ? r.published_at.slice(0, 10) : "",
    featured: r.featured,
    cover: toMedia(r.cover, r.title) ?? images[0],
    images,
  };
}

const PROJECT_SELECT =
  "id, slug, title, description, project_category, featured, published_at, cover:media_assets!cover_media_id(storage_path, alt_text), project_images(position, media:media_assets(storage_path, alt_text))";

async function fetchPublishedProjects(): Promise<Project[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(200);
    if (error) throw error;
    return ((data as unknown as ProjectRow[] | null) ?? []).map(mapProject);
  } catch (e) {
    console.error("[data] proyectos", e instanceof Error ? e.message : e);
    return [];
  }
}

export async function getProjects(opts?: { featuredOnly?: boolean }): Promise<Project[]> {
  const list = await fetchPublishedProjects();
  return opts?.featuredOnly ? list.filter((p) => p.featured) : list;
}

export async function getProject(slug: string): Promise<Project | null> {
  return (await fetchPublishedProjects()).find((p) => p.slug === slug) ?? null;
}

export async function getServices(): Promise<Service[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("services")
      .select("slug, title, description")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
      .order("title", { ascending: true });
    if (error) throw error;
    return ((data as unknown as Array<{ slug: string; title: string; description: string | null }> | null) ?? []).map(
      (s) => ({ slug: s.slug, title: s.title, description: s.description ?? "", confirmed: true }),
    );
  } catch (e) {
    console.error("[data] servicios", e instanceof Error ? e.message : e);
    return [];
  }
}

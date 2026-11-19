/**
 * Capa de acceso a datos de la web pública.
 * Hoy lee contenido de demostración; en la Fase 3 estas mismas funciones
 * consultarán Supabase sin cambiar las páginas que las usan.
 */
import {
  demoCategories,
  demoProducts,
  demoProjects,
  demoServices,
  type Category,
  type Product,
  type Project,
  type Service,
} from "./demo-data";

export type { Category, Product, Project, Service };

export async function getCategories(): Promise<Category[]> {
  return demoCategories.filter((c) => c.active).sort((a, b) => a.order - b.order);
}

export async function getCategory(slug: string): Promise<Category | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

export async function getProducts(opts?: {
  categorySlug?: string;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Product[]> {
  let list = demoProducts.filter((p) => p.published);
  if (opts?.categorySlug) list = list.filter((p) => p.categorySlug === opts.categorySlug);
  if (opts?.featuredOnly) list = list.filter((p) => p.featured);
  return opts?.limit ? list.slice(0, opts.limit) : list;
}

export async function getProduct(slug: string): Promise<Product | null> {
  return demoProducts.find((p) => p.slug === slug && p.published) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  return (await getProducts({ categorySlug: product.categorySlug }))
    .filter((p) => p.id !== product.id)
    .slice(0, limit);
}

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

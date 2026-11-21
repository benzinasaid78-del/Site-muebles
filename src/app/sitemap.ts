import type { MetadataRoute } from "next";
import { getCategories, getProducts, getProjects } from "@/lib/data";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, projects] = await Promise.all([
    getCategories(),
    getProducts(),
    getProjects(),
  ]);
  const url = (path: string) => `${site.url}${path}`;

  return [
    ...["", "/colecciones", "/productos", "/proyectos", "/servicios", "/nosotros", "/contacto"].map(
      (p) => ({ url: url(p) }),
    ),
    ...categories.map((c) => ({ url: url(`/colecciones/${c.slug}`) })),
    ...products.map((p) => ({ url: url(`/productos/${p.slug}`) })),
    ...projects.map((p) => ({ url: url(`/proyectos/${p.slug}`) })),
  ];
}

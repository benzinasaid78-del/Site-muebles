/**
 * CONTENIDO DE DEMOSTRACIÓN — solo para desarrollo.
 * No contiene datos reales de la empresa, precios ni fotografías.
 * En la Fase 3 se sustituye por consultas a PostgreSQL (Supabase).
 */

/** Imagen de la mediateca (URL pública + texto alternativo). */
export type MediaRef = { url: string; alt: string };

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  seoTitle: string;
  seoDescription: string;
  cover?: MediaRef;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categorySlug: string;
  brand?: string;
  reference?: string;
  price?: number;
  showPrice: boolean;
  dimensions?: string;
  materials?: string;
  finishes?: string;
  featured: boolean;
  published: boolean;
  /** Imágenes del producto; la primera es la principal. */
  images?: MediaRef[];
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  featured: boolean;
};

export type Service = {
  slug: string;
  title: string;
  description: string;
  /** Los servicios sin confirmar no se muestran en la web pública. */
  confirmed: boolean;
};

const categoryNames: Array<[string, string]> = [
  ["salones", "Salones"],
  ["dormitorios", "Dormitorios"],
  ["cocinas", "Cocinas"],
  ["sofas", "Sofás"],
  ["colchones", "Colchones"],
  ["juvenil", "Juvenil"],
  ["armarios", "Armarios"],
  ["mesas-y-sillas", "Mesas y sillas"],
  ["decoracion", "Decoración"],
];

export const demoCategories: Category[] = categoryNames.map(
  ([slug, name], i) => ({
    id: `cat-${i + 1}`,
    slug,
    name,
    description: `Texto de demostración para la colección ${name}. Se edita desde el panel de administración.`,
    order: i + 1,
    active: true,
    seoTitle: `${name} | Muebles Angulo`,
    seoDescription: `Descubre nuestra colección de ${name.toLowerCase()} en Barbastro, Huesca.`,
  }),
);

export const demoProducts: Product[] = demoCategories.flatMap((cat, idx) =>
  [1, 2].map((n) => ({
    id: `prod-${cat.slug}-${n}`,
    slug: `${cat.slug}-demo-${n}`,
    name: `${cat.name} — modelo de demostración ${n}`,
    shortDescription: "Producto de demostración. Sustituir por contenido real.",
    description:
      "Descripción de demostración. Este texto, las imágenes y las especificaciones se gestionarán desde el panel de administración.",
    categorySlug: cat.slug,
    showPrice: false,
    featured: n === 1 && idx < 6,
    published: true,
  })),
);

export const demoProjects: Project[] = [
  ["a", "Proyecto de demostración A", "Salón"],
  ["b", "Proyecto de demostración B", "Cocina"],
  ["c", "Proyecto de demostración C", "Dormitorio"],
].map(([key, title, category], i) => ({
  id: `proj-${key}`,
  slug: `proyecto-demo-${key}`,
  title: title as string,
  description:
    "Descripción de demostración de un proyecto. Sustituir por un proyecto real con sus fotografías.",
  category: category as string,
  publishedAt: `2026-0${i + 1}-15`,
  featured: true,
}));

export const demoServices: Service[] = [
  ["diseno-personalizado", "Diseño personalizado", true],
  ["asesoramiento-profesional", "Asesoramiento profesional", true],
  ["medicion-a-domicilio", "Medición a domicilio", true],
  ["transporte-y-montaje", "Transporte y montaje", true],
  ["financiacion", "Financiación", false],
  ["diseno-de-cocinas", "Diseño de cocinas", true],
  ["proyectos-a-medida", "Proyectos a medida", true],
].map(([slug, title, confirmed]) => ({
  slug: slug as string,
  title: title as string,
  description:
    "Texto de demostración. La empresa debe confirmar y redactar la descripción real de este servicio.",
  confirmed: confirmed as boolean,
}));

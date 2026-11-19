import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/cards";
import { Container, PageIntro } from "@/components/ui";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Productos",
  description: "Catálogo de muebles y decoración de Muebles Angulo.",
};

type Props = { searchParams: Promise<{ categoria?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const categories = await getCategories();
  // Solo se acepta un slug de categoría existente; cualquier otro valor se ignora.
  const active = categories.find((c) => c.slug === categoria);
  const products = await getProducts({ categorySlug: active?.slug });
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));

  const chip = (isActive: boolean) =>
    `inline-block border px-4 py-2 text-sm transition-colors ${
      isActive ? "border-carbon bg-carbon text-crema" : "border-carbon/30 hover:border-carbon"
    }`;

  return (
    <>
      <PageIntro
        eyebrow="Catálogo"
        title="Nuestros productos"
        intro="Consulta disponibilidad y condiciones contactando con nosotros. No se realizan ventas online."
      />
      <Container className="pt-10 sm:pt-14">
        <nav aria-label="Filtrar por colección">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link href="/productos" className={chip(!active)} aria-current={!active ? "true" : undefined}>
                Todos
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/productos?categoria=${c.slug}`}
                  className={chip(active?.slug === c.slug)}
                  aria-current={active?.slug === c.slug ? "true" : undefined}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {products.length === 0 ? (
          <p className="mt-12">No hay productos en esta categoría.</p>
        ) : (
          <ul className="mt-12 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} categoryName={categoryName.get(p.categorySlug)} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}

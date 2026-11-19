import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/cards";
import { Container, PageIntro } from "@/components/ui";
import { getCategory, getProducts } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return { title: category.seoTitle, description: category.seoDescription };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  const products = await getProducts({ categorySlug: category.slug });

  return (
    <>
      <PageIntro eyebrow="Colección" title={category.name} intro={category.description} />
      <Container className="pt-12 sm:pt-16">
        {products.length === 0 ? (
          <p>Todavía no hay productos publicados en esta colección.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}

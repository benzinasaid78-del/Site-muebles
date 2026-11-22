import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RatingStars } from "@/components/RatingStars";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/cards";
import { ButtonLink, Container, ImagePlaceholder, SectionHeading } from "@/components/ui";
import { getCategory, getProduct, getRelatedProducts } from "@/lib/data";
import { getCompany } from "@/lib/company";
import { whatsappLink } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return { title: product.name, description: product.shortDescription };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const [category, related] = await Promise.all([
    getCategory(product.categorySlug),
    getRelatedProducts(product),
  ]);

  const specs: Array<[string, string | undefined]> = [
    ["Marca", product.brand],
    ["Referencia", product.reference],
    ["Dimensiones", product.dimensions],
    ["Materiales", product.materials],
    ["Acabados", product.finishes],
  ];
  const visibleSpecs = specs.filter(([, v]) => v);
  const images = product.images ?? [];

  // Solo se abre WhatsApp si el usuario pulsa; nunca se envía nada automáticamente.
  const company = await getCompany();
  const wa = whatsappLink(company.whatsapp, `Hola, me interesa el producto "${product.name}". ¿Podéis darme más información?`);

  return (
    <>
      <Container className="pt-8 sm:pt-12">
        <nav aria-label="Ruta de navegación" className="text-sm text-carbon/70">
          <Link href="/productos" className="hover:underline">
            Productos
          </Link>
          {category && (
            <>
              {" / "}
              <Link href={`/colecciones/${category.slug}`} className="hover:underline">
                {category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            {images.length > 0 ? (
              <>
                <div className="relative aspect-square bg-white">
                  <Image
                    src={images[0]!.url}
                    alt={images[0]!.alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain p-4 sm:p-6"
                  />
                </div>
                {images.length > 1 && (
                  <ul className="mt-3 grid grid-cols-3 gap-3">
                    {images.slice(1).map((img) => (
                      <li key={img.url} className="relative aspect-square bg-white">
                        <Image
                          src={img.url}
                          alt={img.alt}
                          fill
                          sizes="(min-width: 1024px) 17vw, 33vw"
                          className="object-contain p-2"
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <ImagePlaceholder label="Foto próximamente" ratio="aspect-square" tone="bg-white" />
            )}
          </div>

          <div>
            {category && (
              <p className="text-xs uppercase tracking-[0.2em] text-madera-oscuro">{category.name}</p>
            )}
            <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">{product.name}</h1>
            <div className="mt-6 flex items-start justify-between gap-4">
              <p className="flex h-8 items-center text-lg">
                {product.showPrice && product.price !== undefined
                  ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(product.price)
                  : null}
              </p>
              <RatingStars
                productId={product.id}
                name={product.name}
                avg={product.ratingAvg}
                count={product.ratingCount}
              />
            </div>
            <p className="mt-1 text-right text-xs text-carbon/60">Valoraciones de visitantes, sin verificar.</p>
            <p className="mt-6 leading-relaxed text-carbon/80">{product.description}</p>

            {visibleSpecs.length > 0 && (
              <dl className="mt-8 divide-y divide-arena border-y border-arena text-sm">
                {visibleSpecs.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-6 py-3">
                    <dt className="text-carbon/70">{label}</dt>
                    <dd className="text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {wa && (
                <ButtonLink href={wa} external>
                  Consultar por WhatsApp
                </ButtonLink>
              )}
              <ButtonLink
                href={`/contacto?producto=${encodeURIComponent(product.slug)}`}
                variant={wa ? "secondary" : "primary"}
              >
                Pedir información
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section className="pt-20 sm:pt-28">
          <Container>
            <SectionHeading title="Productos relacionados" />
            <ul className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}

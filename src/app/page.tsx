import Link from "next/link";
import { CategoryCard, ProductCard, ProjectCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Container, ImagePlaceholder, SectionHeading } from "@/components/ui";
import { getCategories, getProducts, getProjects, getServices } from "@/lib/data";
import { getCompany } from "@/lib/company";
import { pending, site } from "@/lib/site";

export default async function HomePage() {
  const [categories, products, projects, services] = await Promise.all([
    getCategories(),
    getProducts({ featuredOnly: true, limit: 4 }),
    getProjects({ featuredOnly: true }),
    getServices(),
  ]);
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
  const company = await getCompany();

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <ImagePlaceholder
          label="Imagen principal de demostración (se edita desde el panel)"
          ratio="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]"
          tone="bg-arena"
        />
        <div className="absolute inset-0 flex items-end">
          <Container className="w-full pb-10 sm:pb-16">
            <div className="max-w-xl bg-crema/95 p-6 sm:p-10">
              <h1 className="font-heading text-3xl leading-tight sm:text-5xl">
                Espacios que reflejan tu forma de vivir.
              </h1>
              <p className="mt-4 leading-relaxed text-carbon/80">
                Descubre nuestras colecciones y encuentra inspiración para crear el hogar que
                imaginas.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/colecciones">Ver colecciones</ButtonLink>
                <ButtonLink href="/contacto" variant="secondary">
                  Contacta con nosotros
                </ButtonLink>
              </div>
            </div>
          </Container>
        </div>
      </section>

      {/* Colecciones */}
      <section className="pt-20 sm:pt-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Colecciones"
              title="Cada estancia, a tu manera"
              action={
                <Link href="/colecciones" className="text-sm underline underline-offset-4">
                  Ver todas
                </Link>
              }
            />
          </Reveal>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <CategoryCard category={c} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Productos destacados (solo si hay alguno marcado como destacado y publicado) */}
      {products.length > 0 && (
      <section className="pt-20 sm:pt-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Selección"
              title="Productos destacados"
              action={
                <Link href="/productos" className="text-sm underline underline-offset-4">
                  Ver catálogo
                </Link>
              }
            />
          </Reveal>
          <ul className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} categoryName={categoryName.get(p.categorySlug)} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
      )}

      {/* Servicios (solo si hay alguno publicado) */}
      {services.length > 0 && (
      <section className="mt-20 bg-arena py-20 sm:mt-28 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Servicios"
            title="Te acompañamos en todo el proceso"
            action={
              <Link href="/servicios" className="text-sm underline underline-offset-4">
                Todos los servicios
              </Link>
            }
          />
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((s) => (
              <li key={s.slug} className="border-t border-carbon/30 pt-5">
                <h3 className="font-heading text-xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-carbon/80">{s.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      )}

      {/* Proyectos (solo si hay alguno destacado y publicado) */}
      {projects.length > 0 && (
      <section className="pt-20 sm:pt-28">
        <Container>
          <SectionHeading
            eyebrow="Proyectos"
            title="Inspiración real"
            action={
              <Link href="/proyectos" className="text-sm underline underline-offset-4">
                Ver proyectos
              </Link>
            }
          />
          <ul className="grid gap-x-5 gap-y-10 md:grid-cols-3">
            {projects.map((p) => (
              <li key={p.id}>
                <ProjectCard project={p} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
      )}

      {/* Historia de la marca */}
      <section className="pt-20 sm:pt-28">
        <Container className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <ImagePlaceholder label="Foto del showroom (demostración)" ratio="aspect-[4/3]" />
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-madera-oscuro">
              Nuestra historia
            </p>
            <h2 className="font-heading text-3xl leading-tight sm:text-4xl">
              Una forma cercana de entender el mobiliario
            </h2>
            <p className="mt-4 leading-relaxed text-carbon/80">
              Texto provisional. La historia, la trayectoria y los valores reales de Muebles Angulo
              deben ser aportados y verificados por la empresa antes de publicar.
            </p>
            <div className="mt-7">
              <ButtonLink href="/nosotros" variant="secondary">
                Conócenos
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Showroom + CTA */}
      <section className="mt-20 bg-carbon py-20 text-crema sm:mt-28 sm:py-24">
        <Container className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl leading-tight sm:text-4xl">Visita nuestra tienda</h2>
            <p className="mt-4 leading-relaxed text-crema/80">
              {site.locality}, {site.province}
            </p>
            <p className="mt-2 text-sm text-crema/80">{pending(company.address, "dirección oficial")}</p>
            <p className="mt-1 text-sm text-crema/80">{pending(company.hours, "horario")}</p>
          </div>
          <div className="md:text-right">
            <p className="max-w-md leading-relaxed text-crema/80 md:ml-auto">
              ¿Tienes un proyecto en mente? Cuéntanos qué necesitas y te responderemos.
            </p>
            <div className="mt-7">
              <ButtonLink href="/contacto" variant="light">
                Pedir información
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

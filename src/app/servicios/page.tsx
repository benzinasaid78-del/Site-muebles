import type { Metadata } from "next";
import { ButtonLink, Container, PageIntro } from "@/components/ui";
import { getServices } from "@/lib/data";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Servicios de Muebles Angulo: diseño, asesoramiento, medición, montaje y proyectos a medida.",
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageIntro
        eyebrow="Servicios"
        title="Más que muebles"
        intro="Te acompañamos desde la primera idea hasta que tu espacio está terminado."
      />
      <Container className="pt-12 sm:pt-16">
        {services.length === 0 ? (
          <p className="text-carbon/70">
            Cuéntanos qué necesitas y te informaremos de cómo podemos ayudarte.
          </p>
        ) : (
          <ol className="grid gap-x-12 gap-y-10 md:grid-cols-2">
            {services.map((s, i) => (
              <li key={s.slug} className="border-t border-carbon/30 pt-6">
                <p className="text-sm text-madera-oscuro">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="mt-1 font-heading text-2xl">{s.title}</h2>
                <p className="mt-3 leading-relaxed text-carbon/80">{s.description}</p>
              </li>
            ))}
          </ol>
        )}
        <div className="mt-16">
          <ButtonLink href="/contacto">Hablar con nosotros</ButtonLink>
        </div>
      </Container>
    </>
  );
}

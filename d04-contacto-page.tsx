import type { Metadata } from "next";
import { Container, PageIntro } from "@/components/ui";
import { getProduct } from "@/lib/data";
import { getCompany } from "@/lib/company";
import { pending, site } from "@/lib/site";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta con Muebles Angulo en Barbastro, Huesca.",
};

type Props = { searchParams: Promise<{ producto?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const { producto } = await searchParams;
  const company = await getCompany();
  // Solo se usa el nombre de un producto que exista; el valor de la URL nunca se pinta tal cual.
  const product = producto ? await getProduct(producto) : null;
  const defaultSubject = product ? `Consulta sobre: ${product.name}` : "";

  return (
    <>
      <PageIntro
        eyebrow="Contacto"
        title="Hablemos de tu proyecto"
        intro="Escríbenos y te responderemos lo antes posible."
      />
      <Container className="grid gap-14 pt-12 sm:pt-16 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ContactForm defaultSubject={defaultSubject} />
        </div>

        <aside className="lg:col-span-2">
          <h2 className="font-heading text-2xl">Datos de contacto</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-carbon/70">Dirección</dt>
              <dd>{pending(company.address, "dirección oficial")}</dd>
              <dd>{site.locality}, {site.province}</dd>
            </div>
            <div>
              <dt className="text-carbon/70">Teléfono</dt>
              <dd>{pending(company.phone, "teléfono")}</dd>
            </div>
            <div>
              <dt className="text-carbon/70">WhatsApp</dt>
              <dd>{pending(company.whatsapp, "número de WhatsApp")}</dd>
            </div>
            <div>
              <dt className="text-carbon/70">Correo electrónico</dt>
              <dd>{pending(company.email, "correo electrónico")}</dd>
            </div>
            <div>
              <dt className="text-carbon/70">Horario</dt>
              <dd>{pending(company.hours, "horario")}</dd>
            </div>
          </dl>
          {/* Google Maps: se añade cuando haya dirección verificada y tras el consentimiento de cookies (Fase 7). */}
          <div className="mt-8 flex aspect-[4/3] items-center justify-center bg-arena px-4 text-center text-xs uppercase tracking-[0.15em] text-carbon/60">
            Mapa: pendiente de dirección verificada
          </div>
        </aside>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, PageIntro } from "@/components/ui";
import { pending, site } from "@/lib/site";

const pages: Record<string, { title: string; sections: Array<[string, string]> }> = {
  "aviso-legal": {
    title: "Aviso legal",
    sections: [
      [
        "Datos identificativos",
        `Titular: ${pending(site.legalName, "razón social")}. NIF/CIF: ${pending(site.taxId, "NIF/CIF")}. Domicilio: ${pending(site.address, "dirección oficial")}. Correo: ${pending(site.email, "correo electrónico")}. Datos de inscripción registral: [PENDIENTE: si procede].`,
      ],
      ["Objeto", "[PENDIENTE: texto legal revisado por la empresa o su asesor.]"],
    ],
  },
  "politica-de-privacidad": {
    title: "Política de privacidad",
    sections: [
      ["Responsable del tratamiento", `${pending(site.legalName, "razón social")}, ${pending(site.address, "dirección oficial")}.`],
      ["Finalidad, base jurídica y derechos", "[PENDIENTE: texto conforme al RGPD y la LOPDGDD, revisado por la empresa o su asesor.]"],
    ],
  },
  "politica-de-cookies": {
    title: "Política de cookies",
    sections: [
      ["Cookies utilizadas", "[PENDIENTE: listado real de cookies una vez definidas las herramientas usadas. Actualmente solo se usa almacenamiento técnico para recordar la elección sobre cookies.]"],
    ],
  },
  "condiciones-de-uso": {
    title: "Condiciones de uso",
    sections: [["Condiciones", "[PENDIENTE: texto si la empresa lo considera necesario.]"]],
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug];
  return page ? { title: page.title } : {};
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();

  return (
    <>
      <PageIntro title={page.title} intro="BORRADOR: este texto debe ser verificado por la empresa antes de publicar." />
      <Container className="max-w-3xl pt-8 sm:pt-12">
        <div className="legal-text">
          {page.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2>{heading}</h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}

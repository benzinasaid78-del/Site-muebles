import type { Metadata } from "next";
import { Container, ImagePlaceholder, PageIntro, SectionHeading } from "@/components/ui";
import { getCompany } from "@/lib/company";
import Image from "next/image";
import { getSiteContent } from "@/lib/texts";
import { pending, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce a Muebles Angulo, tu tienda de muebles y decoración en Barbastro.",
};

export default async function AboutPage() {
  const company = await getCompany();
  const { texts, about, team } = await getSiteContent();
  return (
    <>
      <PageIntro
        eyebrow="Nosotros"
        title="Muebles Angulo"
        intro={texts.about_intro}
      />
      <Container className="grid gap-10 pt-12 md:grid-cols-2 md:gap-16 sm:pt-16">
        {about ? (
          <div className="relative aspect-[4/3] bg-arena">
            <Image src={about.url} alt={about.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        ) : (
          <ImagePlaceholder label="Foto del showroom (demostración)" ratio="aspect-[4/3]" />
        )}
        <div>
          <h2 className="font-heading text-2xl">Nuestra historia</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-carbon/80">
            {texts.about_history}
          </p>
          <h2 className="mt-8 font-heading text-2xl">Nuestros valores</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-carbon/80">
            {texts.about_values}
          </p>
        </div>
      </Container>

      {team.length > 0 && (
        <Container className="pt-20 sm:pt-28">
          <SectionHeading title="El equipo" />
          <ul className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {team.map((m) => (
              <li key={m.name}>
                {m.image ? (
                  <div className="relative aspect-[3/4] bg-arena">
                    <Image src={m.image.url} alt={m.image.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                  </div>
                ) : (
                  <ImagePlaceholder label={m.name} ratio="aspect-[3/4]" />
                )}
                <p className="mt-3 font-heading text-lg">{m.name}</p>
                {m.role && <p className="text-sm text-carbon/70">{m.role}</p>}
              </li>
            ))}
          </ul>
        </Container>
      )}

      <Container className="pt-20 sm:pt-28">
        <h2 className="font-heading text-2xl">Datos de la empresa</h2>
        <dl className="mt-4 divide-y divide-arena border-y border-arena text-sm">
          {(
            [
              ["Denominación", pending(company.legalName, "razón social")],
              ["NIF/CIF", pending(company.taxId, "NIF/CIF")],
              ["Dirección", pending(company.address, "dirección oficial")],
              ["Localidad", `${site.locality}, ${site.province}`],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-6 py-3">
              <dt className="text-carbon/70">{label}</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </>
  );
}

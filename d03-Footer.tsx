import Link from "next/link";
import { getCompany } from "@/lib/company";
import { pending, site } from "@/lib/site";
import { Container } from "./ui";

const legal = [
  { href: "/legal/aviso-legal", label: "Aviso legal" },
  { href: "/legal/politica-de-privacidad", label: "Política de privacidad" },
  { href: "/legal/politica-de-cookies", label: "Política de cookies" },
  { href: "/legal/condiciones-de-uso", label: "Condiciones de uso" },
];

export async function Footer() {
  const company = await getCompany();
  return (
    <footer className="mt-24 bg-carbon text-crema">
      <Container className="grid gap-12 py-16 md:grid-cols-3">
        <div>
          <p className="font-heading text-2xl tracking-[0.12em]">MUEBLES ANGULO</p>
          <p className="mt-4 text-sm leading-relaxed text-crema/80">
            Mobiliario y decoración en {site.locality}, {site.province}.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-lg">Contacto</h2>
          <address className="mt-4 space-y-1 text-sm not-italic leading-relaxed text-crema/80">
            <p>{pending(company.address, "dirección oficial")}</p>
            <p>{pending(company.phone, "teléfono")}</p>
            <p>{pending(company.email, "correo electrónico")}</p>
            <p>{pending(company.hours, "horario")}</p>
          </address>
        </div>

        <div>
          <h2 className="font-heading text-lg">Información legal</h2>
          <ul className="mt-4 space-y-2 text-sm text-crema/80">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <div className="border-t border-crema/15">
        <Container className="py-6 text-xs text-crema/70">
          © {new Date().getFullYear()} {company.legalName ?? site.name}. Todos los derechos reservados.
        </Container>
      </div>
    </footer>
  );
}

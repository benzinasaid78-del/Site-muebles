"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Container } from "./ui";

const nav = [
  { href: "/colecciones", label: "Colecciones" },
  { href: "/productos", label: "Productos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  // El menú se cierra solo al navegar: solo está abierto si se abrió en esta ruta.
  const open = openPath === pathname;

  return (
    <header className="sticky top-0 z-40 border-b border-arena bg-crema/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between sm:h-20">
        {/* Logotipo provisional en texto: pendiente del logo oficial. */}
        <Link href="/" className="font-heading text-xl tracking-[0.12em] sm:text-2xl">
          MUEBLES ANGULO
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-9 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                  className="py-2 hover:underline hover:underline-offset-8 aria-[current=page]:underline aria-[current=page]:underline-offset-8"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="-mr-2 p-2 text-sm lg:hidden"
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpenPath(open ? null : pathname)}
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </Container>

      {open && (
        <nav id="menu-movil" aria-label="Principal (móvil)" className="border-t border-arena lg:hidden">
          <ul className="px-5 py-4">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block border-b border-arena py-4 font-heading text-lg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

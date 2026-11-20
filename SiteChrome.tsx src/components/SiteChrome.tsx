"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Muestra la cabecera, el pie y el aviso de cookies solo en la web pública.
 * En /admin se muestra únicamente el contenido (el panel tiene su propio diseño).
 */
export function SiteChrome({
  header,
  footer,
  banner,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  banner: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <main id="contenido">{children}</main>;
  }

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      {header}
      <main id="contenido">{children}</main>
      {footer}
      {banner}
    </>
  );
}

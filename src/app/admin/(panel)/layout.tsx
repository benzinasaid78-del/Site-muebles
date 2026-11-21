import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { requireProfile } from "@/lib/auth";
import { logout } from "../actions";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s | Panel Muebles Angulo" },
  robots: { index: false, follow: false },
};

// Secciones del panel. Las marcadas "pronto" se activan en la Fase 5.
const sections: Array<{ label: string; href?: string }> = [
  { label: "Resumen", href: "/admin" },
  { label: "Productos", href: "/admin/productos" },
  { label: "Categorías", href: "/admin/categorias" },
  { label: "Proyectos" },
  { label: "Portada" },
  { label: "Contenido" },
  { label: "Medios", href: "/admin/medios" },
  { label: "Mensajes" },
  { label: "Ajustes", href: "/admin/ajustes" },
  { label: "Usuarios" },
  { label: "Actividad" },
];

function Nav() {
  return (
    <ul className="space-y-1 text-sm">
      {sections.map((s) => (
        <li key={s.label}>
          {s.href ? (
            <Link href={s.href} className="block px-3 py-2.5 hover:bg-arena">
              {s.label}
            </Link>
          ) : (
            <span className="flex items-center justify-between px-3 py-2.5 text-carbon/50">
              {s.label}
              <span className="text-xs">pronto</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function PanelLayout({ children }: { children: ReactNode }) {
  // Cada petición vuelve a comprobar sesión y cuenta activa en el servidor.
  const profile = await requireProfile();

  const account = (
    <div className="border-t border-arena p-4 text-sm">
      <p className="font-medium">{profile.fullName ?? profile.email}</p>
      <p className="text-carbon/70">{profile.roleName}</p>
      <form action={logout} className="mt-3">
        <button type="submit" className="border border-carbon px-4 py-2 text-sm hover:bg-carbon hover:text-crema">
          Cerrar sesión
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Escritorio: barra lateral fija */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-arena bg-white lg:flex">
        <p className="p-5 font-heading text-lg tracking-[0.12em]">MUEBLES ANGULO</p>
        <nav aria-label="Panel" className="flex-1 px-2">
          <Nav />
        </nav>
        {account}
      </aside>

      {/* Móvil y tableta: menú desplegable */}
      <header className="border-b border-arena bg-white lg:hidden">
        <details>
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span className="font-heading tracking-[0.12em]">MUEBLES ANGULO</span>
            <span className="text-sm">Menú</span>
          </summary>
          <nav aria-label="Panel (móvil)" className="px-2 pb-2">
            <Nav />
          </nav>
          {account}
        </details>
      </header>

      <div className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">{children}</div>
    </div>
  );
}

/**
 * Datos fijos de la marca. Los datos de contacto y legales NO están aquí:
 * los edita el administrador en /admin/ajustes y se leen con getCompany()
 * (src/lib/company.ts). No se inventa ningún dato.
 */
export const site = {
  name: "Muebles Angulo",
  locality: "Barbastro",
  province: "Huesca",
  country: "España",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export function pending(value: string | null, label: string): string {
  return value ?? `[PENDIENTE: ${label}]`;
}

/** Enlace de WhatsApp con mensaje prellenado. Devuelve null si no hay número. */
export function whatsappLink(whatsapp: string | null, message: string): string | null {
  if (!whatsapp) return null;
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
}

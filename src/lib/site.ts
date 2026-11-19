/**
 * Datos de la empresa.
 *
 * IMPORTANTE: no se inventa ningún dato. Todo valor `null` es un dato PENDIENTE
 * de verificar por la empresa. En la Fase 5 estos valores pasarán a la tabla
 * `site_settings` y se editarán desde /admin.
 */
export const site = {
  name: "Muebles Angulo",
  locality: "Barbastro",
  province: "Huesca",
  country: "España",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  legalName: null as string | null,
  taxId: null as string | null,
  address: null as string | null,
  phone: null as string | null,
  /** Solo dígitos con prefijo de país, p. ej. 34XXXXXXXXX. */
  whatsapp: null as string | null,
  email: null as string | null,
  hours: null as string | null,
  financingConfirmed: false,
};

export function pending(value: string | null, label: string): string {
  return value ?? `[PENDIENTE: ${label}]`;
}

/** Enlace de WhatsApp con mensaje prellenado. Devuelve null si no hay número. */
export function whatsappLink(message: string): string | null {
  if (!site.whatsapp) return null;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

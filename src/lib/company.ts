import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Datos de la empresa que edita el administrador desde /admin/ajustes.
 * Cualquier valor vacío es un dato PENDIENTE: nunca se inventa nada.
 */
export type Company = {
  legalName: string | null;
  taxId: string | null;
  address: string | null;
  phone: string | null;
  /** Solo dígitos con prefijo de país, p. ej. 34XXXXXXXXX. */
  whatsapp: string | null;
  email: string | null;
  hours: string | null;
  financingConfirmed: boolean;
  instagram: string | null;
  facebook: string | null;
};

export const emptyCompany: Company = {
  legalName: null,
  taxId: null,
  address: null,
  phone: null,
  whatsapp: null,
  email: null,
  hours: null,
  financingConfirmed: false,
  instagram: null,
  facebook: null,
};

type Json = Record<string, unknown> | null | undefined;

function str(obj: Json, key: string): string | null {
  const v = obj?.[key];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

/** Convierte las filas de site_settings en el objeto Company. */
export function companyFromSettings(rows: Array<{ key: string; value: unknown }>): Company {
  const byKey = new Map(rows.map((r) => [r.key, r.value as Json]));
  const company = byKey.get("company");
  const hours = byKey.get("hours");
  const social = byKey.get("social");
  const financing = byKey.get("financing");
  return {
    legalName: str(company, "legal_name"),
    taxId: str(company, "tax_id"),
    address: str(company, "address"),
    phone: str(company, "phone"),
    whatsapp: str(company, "whatsapp"),
    email: str(company, "email"),
    hours: str(hours, "text"),
    financingConfirmed: financing?.["confirmed"] === true,
    instagram: str(social, "instagram"),
    facebook: str(social, "facebook"),
  };
}

/** Lectura pública (RLS permite leer site_settings). Si falla, todo queda como pendiente. */
export const getCompany = cache(async (): Promise<Company> => {
  try {
    const { data, error } = await createPublicClient()
      .from("site_settings")
      .select("key, value")
      .in("key", ["company", "hours", "social", "financing"]);
    if (error) throw error;
    return companyFromSettings((data as unknown as Array<{ key: string; value: unknown }> | null) ?? []);
  } catch (e) {
    console.error("[company] ajustes", e instanceof Error ? e.message : e);
    return emptyCompany;
  }
});

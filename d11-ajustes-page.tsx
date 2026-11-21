import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { companyFromSettings } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Ajustes" };

type Search = Promise<{ guardado?: string }>;

export default async function SettingsPage({ searchParams }: { searchParams: Search }) {
  await requirePermission("content.write");
  const sp = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["company", "hours", "social", "financing"]);
  const c = companyFromSettings((data as unknown as Array<{ key: string; value: unknown }> | null) ?? []);

  return (
    <>
      <h1 className="font-heading text-3xl">Ajustes de la empresa</h1>
      <p className="mt-2 max-w-2xl text-sm text-carbon/70">
        Estos datos aparecen en el pie de página, en Contacto, en Nosotros y en los textos legales.
        Los campos vacíos se muestran como «pendiente» en la web.
      </p>

      {sp.guardado && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">
          Ajustes guardados. Se verán en la web en unos segundos.
        </p>
      )}

      <div className="mt-8">
        <SettingsForm
          settings={{
            legal_name: c.legalName ?? "",
            tax_id: c.taxId ?? "",
            address: c.address ?? "",
            phone: c.phone ?? "",
            whatsapp: c.whatsapp ?? "",
            email: c.email ?? "",
            hours: c.hours ?? "",
            financing: c.financingConfirmed,
            instagram: c.instagram ?? "",
            facebook: c.facebook ?? "",
          }}
        />
      </div>
    </>
  );
}

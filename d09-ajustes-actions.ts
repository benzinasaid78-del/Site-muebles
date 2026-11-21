"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { type FormState, fieldErrorsFrom, logActivity, optionalText, snapshot, text } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const httpsUrl = z
  .string()
  .trim()
  .max(200, "Máximo 200 caracteres.")
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Debe empezar por https://")
  .transform((v) => (v === "" ? null : v));

const settingsSchema = z.object({
  legal_name: optionalText(150),
  tax_id: z
    .string()
    .trim()
    .max(20, "Máximo 20 caracteres.")
    .refine((v) => v === "" || /^[A-Za-z0-9.\-]+$/.test(v), "Solo letras, números, puntos y guiones.")
    .transform((v) => (v === "" ? null : v.toUpperCase())),
  address: optionalText(250),
  phone: z
    .string()
    .trim()
    .max(30, "Máximo 30 caracteres.")
    .refine((v) => v === "" || /^[+\d\s().-]{6,30}$/.test(v), "Teléfono no válido.")
    .transform((v) => (v === "" ? null : v)),
  whatsapp: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s+().-]/g, ""))
    .refine((v) => v === "" || /^[1-9]\d{7,14}$/.test(v), "Solo dígitos con prefijo de país (p. ej. 34XXXXXXXXX).")
    .transform((v) => (v === "" ? null : v)),
  email: z
    .string()
    .trim()
    .max(254, "Máximo 254 caracteres.")
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "Correo no válido.")
    .transform((v) => (v === "" ? null : v.toLowerCase())),
  hours: optionalText(500),
  financing: z.boolean(),
  instagram: httpsUrl,
  facebook: httpsUrl,
});

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requirePermission("content.write");
  const values = snapshot(formData);

  const parsed = settingsSchema.safeParse({
    legal_name: text(formData, "legal_name"),
    tax_id: text(formData, "tax_id"),
    address: text(formData, "address"),
    phone: text(formData, "phone"),
    whatsapp: text(formData, "whatsapp"),
    email: text(formData, "email"),
    hours: text(formData, "hours"),
    financing: formData.get("financing") === "on",
    instagram: text(formData, "instagram"),
    facebook: text(formData, "facebook"),
  });
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFrom(parsed.error), values };
  }
  const d = parsed.data;

  const social: Record<string, string> = {};
  if (d.instagram) social["instagram"] = d.instagram;
  if (d.facebook) social["facebook"] = d.facebook;

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert(
    [
      {
        key: "company",
        value: {
          legal_name: d.legal_name,
          tax_id: d.tax_id,
          address: d.address,
          phone: d.phone,
          whatsapp: d.whatsapp,
          email: d.email,
        },
      },
      { key: "hours", value: { text: d.hours } },
      { key: "social", value: social },
      { key: "financing", value: { confirmed: d.financing } },
    ],
    { onConflict: "key" },
  );
  if (error) {
    console.error("[ajustes] error al guardar", { code: error.code, message: error.message });
    return { error: "No se pudo guardar. Inténtalo de nuevo.", values };
  }

  // Solo se registra qué campos cambian de estado, nunca los datos.
  await logActivity(profile.id, "settings.update", "settings", "company");
  revalidatePath("/", "layout");
  redirect("/admin/ajustes?guardado=1");
}

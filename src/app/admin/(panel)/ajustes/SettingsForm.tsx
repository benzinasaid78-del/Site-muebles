"use client";

import { useActionState } from "react";
import { saveSettings } from "./actions";
import type { FormState } from "@/lib/admin";
import { Checkbox, FormError, TextArea, TextField, primaryButton } from "@/components/admin/fields";

export type SettingsValues = {
  legal_name: string;
  tax_id: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
  financing: boolean;
  instagram: string;
  facebook: string;
};

const initial: FormState = {};

export function SettingsForm({ settings }: { settings: SettingsValues }) {
  const [state, action, pending] = useActionState(saveSettings, initial);
  const v = state.values;
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="max-w-2xl space-y-6">
      <FormError message={state.error} />

      <fieldset className="space-y-6">
        <legend className="font-heading text-lg">Datos legales</legend>
        <TextField name="legal_name" label="Razón social" maxLength={150} defaultValue={v?.legal_name ?? settings.legal_name} error={e.legal_name} />
        <TextField name="tax_id" label="NIF/CIF" maxLength={20} defaultValue={v?.tax_id ?? settings.tax_id} error={e.tax_id} />
        <TextField name="address" label="Dirección" maxLength={250} defaultValue={v?.address ?? settings.address} error={e.address} />
      </fieldset>

      <fieldset className="space-y-6 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Contacto</legend>
        <TextField name="phone" label="Teléfono" maxLength={30} defaultValue={v?.phone ?? settings.phone} error={e.phone} />
        <TextField
          name="whatsapp"
          label="WhatsApp"
          hint="Solo dígitos con prefijo de país, sin +. Ejemplo: 34 seguido del número. Activa el botón de WhatsApp en los productos."
          maxLength={25}
          defaultValue={v?.whatsapp ?? settings.whatsapp}
          error={e.whatsapp}
        />
        <TextField name="email" label="Correo electrónico" type="email" maxLength={254} defaultValue={v?.email ?? settings.email} error={e.email} />
        <TextArea
          name="hours"
          label="Horario"
          hint="Texto libre. Ejemplo: Lunes a viernes, 10:00–13:30 y 17:00–20:00."
          rows={3}
          maxLength={500}
          defaultValue={v?.hours ?? settings.hours}
          error={e.hours}
        />
      </fieldset>

      <fieldset className="space-y-6 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Redes sociales (opcional)</legend>
        <TextField name="instagram" label="Instagram (enlace)" hint="Debe empezar por https://" maxLength={200} defaultValue={v?.instagram ?? settings.instagram} error={e.instagram} />
        <TextField name="facebook" label="Facebook (enlace)" hint="Debe empezar por https://" maxLength={200} defaultValue={v?.facebook ?? settings.facebook} error={e.facebook} />
      </fieldset>

      <fieldset className="space-y-4 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Financiación</legend>
        <Checkbox
          name="financing"
          label="La empresa ofrece financiación (confirmado)"
          defaultChecked={v ? v.financing === "on" : settings.financing}
        />
      </fieldset>

      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}

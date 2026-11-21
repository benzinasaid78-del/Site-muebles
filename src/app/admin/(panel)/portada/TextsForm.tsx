"use client";

import { useActionState } from "react";
import { saveTexts } from "./actions";
import type { FormState } from "@/lib/admin";
import type { Texts } from "@/lib/texts";
import { FormError, TextArea, TextField, primaryButton } from "@/components/admin/fields";

const initial: FormState = {};

export function TextsForm({ texts }: { texts: Texts }) {
  const [state, action, pending] = useActionState(saveTexts, initial);
  const v = state.values;
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="max-w-2xl space-y-6">
      <FormError message={state.error} />

      <fieldset className="space-y-6">
        <legend className="font-heading text-lg">Portada: cabecera</legend>
        <TextField name="home_hero_title" label="Título principal" maxLength={120} defaultValue={v?.home_hero_title ?? texts.home_hero_title} error={e.home_hero_title} />
        <TextArea name="home_hero_text" label="Texto bajo el título" rows={3} maxLength={300} defaultValue={v?.home_hero_text ?? texts.home_hero_text} error={e.home_hero_text} />
      </fieldset>

      <fieldset className="space-y-6 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Portada: nuestra historia</legend>
        <TextField name="home_story_title" label="Título" maxLength={120} defaultValue={v?.home_story_title ?? texts.home_story_title} error={e.home_story_title} />
        <TextArea name="home_story_text" label="Texto" rows={6} maxLength={1500} defaultValue={v?.home_story_text ?? texts.home_story_text} error={e.home_story_text} />
      </fieldset>

      <fieldset className="space-y-6 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Página «Nosotros»</legend>
        <TextArea name="about_intro" label="Introducción" rows={3} maxLength={400} defaultValue={v?.about_intro ?? texts.about_intro} error={e.about_intro} />
        <TextArea name="about_history" label="Nuestra historia" rows={8} maxLength={4000} hint="Una línea en blanco separa los párrafos." defaultValue={v?.about_history ?? texts.about_history} error={e.about_history} />
        <TextArea name="about_values" label="Nuestros valores" rows={6} maxLength={3000} defaultValue={v?.about_values ?? texts.about_values} error={e.about_values} />
      </fieldset>

      <p className="text-sm text-carbon/70">
        Si dejas un campo vacío, la web vuelve a mostrar el texto provisional. Escribe solo datos reales y verificados.
      </p>

      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Guardando…" : "Guardar textos"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { saveTexts } from "./actions";
import type { FormState } from "@/lib/admin";
import type { Texts } from "@/lib/texts";
import type { MediaOption } from "@/lib/admin-media";
import { MediaSinglePicker } from "@/components/admin/MediaPicker";
import { FormError, TextArea, TextField, primaryButton } from "@/components/admin/fields";

const initial: FormState = {};

export function TextsForm({ texts, media }: { texts: Texts; media: MediaOption[] }) {
  const [state, action, pending] = useActionState(saveTexts, initial);
  const v = state.values;
  const e = state.fieldErrors ?? {};
  const pick = (name: keyof Texts) => (v?.[name] ?? texts[name]) || null;
  const imageBlock = (name: keyof Texts, label: string) => (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-2">
        <MediaSinglePicker media={media} name={name} selected={pick(name)} />
      </div>
      {e[name] && <p role="alert" className="mt-1 text-sm text-red-800">{e[name]}</p>}
    </div>
  );
  const team = [1, 2, 3, 4] as const;

  return (
    <form action={action} className="max-w-2xl space-y-6">
      <FormError message={state.error} />

      <fieldset className="space-y-6">
        <legend className="font-heading text-lg">Portada: cabecera</legend>
        <TextField name="home_hero_title" label="Título principal" maxLength={120} defaultValue={v?.home_hero_title ?? texts.home_hero_title} error={e.home_hero_title} />
        <TextArea name="home_hero_text" label="Texto bajo el título" rows={3} maxLength={300} defaultValue={v?.home_hero_text ?? texts.home_hero_text} error={e.home_hero_text} />
        {imageBlock("home_hero_image", "Imagen principal (horizontal, mejor 1920×800 o más)")}
      </fieldset>

      <fieldset className="space-y-6 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Portada: nuestra historia</legend>
        <TextField name="home_story_title" label="Título" maxLength={120} defaultValue={v?.home_story_title ?? texts.home_story_title} error={e.home_story_title} />
        <TextArea name="home_story_text" label="Texto" rows={6} maxLength={1500} defaultValue={v?.home_story_text ?? texts.home_story_text} error={e.home_story_text} />
        {imageBlock("home_story_image", "Foto de la tienda / showroom")}
      </fieldset>

      <fieldset className="space-y-6 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Página «Nosotros»</legend>
        <TextArea name="about_intro" label="Introducción" rows={3} maxLength={400} defaultValue={v?.about_intro ?? texts.about_intro} error={e.about_intro} />
        <TextArea name="about_history" label="Nuestra historia" rows={8} maxLength={4000} hint="Una línea en blanco separa los párrafos." defaultValue={v?.about_history ?? texts.about_history} error={e.about_history} />
        <TextArea name="about_values" label="Nuestros valores" rows={6} maxLength={3000} defaultValue={v?.about_values ?? texts.about_values} error={e.about_values} />
        {imageBlock("about_image", "Foto de la página «Nosotros»")}
      </fieldset>

      <fieldset className="space-y-8 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Equipo (opcional)</legend>
        <p className="text-sm text-carbon/70">
          Solo aparecen las personas con nombre. Publica fotos únicamente con su consentimiento. Si no rellenas ninguna, la sección no se muestra.
        </p>
        {team.map((n) => (
          <div key={n} className="space-y-4 border border-arena bg-white p-4">
            <p className="text-sm font-medium">Persona {n}</p>
            <TextField name={`team${n}_name`} label="Nombre" maxLength={80} defaultValue={v?.[`team${n}_name`] ?? texts[`team${n}_name` as keyof Texts]} error={e[`team${n}_name`]} />
            <TextField name={`team${n}_role`} label="Cargo" maxLength={80} defaultValue={v?.[`team${n}_role`] ?? texts[`team${n}_role` as keyof Texts]} error={e[`team${n}_role`]} />
            {imageBlock(`team${n}_image` as keyof Texts, "Foto")}
          </div>
        ))}
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

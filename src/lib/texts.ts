import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

/** Textos editables de la portada y de «Nosotros» (se guardan en site_settings, clave "texts"). */
export type Texts = {
  home_hero_title: string;
  home_hero_text: string;
  home_story_title: string;
  home_story_text: string;
  about_intro: string;
  about_history: string;
  about_values: string;
};

export const textKeys = [
  "home_hero_title",
  "home_hero_text",
  "home_story_title",
  "home_story_text",
  "about_intro",
  "about_history",
  "about_values",
] as const satisfies ReadonlyArray<keyof Texts>;

export const defaultTexts: Texts = {
  home_hero_title: "Espacios que reflejan tu forma de vivir.",
  home_hero_text:
    "Descubre nuestras colecciones y encuentra inspiración para crear el hogar que imaginas.",
  home_story_title: "Una forma cercana de entender el mobiliario",
  home_story_text:
    "Texto provisional. La historia, la trayectoria y los valores reales de Muebles Angulo deben ser aportados y verificados por la empresa antes de publicar.",
  about_intro:
    "Contenido provisional: la historia, la experiencia y los valores deben ser facilitados y verificados por la empresa.",
  about_history:
    "[PENDIENTE: historia real de la empresa. No se publican fechas, premios ni años de experiencia hasta que estén confirmados.]",
  about_values: "[PENDIENTE: valores reales de la empresa.]",
};

/** Mezcla lo guardado con los textos por defecto; un campo vacío vuelve al texto por defecto. */
export function mergeTexts(saved: unknown): Texts {
  const out: Texts = { ...defaultTexts };
  if (saved && typeof saved === "object") {
    const obj = saved as Record<string, unknown>;
    for (const k of textKeys) {
      const v = obj[k];
      if (typeof v === "string" && v.trim() !== "") out[k] = v.trim();
    }
  }
  return out;
}

export const getTexts = cache(async (): Promise<Texts> => {
  try {
    const { data, error } = await createPublicClient()
      .from("site_settings")
      .select("value")
      .eq("key", "texts")
      .maybeSingle();
    if (error) throw error;
    return mergeTexts((data as unknown as { value: unknown } | null)?.value);
  } catch (e) {
    console.error("[texts]", e instanceof Error ? e.message : e);
    return defaultTexts;
  }
});

import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { mediaPublicUrl } from "@/lib/media";

/** Textos editables de la portada y de «Nosotros» (se guardan en site_settings, clave "texts"). */
export type Texts = {
  home_hero_title: string;
  home_hero_text: string;
  home_story_title: string;
  home_story_text: string;
  about_intro: string;
  about_history: string;
  about_values: string;
  /** Ids de imágenes de la mediateca ("" = sin imagen). */
  home_hero_image: string;
  home_story_image: string;
  about_image: string;
  team1_name: string; team1_role: string; team1_image: string;
  team2_name: string; team2_role: string; team2_image: string;
  team3_name: string; team3_role: string; team3_image: string;
  team4_name: string; team4_role: string; team4_image: string;
};

export const textKeys = [
  "home_hero_title",
  "home_hero_text",
  "home_story_title",
  "home_story_text",
  "about_intro",
  "about_history",
  "about_values",
  "home_hero_image",
  "home_story_image",
  "about_image",
  "team1_name", "team1_role", "team1_image",
  "team2_name", "team2_role", "team2_image",
  "team3_name", "team3_role", "team3_image",
  "team4_name", "team4_role", "team4_image",
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
  home_hero_image: "",
  home_story_image: "",
  about_image: "",
  team1_name: "", team1_role: "", team1_image: "",
  team2_name: "", team2_role: "", team2_image: "",
  team3_name: "", team3_role: "", team3_image: "",
  team4_name: "", team4_role: "", team4_image: "",
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

export type SiteMedia = { url: string; alt: string };
export type TeamMember = { name: string; role: string; image?: SiteMedia };

/** Textos + imágenes ya resueltas (URL pública) para la web. */
export const getSiteContent = cache(async () => {
  const texts = await getTexts();
  const ids = [
    texts.home_hero_image,
    texts.home_story_image,
    texts.about_image,
    texts.team1_image,
    texts.team2_image,
    texts.team3_image,
    texts.team4_image,
  ].filter((v) => /^[0-9a-f-]{36}$/i.test(v));

  const byId = new Map<string, SiteMedia>();
  if (ids.length > 0) {
    try {
      const { data, error } = await createPublicClient()
        .from("media_assets")
        .select("id, storage_path, alt_text")
        .in("id", ids)
        .is("deleted_at", null);
      if (error) throw error;
      for (const m of (data as unknown as Array<{ id: string; storage_path: string; alt_text: string | null }> | null) ?? []) {
        byId.set(m.id, { url: mediaPublicUrl(m.storage_path), alt: m.alt_text ?? "" });
      }
    } catch (e) {
      console.error("[texts] imágenes", e instanceof Error ? e.message : e);
    }
  }
  const img = (id: string, alt: string): SiteMedia | undefined => {
    const m = byId.get(id);
    return m ? { url: m.url, alt: m.alt || alt } : undefined;
  };

  const team: TeamMember[] = (
    [
      [texts.team1_name, texts.team1_role, texts.team1_image],
      [texts.team2_name, texts.team2_role, texts.team2_image],
      [texts.team3_name, texts.team3_role, texts.team3_image],
      [texts.team4_name, texts.team4_role, texts.team4_image],
    ] as const
  )
    .filter(([name]) => name !== "")
    .map(([name, role, image]) => ({ name, role, image: img(image, name) }));

  return {
    texts,
    hero: img(texts.home_hero_image, "Muebles Angulo"),
    story: img(texts.home_story_image, "Muebles Angulo"),
    about: img(texts.about_image, "Muebles Angulo"),
    team,
  };
});

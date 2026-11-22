"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { type FormState, fieldErrorsFrom, logActivity, snapshot, text } from "@/lib/admin";
import { resolveImageField } from "@/lib/media-upload";
import { createClient } from "@/lib/supabase/server";

const t = (max: number) =>
  z.string().trim().max(max, `Máximo ${max} caracteres.`);

const imageId = z
  .string()
  .trim()
  .refine((v) => v === "" || z.string().uuid().safeParse(v).success, "Imagen no válida.");

const schema = z.object({
  home_hero_image: imageId,
  home_story_image: imageId,
  about_image: imageId,
  team1_name: t(80), team1_role: t(80), team1_image: imageId,
  team2_name: t(80), team2_role: t(80), team2_image: imageId,
  team3_name: t(80), team3_role: t(80), team3_image: imageId,
  team4_name: t(80), team4_role: t(80), team4_image: imageId,
  home_hero_title: t(120),
  home_hero_text: t(300),
  home_story_title: t(120),
  home_story_text: t(1500),
  about_intro: t(400),
  about_history: t(4000),
  about_values: t(3000),
});

export async function saveTexts(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requirePermission("content.write");
  const values = snapshot(formData);

  const f = (k: string) => text(formData, k);
  const parsed = schema.safeParse({
    home_hero_image: f("home_hero_image"),
    home_story_image: f("home_story_image"),
    about_image: f("about_image"),
    team1_name: f("team1_name"), team1_role: f("team1_role"), team1_image: f("team1_image"),
    team2_name: f("team2_name"), team2_role: f("team2_role"), team2_image: f("team2_image"),
    team3_name: f("team3_name"), team3_role: f("team3_role"), team3_image: f("team3_image"),
    team4_name: f("team4_name"), team4_role: f("team4_role"), team4_image: f("team4_image"),
    home_hero_title: text(formData, "home_hero_title"),
    home_hero_text: text(formData, "home_hero_text"),
    home_story_title: text(formData, "home_story_title"),
    home_story_text: text(formData, "home_story_text"),
    about_intro: text(formData, "about_intro"),
    about_history: text(formData, "about_history"),
    about_values: text(formData, "about_values"),
  });
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFrom(parsed.error), values };
  }

  // Fotos: se sube la nueva (si hay) o se mantiene/quita la actual.
  const data: Record<string, string> = { ...parsed.data };
  for (const key of [
    "home_hero_image", "home_story_image", "about_image",
    "team1_image", "team2_image", "team3_image", "team4_image",
  ]) {
    const r = await resolveImageField(formData, key, profile);
    if (r.error) return { error: r.error, values };
    data[key] = r.id ?? "";
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert([{ key: "texts", value: data }], { onConflict: "key" });
  if (error) {
    console.error("[portada] error al guardar", { code: error.code, message: error.message });
    return { error: "No se pudo guardar. Inténtalo de nuevo.", values };
  }

  await logActivity(profile.id, "texts.update", "settings", "texts");
  revalidatePath("/", "layout");
  redirect("/admin/portada?guardado=1");
}

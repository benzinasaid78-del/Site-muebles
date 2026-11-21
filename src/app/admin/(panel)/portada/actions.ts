"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { type FormState, fieldErrorsFrom, logActivity, snapshot, text } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const t = (max: number) =>
  z.string().trim().max(max, `Máximo ${max} caracteres.`);

const schema = z.object({
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

  const parsed = schema.safeParse({
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert([{ key: "texts", value: parsed.data }], { onConflict: "key" });
  if (error) {
    console.error("[portada] error al guardar", { code: error.code, message: error.message });
    return { error: "No se pudo guardar. Inténtalo de nuevo.", values };
  }

  await logActivity(profile.id, "texts.update", "settings", "texts");
  revalidatePath("/", "layout");
  redirect("/admin/portada?guardado=1");
}

import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { mergeTexts } from "@/lib/texts";
import { loadMediaOptions } from "@/lib/admin-media";
import { createClient } from "@/lib/supabase/server";
import { TextsForm } from "./TextsForm";

export const metadata: Metadata = { title: "Portada y Nosotros" };

type Search = Promise<{ guardado?: string }>;

export default async function TextsPage({ searchParams }: { searchParams: Search }) {
  await requirePermission("content.write");
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "texts").maybeSingle();
  const texts = mergeTexts((data as unknown as { value: unknown } | null)?.value);
  const media = await loadMediaOptions([
    texts.home_hero_image, texts.home_story_image, texts.about_image,
    texts.team1_image, texts.team2_image, texts.team3_image, texts.team4_image,
  ]);

  return (
    <>
      <h1 className="font-heading text-3xl">Portada y Nosotros</h1>
      <p className="mt-2 max-w-2xl text-sm text-carbon/70">
        Textos de la página principal y de «Nosotros». Los datos de contacto y legales se editan en Ajustes.
      </p>
      {sp.guardado && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">
          Textos guardados. Se verán en la web en unos segundos.
        </p>
      )}
      <div className="mt-8">
        <TextsForm texts={texts} media={media} />
      </div>
    </>
  );
}

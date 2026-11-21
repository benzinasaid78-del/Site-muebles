import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { uuidSchema } from "@/lib/admin";
import { loadMediaOptions } from "@/lib/admin-media";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "../ProjectForm";

export const metadata: Metadata = { title: "Editar proyecto" };

type Row = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  project_category: string | null;
  cover_media_id: string | null;
  featured: boolean;
  status: "draft" | "published" | "archived";
  seo_title: string | null;
  seo_description: string | null;
};

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aviso?: string }>;
}) {
  await requirePermission("projects.write");
  const { id } = await params;
  const { aviso } = await searchParams;
  if (!uuidSchema.safeParse(id).success) notFound();

  const supabase = await createClient();
  const [{ data }, { data: imgs }, media] = await Promise.all([
    supabase
      .from("projects")
      .select("id, slug, title, description, project_category, cover_media_id, featured, status, seo_title, seo_description")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("project_images")
      .select("media_id, position")
      .eq("project_id", id)
      .order("position", { ascending: true }),
    loadMediaOptions(),
  ]);
  const p = data as unknown as Row | null;
  if (!p) notFound();
  const images = (imgs as unknown as Array<{ media_id: string }> | null) ?? [];

  return (
    <>
      <h1 className="font-heading text-3xl">Editar proyecto</h1>
      {aviso === "imagenes" && (
        <p role="alert" className="mt-6 border border-red-700 px-4 py-3 text-sm text-red-800">
          El proyecto se guardó, pero las imágenes no. Vuelve a elegirlas y guarda de nuevo.
        </p>
      )}
      <div className="mt-8">
        <ProjectForm
          project={{
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description ?? "",
            project_category: p.project_category ?? "",
            featured: p.featured,
            status: p.status,
            seo_title: p.seo_title ?? "",
            seo_description: p.seo_description ?? "",
          }}
          media={media}
          selectedIds={images.map((i) => i.media_id)}
          mainId={p.cover_media_id}
        />
      </div>
    </>
  );
}

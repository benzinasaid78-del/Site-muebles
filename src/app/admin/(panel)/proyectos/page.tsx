import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { primaryButton, secondaryButton } from "@/components/admin/fields";
import { deleteProject } from "./actions";

export const metadata: Metadata = { title: "Proyectos" };

type Search = Promise<{ guardado?: string; eliminado?: string; error?: string }>;
type Row = { id: string; title: string; status: "draft" | "published" | "archived"; featured: boolean; project_category: string | null };

const statusLabel: Record<Row["status"], string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

export default async function ProjectsAdminPage({ searchParams }: { searchParams: Search }) {
  const profile = await requirePermission("projects.write");
  const sp = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("projects")
    .select("id, title, status, featured, project_category")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(500);
  const rows = (data as unknown as Row[] | null) ?? [];
  const canDelete = profile.permissions.has("projects.delete");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl">Proyectos</h1>
        <Link href="/admin/proyectos/nuevo" className={primaryButton}>
          Nuevo proyecto
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-carbon/70">
        Publica solo proyectos reales de la empresa, con fotografías propias.
      </p>

      {sp.guardado && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">
          Cambios guardados.
        </p>
      )}
      {sp.eliminado && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">
          Proyecto eliminado.
        </p>
      )}
      {sp.error && (
        <p role="alert" className="mt-6 border border-red-700 px-4 py-3 text-sm text-red-800">
          No se pudo completar la acción. Inténtalo de nuevo.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-carbon/70">Todavía no hay proyectos.</p>
      ) : (
        <ul className="mt-8 divide-y divide-arena border-y border-arena bg-white">
          {rows.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div className="min-w-0">
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-carbon/70">
                  {statusLabel[p.status]}
                  {p.featured ? " · Destacado" : ""}
                  {p.project_category ? ` · ${p.project_category}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/proyectos/${p.id}`} className={secondaryButton}>
                  Editar
                </Link>
                {canDelete && (
                  <form action={deleteProject}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      aria-label={`Eliminar ${p.title}`}
                      className="border border-red-700 px-6 py-3 text-sm text-red-800 hover:bg-red-700 hover:text-white"
                    >
                      Eliminar
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

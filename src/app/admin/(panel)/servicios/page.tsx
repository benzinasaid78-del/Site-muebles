import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { primaryButton, secondaryButton } from "@/components/admin/fields";
import { deleteService } from "./actions";

export const metadata: Metadata = { title: "Servicios" };

type Search = Promise<{ guardado?: string; eliminado?: string; error?: string }>;
type Row = { id: string; title: string; slug: string; status: "draft" | "published" | "archived"; display_order: number };

const statusLabel: Record<Row["status"], string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

export default async function ServicesAdminPage({ searchParams }: { searchParams: Search }) {
  await requirePermission("content.write");
  const sp = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("services")
    .select("id, title, slug, status, display_order")
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .order("title", { ascending: true });
  const rows = (data as unknown as Row[] | null) ?? [];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl">Servicios</h1>
        <Link href="/admin/servicios/nuevo" className={primaryButton}>
          Nuevo servicio
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-carbon/70">
        Solo los servicios en estado «Publicado» aparecen en la web. Publica únicamente los que la empresa ofrece de verdad.
      </p>

      {sp.guardado && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">
          Cambios guardados.
        </p>
      )}
      {sp.eliminado && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">
          Servicio eliminado.
        </p>
      )}
      {sp.error && (
        <p role="alert" className="mt-6 border border-red-700 px-4 py-3 text-sm text-red-800">
          No se pudo completar la acción. Inténtalo de nuevo.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-carbon/70">Todavía no hay servicios.</p>
      ) : (
        <ul className="mt-8 divide-y divide-arena border-y border-arena bg-white">
          {rows.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div className="min-w-0">
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-carbon/70">
                  {statusLabel[s.status]} · orden {s.display_order}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/servicios/${s.id}`} className={secondaryButton}>
                  Editar
                </Link>
                <form action={deleteService}>
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    aria-label={`Eliminar ${s.title}`}
                    className="border border-red-700 px-6 py-3 text-sm text-red-800 hover:bg-red-700 hover:text-white"
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

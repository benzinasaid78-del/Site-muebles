import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { primaryButton, secondaryButton } from "@/components/admin/fields";
import { deleteProduct } from "./actions";

export const metadata: Metadata = { title: "Productos" };

type Search = Promise<{ guardado?: string; eliminado?: string; error?: string }>;

type Row = {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  category_id: string | null;
};

const statusLabel: Record<Row["status"], string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

export default async function ProductsPage({ searchParams }: { searchParams: Search }) {
  const profile = await requirePermission("products.write");
  const sp = await searchParams;
  const supabase = await createClient();

  const [{ data }, { data: cats }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, status, featured, category_id")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("categories").select("id, name").is("deleted_at", null),
  ]);
  const rows = (data as unknown as Row[] | null) ?? [];
  const catName = new Map(
    ((cats as unknown as Array<{ id: string; name: string }> | null) ?? []).map((c) => [c.id, c.name]),
  );
  const canDelete = profile.permissions.has("products.delete");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl">Productos</h1>
        <Link href="/admin/productos/nuevo" className={primaryButton}>
          Nuevo producto
        </Link>
      </div>

      {sp.guardado && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">
          Cambios guardados.
        </p>
      )}
      {sp.eliminado && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">
          Producto eliminado.
        </p>
      )}
      {sp.error && (
        <p role="alert" className="mt-6 border border-red-700 px-4 py-3 text-sm text-red-800">
          No se pudo completar la acción. Inténtalo de nuevo.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-carbon/70">Todavía no hay productos.</p>
      ) : (
        <ul className="mt-8 divide-y divide-arena border-y border-arena bg-white">
          {rows.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div className="min-w-0">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-carbon/70">
                  {statusLabel[p.status]}
                  {p.featured ? " · Destacado" : ""} ·{" "}
                  {p.category_id ? (catName.get(p.category_id) ?? "—") : "Sin categoría"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/productos/${p.id}`} className={secondaryButton}>
                  Editar
                </Link>
                {canDelete && (
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      aria-label={`Eliminar ${p.name}`}
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

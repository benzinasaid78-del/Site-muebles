import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { secondaryButton, primaryButton } from "@/components/admin/fields";
import { deleteCategory } from "./actions";

export const metadata: Metadata = { title: "Categorías" };

type Search = Promise<{ guardado?: string; eliminada?: string; error?: string }>;

type Row = { id: string; name: string; slug: string; display_order: number; active: boolean };

const errorMessages: Record<string, string> = {
  "con-productos": "No se puede eliminar: la categoría todavía tiene productos. Muévelos o elimínalos primero.",
  invalida: "Categoría no válida.",
  fallo: "No se pudo eliminar. Inténtalo de nuevo.",
};

export default async function CategoriesPage({ searchParams }: { searchParams: Search }) {
  // Ver la lista exige poder editar categorías (Super Admin, Admin y Editor no la tienen todos).
  const profile = await requirePermission("categories.write");
  const sp = await searchParams;
  const supabase = await createClient();

  const [{ data }, { data: prodData }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, display_order, active")
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("products").select("category_id").is("deleted_at", null),
  ]);

  const rows = (data as unknown as Row[] | null) ?? [];
  const counts = new Map<string, number>();
  for (const p of (prodData as unknown as Array<{ category_id: string | null }> | null) ?? []) {
    if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  }
  const canDelete = profile.permissions.has("categories.delete");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl">Categorías</h1>
        <Link href="/admin/categorias/nueva" className={primaryButton}>
          Nueva categoría
        </Link>
      </div>

      {sp.guardado && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">
          Cambios guardados.
        </p>
      )}
      {sp.eliminada && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">
          Categoría eliminada.
        </p>
      )}
      {sp.error && (
        <p role="alert" className="mt-6 border border-red-700 px-4 py-3 text-sm text-red-800">
          {errorMessages[sp.error] ?? "Ha ocurrido un error."}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-carbon/70">Todavía no hay categorías.</p>
      ) : (
        <ul className="mt-8 divide-y divide-arena border-y border-arena bg-white">
          {rows.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div className="min-w-0">
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-carbon/70">
                  /{c.slug} · {counts.get(c.id) ?? 0} producto(s) · {c.active ? "Visible" : "Oculta"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/categorias/${c.id}`} className={secondaryButton}>
                  Editar
                </Link>
                {canDelete && (
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      className="border border-red-700 px-6 py-3 text-sm text-red-800 hover:bg-red-700 hover:text-white"
                      aria-label={`Eliminar ${c.name}`}
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

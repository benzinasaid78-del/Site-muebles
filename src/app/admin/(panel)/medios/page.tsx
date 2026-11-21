import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { mediaPublicUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import { deleteMedia, updateMediaAlt } from "./actions";
import { UploadForm } from "./UploadForm";

export const metadata: Metadata = { title: "Medios" };

type Search = Promise<{
  subidas?: string;
  fallos?: string;
  guardado?: string;
  eliminada?: string;
  error?: string;
}>;

type Row = {
  id: string;
  storage_path: string;
  original_name: string | null;
  alt_text: string | null;
  size_bytes: number;
};

const errorMessages: Record<string, string> = {
  "en-uso": "No se puede eliminar: la imagen se usa en un producto, proyecto o categoría. Quítala de allí primero.",
  invalida: "Imagen no válida.",
  fallo: "No se pudo guardar. Inténtalo de nuevo.",
};

export default async function MediaPage({ searchParams }: { searchParams: Search }) {
  const profile = await requirePermission("media.write");
  const sp = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("media_assets")
    .select("id, storage_path, original_name, alt_text, size_bytes")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data as unknown as Row[] | null) ?? [];
  const canDelete = profile.permissions.has("media.delete");

  return (
    <>
      <h1 className="font-heading text-3xl">Medios</h1>
      <p className="mt-2 text-sm text-carbon/70">
        Biblioteca de imágenes. Después las eliges en productos, proyectos y categorías.
      </p>

      {sp.subidas && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">
          {sp.subidas} imagen(es) subida(s).
          {sp.fallos ? ` ${sp.fallos} no se pudieron subir.` : ""}
        </p>
      )}
      {sp.guardado && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">
          Cambios guardados.
        </p>
      )}
      {sp.eliminada && (
        <p role="status" className="mt-6 border border-carbon/40 px-4 py-3 text-sm">
          Imagen eliminada.
        </p>
      )}
      {sp.error && (
        <p role="alert" className="mt-6 border border-red-700 px-4 py-3 text-sm text-red-800">
          {errorMessages[sp.error] ?? "Ha ocurrido un error."}
        </p>
      )}

      <section className="mt-8 max-w-xl border border-arena bg-white p-5">
        <h2 className="font-heading text-xl">Subir imágenes</h2>
        <div className="mt-4">
          <UploadForm />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">Biblioteca ({rows.length})</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-carbon/70">Todavía no hay imágenes.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((m) => (
              <li key={m.id} className="border border-arena bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaPublicUrl(m.storage_path)}
                  alt={m.alt_text ?? ""}
                  loading="lazy"
                  className="aspect-[4/3] w-full bg-arena object-cover"
                />
                <p className="mt-2 truncate text-xs text-carbon/70">
                  {m.original_name ?? "sin nombre"} · {(m.size_bytes / 1024).toFixed(0)} KB
                </p>
                <form action={updateMediaAlt} className="mt-2 space-y-2">
                  <input type="hidden" name="id" value={m.id} />
                  <label htmlFor={`alt-${m.id}`} className="text-xs font-medium">
                    Texto alternativo (descripción para accesibilidad)
                  </label>
                  <input
                    id={`alt-${m.id}`}
                    name="alt_text"
                    maxLength={200}
                    defaultValue={m.alt_text ?? ""}
                    className="w-full border border-carbon/40 px-3 py-2 text-sm"
                  />
                  <button type="submit" className="border border-carbon px-4 py-2 text-xs hover:bg-carbon hover:text-crema">
                    Guardar texto
                  </button>
                </form>
                {canDelete && (
                  <form action={deleteMedia} className="mt-2">
                    <input type="hidden" name="id" value={m.id} />
                    <button
                      type="submit"
                      className="border border-red-700 px-4 py-2 text-xs text-red-800 hover:bg-red-700 hover:text-white"
                    >
                      Eliminar imagen
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

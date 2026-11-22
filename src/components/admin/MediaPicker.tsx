import Image from "next/image";
import Link from "next/link";
import type { MediaOption } from "@/lib/admin-media";

const emptyNote = (
  <p className="text-sm text-carbon/70">
    No hay imágenes en la biblioteca. Súbelas primero en{" "}
    <Link href="/admin/medios" className="underline">
      Medios
    </Link>
    .
  </p>
);

/** Varias imágenes (casillas) + una principal (opción). Campos: media_ids y main_media. */
export function MediaMultiPicker({
  media,
  selected,
  main,
}: {
  media: MediaOption[];
  selected: string[];
  main: string | null;
}) {
  if (media.length === 0) return emptyNote;
  return (
    <>
      <p className="text-xs text-carbon/70">
        Fotos actuales: desmarca «Usar» para quitar una y elige la principal (será la portada).
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {media.map((m) => (
          <li key={m.id} className="border border-arena bg-white p-2">
            <Image src={m.url} alt={m.alt} width={240} height={180} sizes="240px" className="aspect-[4/3] w-full bg-arena object-cover" />
            <label className="mt-2 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="media_ids"
                value={m.id}
                defaultChecked={selected.includes(m.id)}
                className="h-5 w-5 accent-carbon"
              />
              Usar
            </label>
            <label className="mt-1 flex items-center gap-2 text-xs">
              <input
                type="radio"
                name="main_media"
                value={m.id}
                defaultChecked={main === m.id}
                className="h-5 w-5 accent-carbon"
              />
              Principal
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Una sola imagen opcional. Campo: cover_media_id ("" = sin imagen). */
export function MediaSinglePicker({
  media,
  name,
  selected,
}: {
  media: MediaOption[];
  name: string;
  selected: string | null;
}) {
  if (media.length === 0) return emptyNote;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <li className="flex items-center border border-arena bg-white p-3">
        <label className="flex items-center gap-2 text-xs">
          <input type="radio" name={name} value="" defaultChecked={!selected} className="h-5 w-5 accent-carbon" />
          Sin imagen
        </label>
      </li>
      {media.map((m) => (
        <li key={m.id} className="border border-arena bg-white p-2">
          <Image src={m.url} alt={m.alt} width={240} height={180} sizes="240px" className="aspect-[4/3] w-full bg-arena object-cover" />
          <label className="mt-2 flex items-center gap-2 text-xs">
            <input
              type="radio"
              name={name}
              value={m.id}
              defaultChecked={selected === m.id}
              className="h-5 w-5 accent-carbon"
            />
            Elegir
          </label>
        </li>
      ))}
    </ul>
  );
}

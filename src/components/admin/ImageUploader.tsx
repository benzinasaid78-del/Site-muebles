"use client";

import { useEffect, useRef, useState } from "react";
import { shrinkImage as shrink } from "@/lib/client-image";

const MAX_FILES = 10;
const MAX_TOTAL = 4 * 1024 * 1024;

/**
 * Selector de fotos nuevas dentro del formulario del producto.
 * Las fotos se reducen en el móvil antes de enviarse y viajan en el campo "new_images".
 */
export function ImageUploader() {
  const hidden = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  // Mantiene el campo real del formulario sincronizado con la lista.
  useEffect(() => {
    const input = hidden.current;
    if (!input) return;
    try {
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f));
      input.files = dt.files;
    } catch {
      setNote("Tu navegador no permite adjuntar fotos aquí. Sube las fotos desde Medios.");
    }
    const next = files.map((f) => URL.createObjectURL(f));
    setUrls(next);
    return () => next.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  // Tras guardar con error el formulario se vacía: la lista debe vaciarse también.
  useEffect(() => {
    const form = hidden.current?.form;
    if (!form) return;
    const clear = () => {
      setFiles([]);
      setNote(null);
    };
    form.addEventListener("reset", clear);
    return () => form.removeEventListener("reset", clear);
  }, []);

  async function onPick(list: FileList | null) {
    if (!list || list.length === 0) return;
    setBusy(true);
    setNote(null);
    const picked = await Promise.all(Array.from(list).map(shrink));
    let next = [...files, ...picked];
    let msg: string | null = null;
    if (next.length > MAX_FILES) {
      next = next.slice(0, MAX_FILES);
      msg = `Máximo ${MAX_FILES} fotos nuevas cada vez.`;
    }
    while (next.length > 1 && next.reduce((s, f) => s + f.size, 0) > MAX_TOTAL) {
      next.pop();
      msg = "Se alcanzó el límite de tamaño por guardado (4 MB). Guarda y añade el resto después.";
    }
    if (next.length === 1 && (next[0]?.size ?? 0) > MAX_TOTAL) {
      next = [];
      msg = "Esa foto es demasiado grande (más de 4 MB incluso reducida).";
    }
    setFiles(next);
    setNote(msg);
    setBusy(false);
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium" htmlFor="new_images_picker">
        Añadir fotos nuevas
      </label>
      <input
        id="new_images_picker"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={(e) => {
          void onPick(e.target.files);
          e.target.value = "";
        }}
        className="block w-full text-sm"
      />
      <input ref={hidden} type="file" name="new_images" multiple hidden tabIndex={-1} aria-hidden="true" />
      {busy && <p className="text-xs text-carbon/70">Preparando fotos…</p>}
      {note && <p role="alert" className="text-sm text-red-800">{note}</p>}
      {files.length > 0 && (
        <>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="border border-arena bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={urls[i]} alt="" className="aspect-square w-full bg-arena object-cover" />
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="mt-2 w-full border border-carbon/40 px-2 py-2 text-xs"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-carbon/70">
            Estas fotos se subirán al pulsar «Guardar». La primera será la principal si no hay otra elegida.
          </p>
        </>
      )}
    </div>
  );
}

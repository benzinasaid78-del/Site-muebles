"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { shrinkImage } from "@/lib/client-image";

export type CurrentImage = { id: string; url: string; alt: string } | null;

/**
 * Una sola imagen: muestra la actual y permite SUBIR otra desde el móvil o quitarla.
 * No enseña la biblioteca. Campos: `name` (id actual, "" si se quita) y `name_file` (foto nueva).
 */
export function SingleImageField({
  name,
  label,
  current,
}: {
  name: string;
  label: string;
  current: CurrentImage;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [removed, setRemoved] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Tras un guardado con error el formulario se vacía: la vista previa debe vaciarse también.
  useEffect(() => {
    const form = fileRef.current?.form;
    if (!form) return;
    const clear = () => {
      setPreview(null);
      setNote(null);
    };
    form.addEventListener("reset", clear);
    return () => form.removeEventListener("reset", clear);
  }, []);

  async function onPick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setNote(null);
    const small = await shrinkImage(file);
    if (small.size > 4 * 1024 * 1024) {
      if (fileRef.current) fileRef.current.value = "";
      setPreview(null);
      setNote("Esa foto es demasiado grande (más de 4 MB incluso reducida).");
      setBusy(false);
      return;
    }
    try {
      const dt = new DataTransfer();
      dt.items.add(small);
      if (fileRef.current) fileRef.current.files = dt.files;
    } catch {
      // Si el navegador no lo permite, se envía el archivo original tal cual.
    }
    setRemoved(false);
    setPreview(URL.createObjectURL(small));
    setBusy(false);
  }

  const showing = preview ?? (!removed && current ? current.url : null);
  const keepId = removed || preview ? "" : (current?.id ?? "");

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{label}</p>
      <input type="hidden" name={name} value={keepId} />
      <div className="w-40 border border-arena bg-white p-2">
        {showing ? (
          preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={showing} alt="" className="aspect-[4/3] w-full bg-arena object-cover" />
          ) : (
            <Image src={showing} alt={current?.alt ?? ""} width={240} height={180} sizes="160px" className="aspect-[4/3] w-full bg-arena object-cover" />
          )
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-arena text-xs text-carbon/60">
            Sin foto
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        name={`${name}_file`}
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(e) => void onPick(e.target.files?.[0])}
        className="block w-full text-sm"
      />
      {busy && <p className="text-xs text-carbon/70">Preparando foto…</p>}
      {note && <p role="alert" className="text-sm text-red-800">{note}</p>}
      {(current || preview) && (
        <button
          type="button"
          onClick={() => {
            setRemoved(true);
            setPreview(null);
            if (fileRef.current) fileRef.current.value = "";
          }}
          className="border border-carbon/40 px-4 py-2 text-xs"
        >
          Quitar foto
        </button>
      )}
      <p className="text-xs text-carbon/70">La foto nueva se sube al pulsar «Guardar».</p>
    </div>
  );
}

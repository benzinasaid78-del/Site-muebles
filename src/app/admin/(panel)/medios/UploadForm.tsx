"use client";

import { useActionState } from "react";
import { uploadMedia } from "./actions";
import type { FormState } from "@/lib/admin";
import { FormError, primaryButton } from "@/components/admin/fields";

const initial: FormState = {};

export function UploadForm() {
  const [state, action, pending] = useActionState(uploadMedia, initial);
  return (
    <form action={action} className="space-y-4">
      <FormError message={state.error} />
      <div>
        <label htmlFor="files" className="text-sm font-medium">
          Imágenes
        </label>
        <p className="mt-1 text-xs text-carbon/70">
          JPG, PNG, WEBP o AVIF. Máximo 4 MB cada una y 10 por vez.
        </p>
        <input
          id="files"
          name="files"
          type="file"
          multiple
          required
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="mt-2 block w-full border border-carbon/40 bg-white p-3 text-sm"
        />
      </div>
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Subiendo…" : "Subir imágenes"}
      </button>
    </form>
  );
}

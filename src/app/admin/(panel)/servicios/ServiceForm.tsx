"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveService } from "./actions";
import type { FormState } from "@/lib/admin";
import { slugify } from "@/lib/slug";
import { FormError, TextArea, TextField, primaryButton, secondaryButton } from "@/components/admin/fields";

export type ServiceValues = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  display_order: string;
  status: "draft" | "published" | "archived";
};

const initial: FormState = {};
const inputClass = "mt-2 w-full border border-carbon/40 bg-white px-4 py-3 text-base focus:border-carbon";

export function ServiceForm({ service }: { service: ServiceValues }) {
  const [state, action, pending] = useActionState(saveService, initial);
  const v = state.values;
  const errors = state.fieldErrors ?? {};
  const isNew = !service.id;
  const [slugValue, setSlugValue] = useState(v?.slug ?? service.slug);

  return (
    <form action={action} className="max-w-2xl space-y-6">
      {service.id && <input type="hidden" name="id" value={service.id} />}
      <FormError message={state.error} />

      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Título
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={120}
          defaultValue={v?.title ?? service.title}
          aria-invalid={errors.title ? true : undefined}
          onChange={(e) => {
            if (isNew) setSlugValue(slugify(e.target.value));
          }}
          className={inputClass}
        />
        {errors.title && (
          <p role="alert" className="mt-1 text-sm text-red-800">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="slug" className="text-sm font-medium">
          Identificador
        </label>
        <input
          id="slug"
          name="slug"
          required
          maxLength={80}
          value={slugValue}
          onChange={(e) => setSlugValue(e.target.value)}
          aria-invalid={errors.slug ? true : undefined}
          className={inputClass}
        />
        {errors.slug && (
          <p role="alert" className="mt-1 text-sm text-red-800">
            {errors.slug}
          </p>
        )}
      </div>

      <TextArea
        name="description"
        label="Descripción"
        hint="Describe solo lo que la empresa ofrece realmente."
        rows={5}
        maxLength={2000}
        defaultValue={v?.description ?? service.description}
        error={errors.description}
      />

      <TextField
        name="display_order"
        label="Orden de aparición"
        hint="Los números más bajos aparecen primero."
        type="number"
        defaultValue={v?.display_order ?? service.display_order}
        error={errors.display_order}
      />

      <div>
        <label htmlFor="status" className="text-sm font-medium">
          Estado
        </label>
        <select id="status" name="status" defaultValue={v?.status ?? service.status} className={inputClass}>
          <option value="draft">Borrador (no visible)</option>
          <option value="published">Publicado (visible en la web)</option>
          <option value="archived">Archivado (no visible)</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/admin/servicios" className={secondaryButton}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}

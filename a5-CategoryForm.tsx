"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveCategory } from "./actions";
import type { FormState } from "@/lib/admin";
import { slugify } from "@/lib/slug";
import {
  Checkbox,
  FormError,
  TextArea,
  TextField,
  primaryButton,
  secondaryButton,
} from "@/components/admin/fields";

export type CategoryValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  display_order: string;
  active: boolean;
  seo_title: string;
  seo_description: string;
};

const initial: FormState = {};

export function CategoryForm({ category }: { category: CategoryValues }) {
  const [state, action, pending] = useActionState(saveCategory, initial);
  const v = state.values;
  const errors = state.fieldErrors ?? {};
  const [slugValue, setSlugValue] = useState(v?.slug ?? category.slug);
  const isNew = !category.id;

  return (
    <form action={action} className="max-w-2xl space-y-6">
      {category.id && <input type="hidden" name="id" value={category.id} />}
      <FormError message={state.error} />

      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={120}
          defaultValue={v?.name ?? category.name}
          aria-invalid={errors.name ? true : undefined}
          onChange={(e) => {
            if (isNew) setSlugValue(slugify(e.target.value));
          }}
          className="mt-2 w-full border border-carbon/40 bg-white px-4 py-3 text-base focus:border-carbon"
        />
        {errors.name && (
          <p role="alert" className="mt-1 text-sm text-red-800">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="slug" className="text-sm font-medium">
          Identificador en la URL
        </label>
        <p className="mt-1 text-xs text-carbon/70">
          Aparece en la dirección web: /colecciones/<strong>{slugValue || "identificador"}</strong>.
          {!isNew && " Cambiarlo rompe los enlaces ya compartidos."}
        </p>
        <input
          id="slug"
          name="slug"
          required
          maxLength={80}
          value={slugValue}
          onChange={(e) => setSlugValue(e.target.value)}
          aria-invalid={errors.slug ? true : undefined}
          className="mt-2 w-full border border-carbon/40 bg-white px-4 py-3 text-base focus:border-carbon"
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
        rows={4}
        maxLength={2000}
        defaultValue={v?.description ?? category.description}
        error={errors.description}
      />

      <TextField
        name="display_order"
        label="Orden de aparición"
        hint="Los números más bajos aparecen primero."
        type="number"
        defaultValue={v?.display_order ?? category.display_order}
        error={errors.display_order}
      />

      <Checkbox
        name="active"
        label="Visible en la web"
        defaultChecked={v ? v.active === "on" : category.active}
      />

      <fieldset className="space-y-6 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Buscadores (SEO)</legend>
        <TextField
          name="seo_title"
          label="Título SEO"
          hint="Opcional. Máximo 70 caracteres."
          maxLength={70}
          defaultValue={v?.seo_title ?? category.seo_title}
          error={errors.seo_title}
        />
        <TextArea
          name="seo_description"
          label="Descripción SEO"
          hint="Opcional. Máximo 160 caracteres."
          rows={3}
          maxLength={160}
          defaultValue={v?.seo_description ?? category.seo_description}
          error={errors.seo_description}
        />
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/admin/categorias" className={secondaryButton}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}

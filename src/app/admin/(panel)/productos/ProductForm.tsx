"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProduct } from "./actions";
import type { FormState } from "@/lib/admin";
import { slugify } from "@/lib/slug";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  Checkbox,
  FormError,
  TextArea,
  TextField,
  primaryButton,
  secondaryButton,
} from "@/components/admin/fields";

export type ProductValues = {
  id?: string;
  name: string;
  slug: string;
  category_id: string;
  short_description: string;
  description: string;
  brand: string;
  reference: string;
  price: string;
  show_price: boolean;
  dimensions: string;
  materials: string;
  finishes: string;
  featured: boolean;
  status: "draft" | "published" | "archived";
  seo_title: string;
  seo_description: string;
};

export type MediaOption = { id: string; url: string; alt: string; name: string };

const initial: FormState = {};
const selectClass = "mt-2 w-full border border-carbon/40 bg-white px-4 py-3 text-base focus:border-carbon";

export function ProductForm({
  product,
  categories,
  media,
  selectedIds,
  mainId,
}: {
  product: ProductValues;
  categories: Array<{ id: string; name: string }>;
  media: MediaOption[];
  selectedIds: string[];
  mainId: string | null;
}) {
  const [state, action, pending] = useActionState(saveProduct, initial);
  const v = state.values;
  const errors = state.fieldErrors ?? {};
  const isNew = !product.id;
  const [slugValue, setSlugValue] = useState(v?.slug ?? product.slug);

  const chosen = state.lists ? state.lists.media_ids ?? [] : selectedIds;
  const main = state.lists ? state.lists.main_media?.[0] ?? null : mainId;

  return (
    <form action={action} className="max-w-3xl space-y-6">
      {product.id && <input type="hidden" name="id" value={product.id} />}
      <FormError message={state.error} />

      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={160}
          defaultValue={v?.name ?? product.name}
          aria-invalid={errors.name ? true : undefined}
          onChange={(e) => {
            if (isNew) setSlugValue(slugify(e.target.value));
          }}
          className={selectClass}
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
          Dirección: /productos/<strong>{slugValue || "identificador"}</strong>
          {!isNew && ". Cambiarlo rompe los enlaces ya compartidos."}
        </p>
        <input
          id="slug"
          name="slug"
          required
          maxLength={80}
          value={slugValue}
          onChange={(e) => setSlugValue(e.target.value)}
          aria-invalid={errors.slug ? true : undefined}
          className={selectClass}
        />
        {errors.slug && (
          <p role="alert" className="mt-1 text-sm text-red-800">
            {errors.slug}
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="category_id" className="text-sm font-medium">
            Categoría
          </label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={v?.category_id ?? product.category_id}
            className={selectClass}
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p role="alert" className="mt-1 text-sm text-red-800">
              {errors.category_id}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="status" className="text-sm font-medium">
            Estado
          </label>
          <select id="status" name="status" defaultValue={v?.status ?? product.status} className={selectClass}>
            <option value="draft">Borrador (no visible)</option>
            <option value="published">Publicado (visible en la web)</option>
            <option value="archived">Archivado (no visible)</option>
          </select>
        </div>
      </div>

      <TextArea
        name="short_description"
        label="Descripción corta"
        hint="Aparece en las tarjetas del catálogo. Máximo 300 caracteres."
        rows={2}
        maxLength={300}
        defaultValue={v?.short_description ?? product.short_description}
        error={errors.short_description}
      />
      <TextArea
        name="description"
        label="Descripción completa"
        rows={8}
        maxLength={10000}
        defaultValue={v?.description ?? product.description}
        error={errors.description}
      />

      <fieldset className="space-y-6 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Ficha técnica</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField name="brand" label="Marca" maxLength={80} defaultValue={v?.brand ?? product.brand} error={errors.brand} />
          <TextField name="reference" label="Referencia" maxLength={60} defaultValue={v?.reference ?? product.reference} error={errors.reference} />
        </div>
        <TextField name="dimensions" label="Medidas" hint="Ej.: 220 × 95 × 85 cm" maxLength={200} defaultValue={v?.dimensions ?? product.dimensions} error={errors.dimensions} />
        <TextField name="materials" label="Materiales" maxLength={300} defaultValue={v?.materials ?? product.materials} error={errors.materials} />
        <TextField name="finishes" label="Acabados" maxLength={300} defaultValue={v?.finishes ?? product.finishes} error={errors.finishes} />
      </fieldset>

      <fieldset className="space-y-4 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Precio (opcional)</legend>
        <p className="text-xs text-carbon/70">
          El catálogo no vende online. El precio solo se muestra en la web si activas «Mostrar precio».
        </p>
        <TextField name="price" label="Precio (€)" hint="Ej.: 1250,50" maxLength={12} defaultValue={v?.price ?? product.price} error={errors.price} />
        <Checkbox name="show_price" label="Mostrar precio en la web" defaultChecked={v ? v.show_price === "on" : product.show_price} />
        <Checkbox name="featured" label="Destacar en la portada" defaultChecked={v ? v.featured === "on" : product.featured} />
      </fieldset>

      <fieldset className="space-y-4 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Imágenes</legend>
        <ImageUploader />
        {media.length === 0 ? (
          <p className="text-sm text-carbon/70">Este producto todavía no tiene fotos.</p>
        ) : (
          <>
            <p className="text-xs text-carbon/70">
              Fotos actuales del producto: desmarca «Usar» para quitar una y elige cuál es la principal.
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
                      defaultChecked={chosen.includes(m.id)}
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
        )}
      </fieldset>

      <fieldset className="space-y-6 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Buscadores (SEO)</legend>
        <TextField name="seo_title" label="Título SEO" hint="Opcional. Máximo 70 caracteres." maxLength={70} defaultValue={v?.seo_title ?? product.seo_title} error={errors.seo_title} />
        <TextArea name="seo_description" label="Descripción SEO" hint="Opcional. Máximo 160 caracteres." rows={3} maxLength={160} defaultValue={v?.seo_description ?? product.seo_description} error={errors.seo_description} />
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/admin/productos" className={secondaryButton}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}

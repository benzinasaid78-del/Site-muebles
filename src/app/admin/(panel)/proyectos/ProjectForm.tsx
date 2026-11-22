"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProject } from "./actions";
import type { FormState } from "@/lib/admin";
import type { MediaOption } from "@/lib/admin-media";
import { slugify } from "@/lib/slug";
import { Checkbox, FormError, TextArea, TextField, primaryButton, secondaryButton } from "@/components/admin/fields";
import { MediaMultiPicker } from "@/components/admin/MediaPicker";
import { ImageUploader } from "@/components/admin/ImageUploader";

export type ProjectValues = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  project_category: string;
  featured: boolean;
  status: "draft" | "published" | "archived";
  seo_title: string;
  seo_description: string;
};

const initial: FormState = {};
const inputClass = "mt-2 w-full border border-carbon/40 bg-white px-4 py-3 text-base focus:border-carbon";

export function ProjectForm({
  project,
  media,
  selectedIds,
  mainId,
}: {
  project: ProjectValues;
  media: MediaOption[];
  selectedIds: string[];
  mainId: string | null;
}) {
  const [state, action, pending] = useActionState(saveProject, initial);
  const v = state.values;
  const errors = state.fieldErrors ?? {};
  const isNew = !project.id;
  const [slugValue, setSlugValue] = useState(v?.slug ?? project.slug);
  const chosen = state.lists ? (state.lists.media_ids ?? []) : selectedIds;
  const main = state.lists ? (state.lists.main_media?.[0] ?? null) : mainId;

  return (
    <form action={action} className="max-w-3xl space-y-6">
      {project.id && <input type="hidden" name="id" value={project.id} />}
      <FormError message={state.error} />

      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Título
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={160}
          defaultValue={v?.title ?? project.title}
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
          Identificador en la URL
        </label>
        <p className="mt-1 text-xs text-carbon/70">
          Dirección: /proyectos/<strong>{slugValue || "identificador"}</strong>
        </p>
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

      <TextField
        name="project_category"
        label="Tipo de proyecto"
        hint="Ej.: Salón, Cocina, Dormitorio…"
        maxLength={80}
        defaultValue={v?.project_category ?? project.project_category}
        error={errors.project_category}
      />
      <TextArea
        name="description"
        label="Descripción"
        rows={8}
        maxLength={5000}
        defaultValue={v?.description ?? project.description}
        error={errors.description}
      />

      <div>
        <label htmlFor="status" className="text-sm font-medium">
          Estado
        </label>
        <select id="status" name="status" defaultValue={v?.status ?? project.status} className={inputClass}>
          <option value="draft">Borrador (no visible)</option>
          <option value="published">Publicado (visible en la web)</option>
          <option value="archived">Archivado (no visible)</option>
        </select>
      </div>
      <Checkbox name="featured" label="Destacar en la portada" defaultChecked={v ? v.featured === "on" : project.featured} />

      <fieldset className="space-y-4 border-t border-arena pt-6">
        <legend className="font-heading text-lg">Imágenes</legend>
        <ImageUploader />
        {media.length > 0 && <MediaMultiPicker media={media} selected={chosen} main={main} />}
      </fieldset>


      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/admin/proyectos" className={secondaryButton}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}

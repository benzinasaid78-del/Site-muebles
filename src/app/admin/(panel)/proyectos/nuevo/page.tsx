import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { loadMediaOptions } from "@/lib/admin-media";
import { ProjectForm } from "../ProjectForm";

export const metadata: Metadata = { title: "Nuevo proyecto" };

export default async function NewProjectPage() {
  await requirePermission("projects.write");
  const media = await loadMediaOptions([]);
  return (
    <>
      <h1 className="font-heading text-3xl">Nuevo proyecto</h1>
      <div className="mt-8">
        <ProjectForm
          project={{
            title: "",
            slug: "",
            description: "",
            project_category: "",
            featured: false,
            status: "draft",
            seo_title: "",
            seo_description: "",
          }}
          media={media}
          selectedIds={[]}
          mainId={null}
        />
      </div>
    </>
  );
}

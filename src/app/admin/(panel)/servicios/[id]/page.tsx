import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { uuidSchema } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { ServiceForm } from "../ServiceForm";

export const metadata: Metadata = { title: "Editar servicio" };

type Row = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  display_order: number;
  status: "draft" | "published" | "archived";
};

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content.write");
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("id, title, slug, description, display_order, status")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  const s = data as unknown as Row | null;
  if (!s) notFound();

  return (
    <>
      <h1 className="font-heading text-3xl">Editar servicio</h1>
      <div className="mt-8">
        <ServiceForm
          service={{
            id: s.id,
            title: s.title,
            slug: s.slug,
            description: s.description ?? "",
            display_order: String(s.display_order),
            status: s.status,
          }}
        />
      </div>
    </>
  );
}

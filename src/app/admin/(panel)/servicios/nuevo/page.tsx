import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { ServiceForm } from "../ServiceForm";

export const metadata: Metadata = { title: "Nuevo servicio" };

export default async function NewServicePage() {
  await requirePermission("content.write");
  return (
    <>
      <h1 className="font-heading text-3xl">Nuevo servicio</h1>
      <div className="mt-8">
        <ServiceForm service={{ title: "", slug: "", description: "", display_order: "0", status: "draft" }} />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { secondaryButton } from "@/components/admin/fields";
import { setHandled } from "./actions";

export const metadata: Metadata = { title: "Mensajes" };

type Search = Promise<{ ver?: string; error?: string }>;
type Row = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  handled: boolean;
};

export default async function MessagesPage({ searchParams }: { searchParams: Search }) {
  await requirePermission("contacts.read");
  const sp = await searchParams;
  const onlyPending = sp.ver !== "todos";
  const supabase = await createClient();

  let query = supabase
    .from("contact_submissions")
    .select("id, name, email, subject, message, created_at, handled")
    .order("created_at", { ascending: false })
    .limit(100);
  if (onlyPending) query = query.eq("handled", false);
  const { data } = await query;
  const rows = (data as unknown as Row[] | null) ?? [];

  const fmt = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl">Mensajes</h1>
        <Link
          href={onlyPending ? "/admin/mensajes?ver=todos" : "/admin/mensajes"}
          className={secondaryButton}
        >
          {onlyPending ? "Ver todos" : "Ver solo pendientes"}
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-carbon/70">
        Mensajes enviados desde el formulario de contacto. Contienen datos personales: úsalos solo para responder.
      </p>

      {sp.error && (
        <p role="alert" className="mt-6 border border-red-700 px-4 py-3 text-sm text-red-800">
          No se pudo completar la acción. Inténtalo de nuevo.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-carbon/70">
          {onlyPending ? "No hay mensajes pendientes." : "Todavía no hay mensajes."}
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {rows.map((m) => (
            <li key={m.id} className="border border-arena bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{m.subject}</p>
                  <p className="text-sm text-carbon/70">
                    {m.name} ·{" "}
                    <a href={`mailto:${m.email}`} className="underline">
                      {m.email}
                    </a>
                  </p>
                  <p className="text-xs text-carbon/60">
                    {fmt.format(new Date(m.created_at))} · {m.handled ? "Atendido" : "Pendiente"}
                  </p>
                </div>
                <form action={setHandled}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="handled" value={m.handled ? "0" : "1"} />
                  <button type="submit" className={secondaryButton}>
                    {m.handled ? "Marcar pendiente" : "Marcar atendido"}
                  </button>
                </form>
              </div>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

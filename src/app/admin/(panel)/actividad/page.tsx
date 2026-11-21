import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { secondaryButton } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Actividad" };

type Search = Promise<{ p?: string }>;
type Row = {
  id: number;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
};

const PAGE = 50;

export default async function ActivityPage({ searchParams }: { searchParams: Search }) {
  await requirePermission("logs.view");
  const sp = await searchParams;
  const page = Math.max(0, Math.min(1000, Number.parseInt(sp.p ?? "0", 10) || 0));
  const supabase = await createClient();

  const { data } = await supabase
    .from("activity_logs")
    .select("id, user_id, action, entity_type, entity_id, created_at")
    .order("created_at", { ascending: false })
    .range(page * PAGE, page * PAGE + PAGE);
  const all = (data as unknown as Row[] | null) ?? [];
  const hasNext = all.length > PAGE;
  const rows = all.slice(0, PAGE);

  // Nombres de usuario (solo los puede leer quien gestiona usuarios; el resto ve un identificador corto).
  const names = new Map<string, string>();
  const { data: users } = await supabase.rpc("admin_list_users");
  for (const u of (users as unknown as Array<{ id: string; email: string | null; full_name: string | null }> | null) ?? []) {
    names.set(u.id, u.email ?? u.full_name ?? u.id.slice(0, 8));
  }

  const fmt = new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "medium", timeZone: "Europe/Madrid" });

  return (
    <>
      <h1 className="font-heading text-3xl">Actividad</h1>
      <p className="mt-2 max-w-2xl text-sm text-carbon/70">
        Registro de lo que se hace en el panel. Solo se guardan metadatos: nunca contraseñas ni contenido de mensajes.
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-carbon/70">Todavía no hay actividad registrada.</p>
      ) : (
        <ul className="mt-8 divide-y divide-arena border-y border-arena bg-white">
          {rows.map((r) => (
            <li key={r.id} className="px-4 py-3 text-sm">
              <p className="font-medium">
                {r.action}
                {r.entity_type ? <span className="font-normal text-carbon/70"> · {r.entity_type}</span> : null}
              </p>
              <p className="break-all text-xs text-carbon/60">
                {fmt.format(new Date(r.created_at))} · {r.user_id ? (names.get(r.user_id) ?? r.user_id.slice(0, 8)) : "sistema"}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex gap-3">
        {page > 0 && (
          <Link href={`/admin/actividad?p=${page - 1}`} className={secondaryButton}>Más recientes</Link>
        )}
        {hasNext && (
          <Link href={`/admin/actividad?p=${page + 1}`} className={secondaryButton}>Más antiguos</Link>
        )}
      </div>
    </>
  );
}

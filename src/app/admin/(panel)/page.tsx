import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Search = Promise<{ acceso?: string }>;

type LogRow = { id: number; action: string; entity_type: string | null; created_at: string };

export default async function DashboardPage({ searchParams }: { searchParams: Search }) {
  const profile = await requireProfile();
  const { acceso } = await searchParams;
  const supabase = await createClient();

  // Solo datos reales de la base de datos: nada de analíticas inventadas.
  const head = (table: string) =>
    supabase.from(table).select("id", { count: "exact", head: true });

  const [published, categories, projects, draftProducts, draftProjects, draftServices, draftPages] =
    await Promise.all([
      head("products").eq("status", "published").is("deleted_at", null),
      head("categories").is("deleted_at", null),
      head("projects").is("deleted_at", null),
      head("products").eq("status", "draft").is("deleted_at", null),
      head("projects").eq("status", "draft").is("deleted_at", null),
      head("services").eq("status", "draft").is("deleted_at", null),
      head("pages").eq("status", "draft").is("deleted_at", null),
    ]);

  const drafts =
    (draftProducts.count ?? 0) +
    (draftProjects.count ?? 0) +
    (draftServices.count ?? 0) +
    (draftPages.count ?? 0);

  let logs: LogRow[] = [];
  if (profile.permissions.has("logs.view")) {
    const { data } = await supabase
      .from("activity_logs")
      .select("id, action, entity_type, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    logs = (data as unknown as LogRow[] | null) ?? [];
  }

  const cards: Array<[string, number]> = [
    ["Productos publicados", published.count ?? 0],
    ["Categorías", categories.count ?? 0],
    ["Proyectos", projects.count ?? 0],
    ["Contenido en borrador", drafts],
  ];

  const fmt = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  });

  return (
    <>
      <h1 className="font-heading text-3xl">Resumen</h1>
      <p className="mt-2 text-sm text-carbon/70">Hola, {profile.fullName ?? profile.email}.</p>

      {acceso === "denegado" && (
        <p role="alert" className="mt-6 border border-red-700 px-4 py-3 text-sm text-red-800">
          No tienes permiso para acceder a esa sección.
        </p>
      )}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <li key={label} className="border border-arena bg-white p-5">
            <p className="text-sm text-carbon/70">{label}</p>
            <p className="mt-2 font-heading text-4xl">{value}</p>
          </li>
        ))}
      </ul>

      <section className="mt-12">
        <h2 className="font-heading text-xl">Actividad reciente</h2>
        {!profile.permissions.has("logs.view") ? (
          <p className="mt-3 text-sm text-carbon/70">Tu rol no incluye el registro de actividad.</p>
        ) : logs.length === 0 ? (
          <p className="mt-3 text-sm text-carbon/70">Todavía no hay actividad registrada.</p>
        ) : (
          <ul className="mt-3 divide-y divide-arena border-y border-arena text-sm">
            {logs.map((l) => (
              <li key={l.id} className="flex justify-between gap-4 py-3">
                <span>
                  {l.action}
                  {l.entity_type ? ` · ${l.entity_type}` : ""}
                </span>
                <time dateTime={l.created_at} className="text-carbon/70">
                  {fmt.format(new Date(l.created_at))}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-xl">Accesos rápidos</h2>
        <p className="mt-3 text-sm text-carbon/70">
          La gestión de productos, categorías, proyectos, portada y medios se activa en la
          siguiente fase.
        </p>
      </section>
    </>
  );
}

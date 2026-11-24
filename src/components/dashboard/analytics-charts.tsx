import type { Project, ProjectActivity, ProjectStatus } from "@/lib/types";

const STATUS_ORDER: ProjectStatus[] = ["active", "pending", "completed", "archived"];
const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "En curso",
  pending: "Pendientes",
  completed: "Completados",
  archived: "Archivados",
};
const STATUS_COLOR: Record<ProjectStatus, string> = {
  active: "#F59E0B",
  pending: "#8B5CF6",
  completed: "#22C55E",
  archived: "#94A3B8",
};

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

interface DonutProps {
  total: number;
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
}

function Donut({ total, segments, centerLabel }: DonutProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0" role="img" aria-label={`${centerLabel}: ${total}`}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#272F42" strokeWidth="18" />
        {total > 0
          ? segments
              .filter((segment) => segment.value > 0)
              .map((segment) => {
                const dash = (segment.value / total) * circumference;
                const circle = (
                  <circle
                    key={segment.label}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="18"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                    transform="rotate(-90 70 70)"
                  />
                );
                offset += dash;
                return circle;
              })
          : null}
        <text x="70" y="68" textAnchor="middle" fill="#F8FAFC" fontSize="24" fontFamily="IBM Plex Mono, monospace">
          {total}
        </text>
        <text x="70" y="86" textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="IBM Plex Mono, monospace">
          {centerLabel}
        </text>
      </svg>

      <ul className="min-w-0 flex-1 space-y-2">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: segment.color }} />
              <span className="truncate">{segment.label}</span>
            </span>
            <span className="font-mono font-medium text-foreground">{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface AnalyticsChartsProps {
  projects: Project[];
  activities: ProjectActivity[];
}

export function AnalyticsCharts({ projects, activities }: AnalyticsChartsProps) {
  const projectCounts = STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = projects.filter((project) => project.status === status).length;
      return acc;
    },
    {} as Record<ProjectStatus, number>
  );

  const completedActivities = activities.filter((activity) => activity.completed).length;
  const pendingActivities = activities.length - completedActivities;
  const completionRate = activities.length
    ? Math.round((completedActivities / activities.length) * 100)
    : 0;

  const now = new Date();
  const buckets = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return { key: `${date.getFullYear()}-${date.getMonth()}`, label: MONTHS[date.getMonth()] };
  });
  const created = buckets.map(() => 0);
  const done = buckets.map(() => 0);

  activities.forEach((activity) => {
    const date = new Date(activity.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const index = buckets.findIndex((bucket) => bucket.key === key);
    if (index >= 0) {
      created[index] += 1;
      if (activity.completed) done[index] += 1;
    }
  });

  const projection = Math.round((created.slice(3).reduce((sum, value) => sum + value, 0) / 3) || 0);
  const max = Math.max(1, ...created, ...done, projection);

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="panel p-5" aria-labelledby="torta-estados">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2 id="torta-estados" className="text-sm font-semibold text-foreground">
            Proyectos por estado
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Distribución</span>
        </div>
        <Donut
          total={projects.length}
          centerLabel="proyectos"
          segments={STATUS_ORDER.map((status) => ({
            label: STATUS_LABEL[status],
            value: projectCounts[status],
            color: STATUS_COLOR[status],
          }))}
        />
      </section>

      <section className="panel p-5" aria-labelledby="torta-actividades">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2 id="torta-actividades" className="text-sm font-semibold text-foreground">
            Avance de actividades
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Avance</span>
        </div>
        <Donut
          total={activities.length}
          centerLabel="actividades"
          segments={[
            { label: "Completadas", value: completedActivities, color: "#22C55E" },
            { label: "Pendientes", value: pendingActivities, color: "#F59E0B" },
          ]}
        />
        <p className="mt-4 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
          Tasa de finalización <span className="text-success">{completionRate}%</span>
        </p>
      </section>

      <section className="panel p-5 xl:col-span-2" aria-labelledby="proyeccion-actividades">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 id="proyeccion-actividades" className="text-sm font-semibold text-foreground">
              Proyección de actividades
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Creadas y completadas por mes · estimación del próximo mes basada en los últimos 3 meses
            </p>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-primary" /> Creadas</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-accent" /> Completadas</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 border border-dashed border-warning" /> Proyección</span>
          </div>
        </div>

        <div className="flex h-52 items-end gap-2 sm:gap-4">
          {buckets.map((bucket, index) => (
            <div key={bucket.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-36 w-full items-end justify-center gap-1">
                <div
                  className="w-1/2 max-w-6 rounded-t-sm bg-primary"
                  style={{ height: `${(created[index] / max) * 100}%` }}
                  title={`${bucket.label}: ${created[index]} creadas`}
                />
                <div
                  className="w-1/2 max-w-6 rounded-t-sm bg-accent"
                  style={{ height: `${(done[index] / max) * 100}%` }}
                  title={`${bucket.label}: ${done[index]} completadas`}
                />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">{bucket.label}</span>
            </div>
          ))}
          <div className="flex h-full flex-1 flex-col items-center justify-end gap-2 border-l border-dashed border-border pl-2 sm:pl-4">
            <div className="flex h-36 w-full items-end justify-center">
              <div
                className="w-2/3 max-w-8 rounded-t-sm border-2 border-dashed border-warning"
                style={{ height: `${(projection / max) * 100}%` }}
                title={`Proyección: ${projection} actividades`}
              />
            </div>
            <span className="font-mono text-[10px] text-warning">Proy.</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 font-mono text-[11px]">
          <div>
            <p className="text-muted-foreground">Creadas (6 m)</p>
            <p className="mt-1 text-base text-foreground">{created.reduce((sum, value) => sum + value, 0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Completadas (6 m)</p>
            <p className="mt-1 text-base text-success">{done.reduce((sum, value) => sum + value, 0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Próx. mes</p>
            <p className="mt-1 text-base text-warning">{projection}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

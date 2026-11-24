import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USER_ID } from "@/lib/constants";
import type { Project, ProjectActivity } from "@/lib/types";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ProjectsPanel } from "@/components/dashboard/projects-panel";

export const dynamic = "force-dynamic";

const KPI_STYLES = [
  { label: "Total de proyectos", color: "border-t-primary", text: "text-primary" },
  { label: "En curso", color: "border-t-accent", text: "text-accent" },
  { label: "Pendientes", color: "border-t-warning", text: "text-warning" },
  { label: "Completados", color: "border-t-success", text: "text-success" },
];

export default async function DashboardPage() {
  const session = await requireSession();

  let projects: Project[] = [];
  let activities: ProjectActivity[] = [];
  let error: string | null = null;

  try {
    const supabase = createClient();
    const { data, error: dbError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    projects = (data as Project[]) ?? [];

    if (projects.length > 0) {
      const { data: activityData, error: activityError } = await supabase
        .from("project_activities")
        .select("id, project_id, title, description, completed, created_at")
        .in(
          "project_id",
          projects.map((project) => project.id)
        )
        .order("created_at", { ascending: true });

      if (activityError) throw activityError;
      activities = (activityData as ProjectActivity[]) ?? [];
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar los datos";
  }

  const counts = [projects.length, projects.filter((p) => p.status === "active").length, projects.filter((p) => p.status === "pending").length, projects.filter((p) => p.status === "completed").length];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <AppSidebar active="resumen" session={{ name: session.name, email: session.email }} />

      <div className="min-w-0">
        <header className="flex h-[60px] items-center justify-between border-b border-[var(--hairline)] bg-card/70 px-6 backdrop-blur-sm lg:px-10">
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span>WORKSPACE</span>
            <span className="text-primary">/</span>
            <span className="text-foreground">RESUMEN</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
              {new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date())}
            </span>
            <span className="rounded-full border border-primary/50 bg-primary/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-primary">
              Demo
            </span>
          </div>
        </header>

        <main id="resumen" className="space-y-8 px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Panel general</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                Centro de <span className="text-primary">control</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Proyectos, actividades y proyecciones en una sola vista.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-[var(--hairline)] bg-card px-3 py-2 font-mono text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success" />
              Datos en vivo · Supabase
            </div>
          </div>

          {error ? (
            <div className="panel border-l-4 border-l-destructive p-4 text-sm text-destructive">
              No se pudieron cargar los datos: {error}
            </div>
          ) : null}

          <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {KPI_STYLES.map((kpi, index) => (
              <div key={kpi.label} className={`panel border-t-4 ${kpi.color} p-5`}>
                <div className="flex items-start justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {kpi.label}
                  </p>
                  <span className={`font-mono text-[10px] ${kpi.text}`}>0{index + 1}</span>
                </div>
                <p className={`mt-4 font-mono text-4xl font-semibold ${kpi.text}`}>{counts[index]}</p>
                <div className="mt-4 h-1 w-full bg-muted">
                  <div className={`h-full ${kpi.color.replace("border-t-", "bg-")}`} style={{ width: `${Math.min(100, counts[index] * 20 + 20)}%` }} />
                </div>
              </div>
            ))}
          </section>

          <section id="analitica" className="scroll-mt-6">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">Analítica</h2>
              <span className="h-px flex-1 bg-[var(--hairline)]" />
              <span className="font-mono text-[10px] text-primary">02 / 03</span>
            </div>
            <AnalyticsCharts projects={projects} activities={activities} />
          </section>

          <section id="proyectos" className="scroll-mt-6">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">Proyectos</h2>
              <span className="h-px flex-1 bg-[var(--hairline)]" />
              <span className="font-mono text-[10px] text-primary">03 / 03</span>
            </div>
            <ProjectsPanel initialProjects={projects} />
          </section>
        </main>
      </div>
    </div>
  );
}

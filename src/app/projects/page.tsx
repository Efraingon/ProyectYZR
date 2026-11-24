import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USER_ID } from "@/lib/constants";
import type { Project, ProjectActivity } from "@/lib/types";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ProjectsDirectory } from "@/components/dashboard/projects-directory";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await requireSession();

  let projects: Project[] = [];
  let activityCounts: Record<string, number> = {};
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
        .select("id, project_id, completed, created_at")
        .in(
          "project_id",
          projects.map((project) => project.id)
        );

      if (activityError) throw activityError;
      activityCounts = (activityData as Pick<ProjectActivity, "id" | "project_id">[])?.reduce<Record<string, number>>(
        (acc, activity) => {
          acc[activity.project_id] = (acc[activity.project_id] ?? 0) + 1;
          return acc;
        },
        {}
      ) ?? {};
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar los proyectos";
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <AppSidebar active="proyectos" session={{ name: session.name, email: session.email }} />

      <div className="min-w-0">
        <header className="flex h-[60px] items-center justify-between border-b border-[var(--hairline)] bg-card/70 px-6 backdrop-blur-sm lg:px-10">
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span>WORKSPACE</span>
            <span className="text-primary">/</span>
            <span className="text-foreground">PROYECTOS</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
              {new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date())}
            </span>
            <span className="rounded-full border border-primary/50 bg-primary/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-primary">
              Directorio
            </span>
          </div>
        </header>

        <main className="px-6 py-8 lg:px-10 lg:py-10">
          {error ? (
            <div className="panel mb-6 border-l-4 border-l-destructive p-4 text-sm text-destructive">
              No se pudieron cargar los datos: {error}
            </div>
          ) : null}
          <ProjectsDirectory initialProjects={projects} activityCounts={activityCounts} />
        </main>
      </div>
    </div>
  );
}

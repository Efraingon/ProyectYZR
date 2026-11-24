"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { DEMO_USER_ID } from "@/lib/constants";
import type { Project, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ActivityIcon,
  ArrowRightIcon,
  CalendarIcon,
  FolderIcon,
  GridIcon,
  ListIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { ProjectFormDialog, type ProjectFormValues } from "@/components/dashboard/project-form-dialog";

const STATUS_LABEL: Record<string, string> = {
  active: "En curso",
  pending: "Pendiente",
  completed: "Completado",
  archived: "Archivado",
};

const STATUS_PILL: Record<string, string> = {
  active: "border-primary/40 bg-primary/15 text-primary",
  pending: "border-accent/40 bg-accent/15 text-accent",
  completed: "border-success/40 bg-success/15 text-success",
  archived: "border-border bg-muted text-muted-foreground",
};

const STATUS_BAR: Record<string, string> = {
  active: "bg-primary",
  pending: "bg-accent",
  completed: "bg-success",
  archived: "bg-muted-foreground",
};

const FILTERS: { key: "all" | ProjectStatus; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "En curso" },
  { key: "pending", label: "Pendientes" },
  { key: "completed", label: "Completados" },
  { key: "archived", label: "Archivados" },
];

function nextStatus(current: string): ProjectStatus {
  if (current === "pending") return "active";
  if (current === "active") return "completed";
  return "pending";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(normalized)
  );
}

interface ProjectsDirectoryProps {
  initialProjects: Project[];
  activityCounts: Record<string, number>;
}

export function ProjectsDirectory({ initialProjects, activityCounts }: ProjectsDirectoryProps) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | ProjectStatus>("all");
  const [view, setView] = React.useState<"grid" | "list">("grid");

  const { data: projects = [], isError, isFetching } = useQuery<Project[]>({
    queryKey: ["projects-directory", DEMO_USER_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", DEMO_USER_ID)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Project[]) ?? [];
    },
    initialData: initialProjects,
    staleTime: 30 * 1000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["projects-directory", DEMO_USER_ID] });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjectStatus }) => {
      const { error } = await supabase.from("projects").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const removeProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const createProject = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const { error } = await supabase.from("projects").insert({
        user_id: DEMO_USER_ID,
        name: values.name,
        description: values.description || null,
        status: values.status,
        start_date: values.start_date || null,
      });
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  async function handleCreate(values: ProjectFormValues) {
    try {
      await createProject.mutateAsync(values);
      return true;
    } catch {
      return false;
    }
  }

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus = filter === "all" || project.status === filter;
      const matchesTerm =
        !term ||
        project.name.toLowerCase().includes(term) ||
        (project.description ?? "").toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [projects, search, filter]);

  const counts = React.useMemo(
    () =>
      FILTERS.reduce<Record<string, number>>((acc, item) => {
        acc[item.key] = item.key === "all" ? projects.length : projects.filter((p) => p.status === item.key).length;
        return acc;
      }, {}),
    [projects]
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Directorio</p>
          <h1 className="mt-2 flex items-center gap-3 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary accent-glow">
              <FolderIcon className="h-6 w-6" />
            </span>
            Proyectos
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestiona, filtra y revisa el estado de cada proyecto desde un solo lugar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-secondary"
        >
          <PlusIcon className="h-4 w-4" />
          + Nuevo proyecto
        </button>
      </div>

      <section className="panel mt-8 p-4" aria-label="Filtros de proyectos">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">Buscar proyectos</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o descripción…"
              className="h-10 w-full rounded-md border border-border bg-background-deep pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </label>

          <div className="flex items-center gap-1.5">
            <GridIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Vista</span>
            <div className="flex overflow-hidden rounded-md border border-border">
              <button
                type="button"
                aria-label="Vista de tarjetas"
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center transition-colors",
                  view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <GridIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Vista de lista"
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center border-l border-border transition-colors",
                  view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={filter === item.key}
              onClick={() => setFilter(item.key)}
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors",
                filter === item.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {item.label} <span className="opacity-70">{counts[item.key] ?? 0}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>
          {filtered.length} de {projects.length} proyectos
          {isFetching ? " · actualizando…" : ""}
        </span>
        <span>{view === "grid" ? "Tarjetas" : "Lista"}</span>
      </div>

      {isError ? (
        <p className="panel mt-4 border-l-4 border-l-destructive p-4 text-sm text-destructive">
          No se pudieron cargar los proyectos.
        </p>
      ) : filtered.length === 0 ? (
        <div className="panel mt-4 flex flex-col items-center px-5 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--hairline)] bg-card text-primary">
            <FolderIcon className="h-7 w-7" />
          </span>
          <p className="mt-4 text-sm text-foreground">No hay proyectos que coincidan con la búsqueda.</p>
          <p className="mt-1 text-xs text-muted-foreground">Prueba con otro término o crea un proyecto nuevo.</p>
        </div>
      ) : view === "grid" ? (
        <section aria-label="Proyectos en tarjetas" className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <article key={project.id} className="panel relative overflow-hidden p-5">
              <span className={cn("absolute inset-y-0 left-0 w-1", STATUS_BAR[project.status] ?? "bg-border")} />
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                  <FolderIcon className="h-5 w-5" />
                </span>
                <button
                  type="button"
                  aria-label={`Cambiar estado de ${project.name}`}
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: project.id, status: nextStatus(project.status) })}
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-mono text-[10px] transition-colors disabled:opacity-50",
                    STATUS_PILL[project.status] ?? "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {STATUS_LABEL[project.status] ?? project.status}
                </button>
              </div>

              <h2 className="mt-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <FolderIcon className="h-4 w-4 text-primary" />
                {project.name}
              </h2>
              <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-muted-foreground">
                {project.description ?? "Sin descripción registrada."}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 font-mono text-[10px]">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {formatDate(project.start_date)}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ActivityIcon className="h-3.5 w-3.5" />
                  {activityCounts[project.id] ?? 0} actividades
                </span>
              </div>

              <div className="mt-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full", STATUS_BAR[project.status] ?? "bg-border")}
                    style={{ width: project.status === "completed" ? "100%" : project.status === "active" ? "60%" : "25%" }}
                  />
                </div>
                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  Creado {formatDate(project.created_at)}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <button
                  type="button"
                  aria-label={`Avanzar estado de ${project.name}`}
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: project.id, status: nextStatus(project.status) })}
                  className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-primary hover:text-secondary disabled:opacity-50"
                >
                  Avanzar
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={removeProject.isPending}
                  onClick={() => removeProject.mutate(project.id)}
                  className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-destructive disabled:opacity-50"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section aria-label="Proyectos en lista" className="panel mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Proyecto</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Estado</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Actividades</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Inicio</th>
                <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id} className="border-b border-border/70 last:border-0 hover:bg-primary/[0.04]">
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-2.5 font-medium text-foreground">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                        <FolderIcon className="h-4 w-4" />
                      </span>
                      {project.name}
                    </span>
                    {project.description ? (
                      <span className="mt-1 block text-xs text-muted-foreground">{project.description}</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 font-mono text-[10px]",
                        STATUS_PILL[project.status] ?? "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      {STATUS_LABEL[project.status] ?? project.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-muted-foreground">
                    {activityCounts[project.id] ?? 0}
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-muted-foreground">
                    {formatDate(project.start_date)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        type="button"
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ id: project.id, status: nextStatus(project.status) })}
                        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-primary hover:text-secondary disabled:opacity-50"
                      >
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                        Estado
                      </button>
                      <button
                        type="button"
                        disabled={removeProject.isPending}
                        onClick={() => removeProject.mutate(project.id)}
                        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-destructive disabled:opacity-50"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <ProjectFormDialog open={showCreate} onClose={() => setShowCreate(false)} onConfirm={handleCreate} />
    </>
  );
}

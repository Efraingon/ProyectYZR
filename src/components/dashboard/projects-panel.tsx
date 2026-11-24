"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { DEMO_USER_ID } from "@/lib/constants";
import type { Project, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FolderIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
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

function nextStatus(current: string): ProjectStatus {
  if (current === "pending") return "active";
  if (current === "active") return "completed";
  return "pending";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(normalized));
}

interface ProjectsPanelProps {
  initialProjects: Project[];
}

export function ProjectsPanel({ initialProjects }: ProjectsPanelProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showCreate, setShowCreate] = React.useState(false);

  const { data: projects = [], isError, isFetching } = useQuery<Project[]>({
    queryKey: ["dashboard-projects", DEMO_USER_ID],
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

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-projects"] });
    router.refresh();
  };

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

  return (
    <>
      <div className={cn("panel overflow-hidden transition-opacity", isFetching && "opacity-70")}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] bg-card/80 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Registro de proyectos</h2>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
              {projects.length} registros · {projects.filter((project) => project.status === "active").length} activos
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-secondary"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            + Nuevo proyecto
          </button>
        </div>

        {isError ? (
          <p className="px-5 py-8 text-sm text-destructive">No se pudieron cargar los proyectos.</p>
        ) : projects.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted-foreground">No hay proyectos registrados todavía.</p>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="mt-4 rounded-md border border-primary px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-primary"
            >
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Proyecto</th>
                  <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Estado</th>
                  <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Inicio</th>
                  <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Creado</th>
                  <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-border/70 transition-colors last:border-0 hover:bg-primary/[0.04]">
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2.5 font-medium text-foreground">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                          <FolderIcon className="h-4 w-4" />
                        </span>
                        {project.name}
                      </span>
                      {project.description ? (
                        <span className="mt-1 block text-xs text-muted-foreground">{project.description}</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        aria-label={`Cambiar estado de ${project.name}`}
                        title="Cambiar estado"
                        disabled={updateStatus.isPending}
                        onClick={() =>
                          updateStatus.mutate({ id: project.id, status: nextStatus(project.status) })
                        }
                        className={cn(
                          "rounded-full border px-2.5 py-1 font-mono text-[10px] transition-colors disabled:opacity-50",
                          STATUS_PILL[project.status] ?? "border-border bg-muted text-muted-foreground"
                        )}
                      >
                        {STATUS_LABEL[project.status] ?? project.status}
                      </button>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-muted-foreground">
                      {formatDate(project.start_date)}
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-muted-foreground">
                      {formatDate(project.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={removeProject.isPending}
                        onClick={() => removeProject.mutate(project.id)}
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProjectFormDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onConfirm={handleCreate}
      />
    </>
  );
}

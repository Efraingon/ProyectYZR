"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { DEMO_USER_ID } from "@/lib/constants";
import type { Project, ProjectStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface ProjectsTableProps {
  initialProjects: Project[];
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  active: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  archived: "bg-zinc-100 text-zinc-800",
};

/**
 * Client Component: interactive projects table.
 * Uses TanStack Query for server-state (fetching/caching/mutations)
 * while the Server Component provides the initial data.
 */
export function ProjectsTable({ initialProjects }: ProjectsTableProps) {
  const queryClient = useQueryClient();

  const {
    data: projects = [],
    isError,
    isFetching,
  } = useQuery<Project[]>({
    queryKey: ["projects", DEMO_USER_ID],
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
    staleTime: 5 * 60 * 1000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjectStatus }) => {
      const { error } = await supabase
        .from("projects")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const removeProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  if (isError) {
    return (
      <div className="p-6 text-sm text-error">
        No se pudieron cargar los proyectos. Revisa tu conexión con Supabase.
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <p className="text-muted text-sm py-8">
        No hay proyectos registrados todavía.{" "}
        <a href="/create-project" className="text-accent hover:underline">
          Crear tu primer proyecto
        </a>
      </p>
    );
  }

  const nextStatus = (current: string): ProjectStatus => {
    if (current === "pending") return "active";
    if (current === "active") return "completed";
    return "pending";
  };

  return (
    <div className={isFetching ? "opacity-70 transition-opacity" : "transition-opacity"}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell className="text-sm text-muted line-clamp-2">
                {project.description || "Sin descripción"}
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  onClick={() =>
                    updateStatus.mutate({
                      id: project.id,
                      status: nextStatus(project.status),
                    })
                  }
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-transform duration-150 hover:scale-105 ${
                    statusColors[project.status] ?? "bg-yellow-100 text-yellow-800"
                  }`}
                  aria-label={`Cambiar estado de ${project.name}`}
                >
                  {project.status}
                </button>
              </TableCell>
              <TableCell>
                {project.start_date
                  ? new Date(
                      /^\d{4}-\d{2}-\d{2}$/.test(project.start_date)
                        ? `${project.start_date}T12:00:00`
                        : project.start_date
                    ).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                {new Date(project.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-error"
                  disabled={removeProject.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        `¿Estás seguro de eliminar el proyecto "${project.name}"?`
                      )
                    ) {
                      removeProject.mutate(project.id);
                    }
                  }}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

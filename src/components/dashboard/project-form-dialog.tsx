"use client";

import * as React from "react";
import { CalendarIcon, CheckIcon, FolderIcon } from "@/components/ui/icons";
import type { ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ProjectFormValues {
  name: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
}

const INITIAL_FORM: ProjectFormValues = {
  name: "",
  description: "",
  status: "pending",
  start_date: "",
};

const inputClass =
  "h-10 w-full rounded-md border border-border bg-background-deep px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

interface ProjectFormDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: ProjectFormValues) => Promise<boolean>;
}

export function ProjectFormDialog({ open, onClose, onConfirm }: ProjectFormDialogProps) {
  const [form, setForm] = React.useState<ProjectFormValues>(INITIAL_FORM);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
      setError(null);
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;

    setPending(true);
    setError(null);
    try {
      const saved = await onConfirm({ ...form, name: form.name.trim(), description: form.description.trim() });
      if (saved) {
        setForm(INITIAL_FORM);
        onClose();
      } else {
        setError("No se pudo crear el proyecto.");
      }
    } catch {
      setError("No se pudo crear el proyecto.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nuevo-proyecto-titulo"
        className="hairline-grid accent-glow w-full max-w-lg overflow-hidden rounded-xl border border-primary/40 bg-card shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--hairline)] bg-primary px-6 py-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-primary-foreground/70">Nuevo registro</p>
            <h2 id="nuevo-proyecto-titulo" className="mt-1 flex items-center gap-2 text-lg font-bold text-primary-foreground">
              <FolderIcon className="h-5 w-5" />
              Crear proyecto
            </h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="rounded-md border border-primary-foreground/30 px-2 py-1 font-mono text-xs text-primary-foreground hover:bg-primary-foreground/10"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <label className="block space-y-1.5">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <FolderIcon className="h-3.5 w-3.5 text-primary" />
              Nombre
            </span>
            <input
              autoFocus
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className={inputClass}
              placeholder="Nombre del proyecto"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <CheckIcon className="h-3.5 w-3.5 text-accent" />
              Descripción
            </span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className={cn(inputClass, "h-auto py-2")}
              placeholder="Descripción breve"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <CheckIcon className="h-3.5 w-3.5 text-success" />
                Estado
              </span>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as ProjectStatus })}
                className={inputClass}
              >
                <option className="bg-card text-foreground" value="pending">Pendiente</option>
                <option className="bg-card text-foreground" value="active">En curso</option>
                <option className="bg-card text-foreground" value="completed">Completado</option>
                <option className="bg-card text-foreground" value="archived">Archivado</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <CalendarIcon className="h-3.5 w-3.5 text-warning" />
                Fecha de inicio
              </span>
              <input
                type="date"
                value={form.start_date}
                onChange={(event) => setForm({ ...form, start_date: event.target.value })}
                className={inputClass}
              />
            </label>
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-primary px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary-foreground hover:bg-secondary disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar proyecto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

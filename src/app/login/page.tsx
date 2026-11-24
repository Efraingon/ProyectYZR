import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <main className="hairline-grid relative grid min-h-screen place-items-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative grid w-full max-w-4xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="hidden flex-col justify-between rounded-xl border border-[var(--hairline)] bg-[hsl(var(--background-deep))] p-9 lg:flex">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground accent-glow">
              PY
            </span>
            <div className="leading-tight">
              <p className="font-bold tracking-tight text-foreground">ProyectYZR</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">Control center</p>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Acceso restringido</p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-foreground">
              Todo tu registro, <span className="text-primary">a la vista</span>.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Proyectos, actividad y proyecciones en un centro de control construido para decidir rápido.
            </p>
            <div className="mt-8 flex gap-2 font-mono text-[9px] uppercase tracking-widest">
              <span className="rounded border border-primary/40 bg-primary/10 px-2 py-1 text-primary">Proyectos</span>
              <span className="rounded border border-accent/40 bg-accent/10 px-2 py-1 text-accent">Actividades</span>
              <span className="rounded border border-success/40 bg-success/10 px-2 py-1 text-success">Métricas</span>
            </div>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Monrys palette · IBM Plex
          </p>
        </section>

        <section className="panel p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Bienvenido de nuevo</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Iniciar sesión</h2>
          <p className="mt-2 text-sm text-muted-foreground">Introduce tus credenciales para continuar.</p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <div className="mt-7 rounded-lg border border-[var(--hairline)] bg-background-deep p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Acceso demo</p>
            <p className="mt-2">
              Usuario <span className="font-mono font-medium text-foreground">demo</span>
              <span className="mx-2 text-border">·</span>
              Contraseña <span className="font-mono font-medium text-foreground">proyectyzr2026</span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

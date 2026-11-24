import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { AnalyticsIcon, DashboardIcon, LogoutIcon, ProjectsIcon, UserIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type ActiveSection = "resumen" | "proyectos" | "analitica";

const NAV_ITEMS: { key: ActiveSection; href: string; label: string; icon: typeof DashboardIcon; index: string }[] = [
  { key: "resumen", href: "/dashboard#resumen", label: "Resumen", icon: DashboardIcon, index: "01" },
  { key: "proyectos", href: "/projects", label: "Proyectos", icon: ProjectsIcon, index: "02" },
  { key: "analitica", href: "/dashboard#analitica", label: "Analítica", icon: AnalyticsIcon, index: "03" },
];

interface AppSidebarProps {
  active: ActiveSection;
  session: { name: string; email: string };
}

export function AppSidebar({ active, session }: AppSidebarProps) {
  return (
    <aside className="hairline-grid flex flex-col border-b border-[var(--hairline)] bg-[hsl(var(--background-deep))] lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="flex h-[60px] items-center gap-3 border-b border-[var(--hairline)] px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-mono text-xs font-semibold text-primary-foreground accent-glow">
          PY
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-foreground">ProyectYZR</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">Control center</p>
        </div>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 px-4 py-7">
        <p className="px-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Workspace</p>
        <div className="mt-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary font-semibold text-primary-foreground shadow-[0_0_24px_rgba(245,158,11,0.25)]"
                    : "border border-transparent text-muted-foreground hover:border-[var(--hairline)] hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <span className="font-mono text-[10px] opacity-70">{item.index}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-lg border border-[var(--hairline)] bg-card/60 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Estado del sistema</p>
          <p className="mt-2 text-sm font-medium text-foreground">Operativo</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-3/4 bg-success" />
          </div>
        </div>
      </nav>

      <div className="border-t border-[var(--hairline)] p-4">
        <div className="flex items-center gap-3 px-2 pb-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/40 bg-accent/10 text-accent">
            <UserIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">{session.name}</p>
            <p className="truncate font-mono text-[10px] text-muted-foreground">{session.email}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <LogoutIcon className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}

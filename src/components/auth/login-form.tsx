"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center rounded-md bg-primary font-mono text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Verificando…" : "Entrar"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="username" className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Usuario
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          defaultValue="demo"
          required
          className="h-11 w-full rounded-md border border-border bg-background-deep px-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          placeholder="demo"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 w-full rounded-md border border-border bg-background-deep px-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          placeholder="••••••••••••"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

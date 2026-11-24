"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

/**
 * SupabaseProvider - exposes session state to client components.
 * Uses React Context so any component can consume the current session.
 */
interface SupabaseContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const SupabaseContext = React.createContext<SupabaseContextValue>({
  session: null,
  user: null,
  loading: true,
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseContext.Provider value={{ session, user, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabaseContext() {
  return React.useContext(SupabaseContext);
}

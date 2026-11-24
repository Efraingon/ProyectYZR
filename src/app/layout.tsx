import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers";

export const metadata: Metadata = {
  title: "ProyectYZR - Registro de Proyectos",
  description: "Aplicación web de registro y gestión de proyectos con Next.js y Supabase",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

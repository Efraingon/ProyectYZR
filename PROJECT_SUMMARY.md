# ProyectYZR — Resumen técnico

La documentación actualizada vive en [`README.md`](./README.md). Este archivo conserva un resumen rápido del estado del proyecto.

## Objetivo

Centralizar el registro, seguimiento y proyección de proyectos y actividades en una aplicación web con acceso controlado y datos persistentes en PostgreSQL.

## Stack activo

- Next.js 16.4.6 (App Router + Turbopack)
- React 19 y TypeScript 7
- Tailwind CSS 3.4 + IBM Plex Sans/Mono
- Supabase/PostgreSQL con RLS
- TanStack Query v5 para estado del servidor
- Cookie firmada con HMAC-SHA256 para la sesión
- Playwright para verificación E2E

## Rutas

- `/login`: acceso con `demo` / `proyectyzr2026`
- `/dashboard`: KPIs, gráficas de torta, proyección por actividades y tabla resumida
- `/projects`: directorio propio con búsqueda, filtros y vistas de tarjetas/lista

## Datos

`supabase/schema.sql` define `profiles`, `projects` y `project_activities`, con índices, políticas RLS y el usuario demo `00000000-0000-0000-0000-000000000000`.

## Verificación

`npm run build` y `npx playwright test tests/ui-verification.spec.ts` pasan correctamente (7/7 pruebas).

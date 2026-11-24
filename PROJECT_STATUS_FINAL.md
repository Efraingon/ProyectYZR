# ProyectYZR — Estado final

**Estado: APROBADO / listo para subir a GitHub.**

## Entregado

- Acceso obligatorio con cookie HttpOnly firmada y guardia en `src/proxy.ts`.
- Dashboard maximalista con paleta Monrys, KPIs, dos gráficas de torta y proyección mensual de actividades.
- Directorio de proyectos independiente en `/projects` con buscador, filtros, vista de tarjetas/lista e iconos.
- Modal flotante reutilizable para crear proyectos, con contraste accesible y cierre por `Escape`/backdrop.
- CRUD real sobre Supabase/PostgreSQL con RLS y usuario demo.
- Documentación en `README.md` con objetivo, aporte organizacional, tecnologías, puesta en marcha y notas de producción.

## Verificación

- `npm run build`: correcto.
- `npx playwright test tests/ui-verification.spec.ts`: 7/7 pruebas en verde.
- Flujo crear → cambiar estado → eliminar probado y limpio en el directorio de proyectos.

## Seguridad

`.env.local` no se versiona. Antes de producción deben cambiarse credenciales, `AUTH_SECRET` y las cláusulas demo de RLS, tal como se indica en el `README.md`.

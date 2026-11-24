# ProyectYZR

Aplicación web para registrar, gestionar y proyectar proyectos y sus actividades. Construida con **Next.js 16 (App Router)** y **Supabase/PostgreSQL**, con acceso obligatorio por usuario y contraseña.

Repositorio: <https://github.com/Efraingon/ProyectYZR>

---

## 1. Objetivo del proyecto

ProyectYZR nace para sustituir el seguimiento disperso de proyectos (correos, hojas de cálculo y listas informales) por una **única aplicación web** donde la organización pueda:

- Registrar proyectos con nombre, descripción, estado y fecha de inicio.
- Mantener una bitácora de actividades por proyecto.
- Visualizar el avance mediante indicadores, gráficas de torta y una proyección mensual de actividades.
- Gestionar el ciclo de vida del proyecto: pendiente → en curso → completado, además de archivado.
- Acceder solo después de autenticarse, con datos persistidos en PostgreSQL y políticas de seguridad por fila.

En resumen: **centralizar la operación y dar visibilidad del estado real de los proyectos a la organización.**

---

## 2. Aporte a la organización

| Aporte | Descripción |
| --- | --- |
| **Visibilidad única** | Dashboard con KPIs, distribución de estados, avance de actividades y proyección del próximo mes. |
| **Trazabilidad** | Cada proyecto y actividad conserva `created_at` / `updated_at`, estado y descripción. |
| **Toma de decisiones** | La proyección por actividades se calcula con datos reales de los últimos 3 meses, no con valores inventados. |
| **Control de acceso** | Ruta protegida por cookie firmada HttpOnly; las consultas se repiten en el servidor antes de renderizar datos. |
| **Seguridad de datos** | Row Level Security (RLS) en Supabase: cada usuario solo gestiona sus proyectos y actividades. |
| **Eficiencia operativa** | CRUD completo desde el dashboard y desde un directorio dedicado, con búsqueda, filtros y vistas. |
| **Base para crecimiento** | Esquema idempotente, tipos compartidos y componentes separados para ampliar módulos o cambiar el diseño. |

---

## 3. Tecnologías utilizadas

| Capa | Tecnología | Uso en el proyecto |
| --- | --- | --- |
| Framework | **Next.js 16.4.6** (App Router, Turbopack) | Rutas, Server Components, Server Actions y `proxy.ts` para la guardia de rutas. |
| UI | **React 19** | Componentes interactivos del dashboard, directorio y modal flotante. |
| Lenguaje | **TypeScript 7** | Tipado de entidades, acciones y respuestas de Supabase. |
| Estilos | **Tailwind CSS 3.4** + CSS personalizado | Diseño maximalista con paleta Monrys e IBM Plex Sans/Mono. |
| Base de datos | **Supabase / PostgreSQL** | Tablas `profiles`, `projects`, `project_activities`, índices y RLS. |
| Cliente de datos | **@supabase/supabase-js** | Clientes para servidor y navegador. |
| Estado del servidor | **TanStack Query v5** | Caché e invalidación después de crear, actualizar o eliminar proyectos. |
| Autenticación | **Web Crypto API (HMAC-SHA256)** | Token de sesión firmado almacenado en cookie HttpOnly. |
| Gráficas | **SVG + CSS** | Donuts y barras de proyección, sin dependencias de charting. |
| Pruebas | **Playwright** | 7 pruebas de acceso, dashboard, gráficas, directorio, modal y contraste. |
| Tipografía | **IBM Plex Sans / IBM Plex Mono** | Identidad visual consistente con la paleta de referencia. |

> Zustand y el hook `useSupabase` quedan disponibles para futuras expansiones; el flujo activo usa TanStack Query y acciones de servidor.

---

## 4. Funcionalidades principales

- **`/login`**: acceso obligatorio con `demo` / `proyectyzr2026`.
- **`/dashboard`**: KPIs, gráficas de torta, proyección de actividades y tabla resumida de proyectos.
- **`/projects`**: directorio propio con buscador, filtros por estado, vista de tarjetas/lista, iconos y acciones CRUD.
- **Modal flotante**: formulario de creación con `role="dialog"`, cierre por `Escape`/backdrop y campos con contraste accesible.
- **Datos reales**: todo se lee y escribe en Supabase; no hay datos simulados en el código.

---

## 5. Estructura de datos

El script `supabase/schema.sql` crea:

- `profiles`: usuarios de la app; incluye el usuario demo `00000000-0000-0000-0000-000000000000`.
- `projects`: nombre, descripción, estado (`pending`, `active`, `completed`, `archived`), fecha de inicio y auditoría.
- `project_activities`: actividades por proyecto, con `completed` y fechas.
- Índices y políticas RLS para que un usuario solo maneje sus propios registros.

---

## 6. Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar las variables de entorno
cp .env.example .env.local
# Edita .env.local con tu URL de Supabase, anon key y AUTH_SECRET

# 3. Ejecutar supabase/schema.sql en el SQL Editor de Supabase

# 4. Levantar la aplicación
npm run dev
```

Abre <http://localhost:3000> e ingresa con:

- Usuario: `demo`
- Contraseña: `proyectyzr2026`

> `.env.local` está ignorado por Git. Nunca subas llaves reales al repositorio.

---

## 7. Verificación

```bash
npm run build
npx playwright test tests/ui-verification.spec.ts
```

Resultado esperado: compilación correcta y **7/7 pruebas en verde**.

---

## 8. Notas para producción

Antes de llevar la aplicación a producción se recomienda:

1. Cambiar las credenciales demo y `AUTH_SECRET`.
2. Eliminar las cláusulas `user_id = '00000000-...'` de las políticas RLS.
3. Usar Supabase Auth nativo si se requiere alta de usuarios reales (el proyecto actual usa sesión app-level porque el proyecto Supabase tiene confirmación de correo activa).
4. Servir bajo HTTPS para que la cookie de sesión tenga `secure: true`.

---

**Estado:** aplicación funcional, verificada y lista para ser presentada o desplegada.

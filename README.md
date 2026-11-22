# Muebles Angulo — web corporativa y panel de administración

Catálogo web de Muebles Angulo (Barbastro, Huesca). **No es una tienda online**: no hay carrito ni pagos.
Muestra productos, proyectos y servicios, presenta la empresa y ofrece canales de contacto
(teléfono, WhatsApp, correo y formulario). El contenido se gestiona desde un panel propio en `/admin`.

## Tecnología
Next.js 16 (App Router) · TypeScript estricto · Tailwind CSS 4 · Framer Motion · Supabase
(PostgreSQL, Auth, Storage) · Vercel · Cloudflare · Zod.

## Estructura
- `src/app` — páginas públicas y panel (`src/app/admin`).
- `src/lib` — acceso a datos, autenticación, utilidades.
- `src/components` — componentes de la web y del panel.
- `supabase/migrations` — esquema, seguridad (RLS) y datos iniciales. Se ejecutan en orden 001 → 004.
- `tests` — pruebas unitarias (Vitest).
- `docs` — arquitectura, despliegue y guía del panel.

## Variables de entorno
Ver `.env.example`. Nunca se suben claves secretas al repositorio.

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (publishable) |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (sitemap y metadatos) |

## Comandos
```
npm install
npm run dev        # desarrollo
npm run typecheck  # comprobación de tipos
npm run lint
npm run test       # pruebas unitarias
npm run build
```

## Estado del proyecto
Ver `docs/ARCHITECTURE.md` (qué está hecho) y `SECURITY.md` (medidas y pendientes).
El sitio permanece con `noindex` hasta que la empresa confirme el contenido real.

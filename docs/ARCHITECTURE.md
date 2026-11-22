# Arquitectura

## Visión general
Next.js (Vercel) sirve la web pública y el panel. Los datos viven en Supabase (PostgreSQL + Storage).
Las páginas públicas leen con un cliente **sin sesión** (clave pública) y la base de datos solo devuelve
lo publicado gracias a RLS. El panel usa un cliente **con sesión** (cookies) y comprueba permisos en cada acción.

## Flujo de datos
- Web pública → `src/lib/data.ts`, `company.ts`, `texts.ts` → Supabase (caché de 60 s; el panel invalida con `revalidatePath`).
- Panel → Server Actions (`src/app/admin/(panel)/*/actions.ts`) → Supabase con la sesión del usuario → RLS.
- Formulario de contacto → función SQL `submit_contact` (valida y limita abuso) → tabla `contact_submissions`.
- Usuarios → funciones SQL `admin_list_users` y `admin_set_user` (con salvaguardas).

## Base de datos (`supabase/migrations`)
001 esquema · 002 seguridad/RLS/Storage · 003 datos iniciales · 004 contacto y usuarios.

## Estado por área
| Área | Estado |
|---|---|
| Web pública (portada, colecciones, productos, proyectos, servicios, nosotros, contacto, legales) | Hecho, lee de la base de datos |
| Panel: productos, categorías, proyectos, servicios, medios, ajustes, portada y nosotros, mensajes, usuarios, actividad | Hecho |
| Sitemap y robots | Hecho |
| Pruebas unitarias | Escritas (15). Ver nota en `docs/DEPLOYMENT.md` |
| Pruebas de extremo a extremo (Playwright) | Pendiente |
| CSP, MFA, límite de acceso | Pendiente (ver SECURITY.md) |
| Dominio, Cloudflare, Sentry, copias | Pendiente |
| Google Maps (tras consentimiento de cookies) | Pendiente; requiere dirección verificada |

## Decisiones
- No hay e-commerce: precios opcionales y ocultos por defecto.
- Sin claves de servicio en Vercel: las operaciones privilegiadas se hacen con funciones SQL `SECURITY DEFINER` que comprueban permisos.
- Nunca se inventan datos de la empresa: lo que falta se muestra como `[PENDIENTE: …]`.

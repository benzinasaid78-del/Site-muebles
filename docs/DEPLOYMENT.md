# Despliegue

## Flujo actual
GitHub (rama principal) → Vercel despliega automáticamente cada cambio.
Con el móvil: se sube un `.zip` a la raíz del repositorio y la acción `apply-zip.yml`
(en `.github/workflows`) lo descomprime en sus rutas, borra el zip y hace commit.

## Primera puesta en marcha
1. Crear proyecto en Supabase y ejecutar en el SQL Editor, en orden, `001`, `002`, `003` y `004`.
2. Crear el primer usuario en Authentication → Add user. Activarlo como `super_admin` con una consulta SQL ejecutada por el propietario.
3. En Vercel → Settings → Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`. Después, **Redeploy** (los cambios de variables no se aplican solos).
4. En Supabase → Authentication → desactivar «Allow new users to sign up».

## Dominio y Cloudflare (pendiente)
1. Añadir el dominio en Vercel (Settings → Domains) y seguir los registros DNS que indique.
2. En Cloudflare, crear esos registros; para el registro que apunta a Vercel usar modo «solo DNS» (nube gris) salvo que se configure el proxy a propósito.
3. Poner `NEXT_PUBLIC_SITE_URL` con el dominio final y redeployar.

## Salir de «noindex» (publicar para buscadores)
Solo cuando haya contenido real y datos legales completos: quitar `robots: { index: false }` de `src/app/layout.tsx`.

## Pruebas
`npm run test` ejecuta las pruebas unitarias con Vitest. Aún no hay integración continua que las lance;
se puede añadir un workflow de GitHub Actions (`npm ci && npm run typecheck && npm run lint && npm test`).

## Copias de seguridad
El plan gratuito de Supabase no hace copias automáticas. Opciones: pasar a un plan de pago o exportar
periódicamente (Database → Backups / `pg_dump`) y guardar también las imágenes del bucket `media`.

## Si algo falla
Vercel → Deployments → el despliegue → Build Logs (errores de compilación) o Logs → filtro «Error» (errores en ejecución).

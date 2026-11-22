# Seguridad

## Medidas aplicadas
- **Autenticación** con Supabase Auth. No hay registro público: las cuentas las crea un administrador y nacen **inactivas y sin rol**.
- **Autorización en el servidor**: cada página y cada acción del panel llama a `requirePermission(...)`. Ocultar un botón nunca es la protección.
- **RLS (Row Level Security)** activa en todas las tablas: el público solo lee lo publicado/activo; el personal solo hace lo que su rol permite.
- **Roles**: Super Admin (todo), Admin (contenido, sin usuarios ni seguridad), Editor (crear/editar, sin borrar).
- **Usuarios**: no se puede modificar la propia cuenta y siempre debe quedar un Super Admin activo (comprobado en la base de datos).
- **Validación** de todas las entradas con Zod (servidor) y repetida en la base de datos (formulario de contacto).
- **Subida de imágenes**: tipo real por firma (no por extensión), solo JPEG/PNG/WEBP/AVIF, máximo 4 MB, nombre aleatorio; SVG y HTML rechazados.
- **Formulario de contacto**: campo trampa (honeypot), límite de 3 mensajes por correo y hora y 30 por hora en total.
- **Registro de actividad** solo con metadatos (nunca contraseñas ni contenido de mensajes).
- **Cabeceras de seguridad** en `next.config.ts`; `/admin` marcado `noindex` y bloqueado en `robots.txt`.
- **Borrado lógico** de productos, categorías, proyectos y servicios.
- No hay claves secretas en el código; solo la clave pública (publishable) llega al navegador.

## Pendiente (no implementado todavía)
- Política CSP estricta (hay que probarla con el sitio real para no romper nada).
- Límite de intentos de acceso (el de Supabase Auth es el predeterminado).
- Verificación en dos pasos (MFA) para los administradores.
- CAPTCHA en el formulario si aparece spam.
- Copias de seguridad: el plan gratuito de Supabase **no** incluye copias automáticas.

## Buenas prácticas para quien administra
- Contraseñas largas y únicas; no compartirlas.
- Desactivar en Supabase «Allow new users to sign up».
- Eliminar cuentas de prueba.
- Revisar de vez en cuando **Usuarios** y **Actividad**.

## Cómo informar de un problema
Escribir al responsable de la web con una descripción y, si es posible, capturas. No publicar el fallo.

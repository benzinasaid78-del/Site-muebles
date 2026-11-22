# Guía del panel de administración

Entrada: `/admin`. Con el móvil, el menú está en «Menú», arriba.

## Roles
- **Super Admin**: todo, incluidos usuarios.
- **Admin**: contenido (productos, categorías, proyectos, servicios, textos, medios, mensajes, actividad); no gestiona usuarios.
- **Editor**: crea y edita productos, proyectos, servicios y medios; no borra.

## Tareas habituales
**Subir imágenes** — Medios → elegir archivos (JPG, PNG, WEBP o AVIF, hasta 4 MB) → escribir el texto alternativo.

**Crear un producto** — Productos → Nuevo producto → nombre, categoría, descripción, imágenes → Estado **Publicado** → Guardar.
Los productos en *Borrador* no se ven en la web. El precio solo se muestra si marcas «Mostrar precio».

**Categorías (colecciones)** — Categorías: nombre, descripción, orden, imagen de portada y activa/inactiva.

**Proyectos y servicios** — igual que productos; solo lo *Publicado* aparece en la web. Publica solo servicios que la empresa ofrece de verdad.

**Datos de la empresa** — Ajustes: razón social, NIF, dirección, teléfono, WhatsApp (solo dígitos con prefijo de país), correo, horario. Lo vacío se muestra como «pendiente».

**Textos de portada y Nosotros** — Portada y Nosotros: textos, imágenes y equipo (solo con consentimiento de las personas).

**Mensajes** — lee las consultas del formulario y márcalas como atendidas. Contienen datos personales: úsalos solo para responder.

**Usuarios** (Super Admin) — crea la cuenta en Supabase (Authentication → Add user); aparecerá inactiva. Asígnale rol y actívala en Usuarios. Para dar de baja, ponla Inactiva.

**Actividad** — quién hizo qué y cuándo.

## Eliminar
Productos, categorías, proyectos y servicios se eliminan de forma lógica. Una imagen usada en algún sitio no se puede borrar hasta quitarla de allí.

## Seguridad
Cierra sesión en dispositivos ajenos, usa contraseñas largas y no las compartas.

# Conectar tu Instagram (una sola vez, ~25 minutos)

Esto habilita:
- **🚀 Subir directo a IG**: publica carrusel, post, historia y reel en **tu** cuenta.
- **Leer un local desde su link de Instagram**: logo, bio, web y últimas fotos (solo cuentas de empresa o creador).

Se usa la API oficial de Meta. Tu app de Meta queda en **modo desarrollo**: como sos el administrador, funciona con tu cuenta sin pasar por revisión de Meta.

> Los menús de Meta cambian seguido. Si un nombre no coincide exacto, buscá el más parecido o mandá captura.

**Antes de empezar:** tu Instagram tiene que ser **profesional** (empresa o creador). Si no lo es: Instagram → Configuración → *Tipo de cuenta y herramientas* → *Cambiar a cuenta profesional*.

---

## 1. Crear una Página de Facebook

1. Entrá a <https://www.facebook.com/pages/create>.
2. Nombre: **F-C Web Studio** · Categoría: *Diseñador de sitios web* (o similar) → **Crear página**. No hace falta completar nada más.

## 2. Vincular tu Instagram a la Página

Cualquiera de estos caminos:
- **Desde la Página de Facebook:** cambiá a la Página (tu foto arriba a la derecha → la Página) → Configuración → *Cuentas vinculadas* → **Instagram** → Conectar cuenta.
- **Desde Meta Business Suite** (<https://business.facebook.com>): Configuración → Cuentas de Instagram → Conectar.

Iniciá sesión con tu Instagram cuando lo pida y aceptá todo.

## 3. Crear la app de Meta

1. Entrá a <https://developers.facebook.com/apps> (con tu Facebook). Si es la primera vez, registrate como desarrollador (gratis).
2. **Crear app** → caso de uso: **Otro** → tipo: **Empresa** (Business). Nombre: *Estudio IG*.
3. En el panel de la app, agregá el producto **Instagram** y elegí **"API con inicio de sesión de Facebook"** (*API setup with Facebook login*).
4. Andá a **Configuración de la app → Básica** y copiá:
   - **Identificador de la app** → será `META_APP_ID`
   - **Clave secreta de la app** (tocá *Mostrar*) → será `META_APP_SECRET`

## 4. Preparar Vercel

1. En <https://vercel.com> → tu proyecto → **Storage → Create Database → Blob** → nombre `estudio-ig`, acceso **Public** → **Create** → conectalo al proyecto.
   (Agrega solo `BLOB_READ_WRITE_TOKEN`. Ahí se guardan un rato las imágenes para que Instagram las descargue; la app las borra después de publicar.)
2. **Settings → Environment Variables**, agregá:

| Variable | Valor |
|---|---|
| `STUDIO_PASSWORD` | una clave que elijas (la vas a escribir en la app) |
| `META_APP_ID` | el identificador del paso 3 |
| `META_APP_SECRET` | la clave secreta del paso 3 |

3. **Deployments → ⋯ → Redeploy**.

## 5. Generar el token

1. Abrí **Graph API Explorer**: <https://developers.facebook.com/tools/explorer>.
2. Arriba a la derecha, en *Meta App*, elegí **Estudio IG**.
3. En *User or Page* elegí **Get User Access Token**.
4. En *Permissions* agregá estos 5:
   - `pages_show_list`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`
   - `business_management`
5. **Generate Access Token** → aceptá, y cuando pregunte elegí **tu Página** y **tu Instagram**.
6. Copiá el token largo que aparece (empieza con `EAA…`).

## 6. Convertirlo y terminar

1. Abrí tu app publicada → pestaña **🚀 Subir a IG** → escribí tu **Clave del estudio**.
2. A la derecha, en **Convertir mi token**, pegá el token y tocá **Convertir**.
3. Te muestra dos valores: copialos a Vercel como `IG_PAGE_TOKEN` e `IG_USER_ID`.
4. **Redeploy**. Listo: la pestaña muestra "Conectado como @tucuenta".

El token de Página que se genera **no vence**. Si algún día deja de andar (por ejemplo, si cambiás la contraseña de Facebook), repetí los pasos 5 y 6.

---

## Cómo publicar

Pestaña **🚀 Subir a IG** → marcá qué subir (carrusel, post, historia, reel) → **Publicar ahora** → tocá de nuevo para confirmar. Al terminar te deja el link de cada publicación.

## Límites que pone Instagram

- Solo cuentas **profesionales**; hasta **50 publicaciones cada 24 horas** (un carrusel cuenta como una).
- Las historias se publican **sin stickers** (link, encuesta, ubicación).
- El reel sale sin música; si querés una canción de Instagram, subilo desde la app.
- Se publica siempre en **tu** cuenta. Para la cuenta de un local, descargá los archivos y subilos desde su celu.

## Si algo falla

| Mensaje | Qué hacer |
|---|---|
| *Clave del estudio incorrecta* | Escribí la misma clave que `STUDIO_PASSWORD`. |
| *El token no ve ninguna Página* | En el paso 5 faltó `pages_show_list` o no elegiste la Página. |
| *no tiene un Instagram vinculado* | Repetí el paso 2. |
| *(#10)* o error de permisos | Generá el token de nuevo con **los 5 permisos** del paso 5. |
| *No pude cargar el módulo de subida* | Revisá tu conexión y que el Blob esté creado (paso 4). |
| *Instagram rechazó el archivo* | Probá de nuevo; si sigue, mandá captura del mensaje. |

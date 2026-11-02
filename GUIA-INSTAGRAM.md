# Conectar tu Instagram (una sola vez, ~20 minutos)

Esto habilita dos cosas del estudio:
- **Subir directo a IG**: publica carrusel, post, historia y reel en tu cuenta.
- **Leer un local desde su link de Instagram**: bio, web, foto de perfil y últimas fotos (solo cuentas de empresa o creador).

Se usa la API oficial de Meta. Tu app de Meta queda en **modo desarrollo**: como sos el administrador, funciona con tu cuenta sin pasar por revisión de Meta.

> Los menús de Meta cambian seguido. Si un nombre no coincide exacto, buscá el más parecido.

---

## 1. Crear una Página de Facebook

1. Entrá a <https://www.facebook.com/pages/create>.
2. Nombre: **F-C Web Studio** · Categoría: *Diseñador de sitios web* (o similar) → **Crear página**.

## 2. Vincular tu Instagram profesional a la Página

Cualquiera de estos caminos:
- **Desde la Página de Facebook:** Configuración → *Cuentas vinculadas* → **Instagram** → Conectar cuenta.
- **Desde Meta Business Suite** (<https://business.facebook.com>): Configuración → Cuentas de Instagram → Conectar.

Iniciá sesión con tu Instagram cuando lo pida y aceptá.

## 3. Crear la app de Meta

1. Entrá a <https://developers.facebook.com/apps> (iniciá sesión con tu Facebook) → **Crear app**.
2. Caso de uso: **Otro** → tipo de app: **Empresa** (Business). Nombre: *Estudio IG*.
3. En el panel de la app, agregá el producto **Instagram** y elegí la configuración **"API con inicio de sesión de Facebook"** (*API setup with Facebook login*).
4. Andá a **Configuración de la app → Básica** y copiá:
   - **Identificador de la app** → será `META_APP_ID`
   - **Clave secreta de la app** → será `META_APP_SECRET`

## 4. Cargar las variables en Vercel (primera tanda)

En Vercel → tu proyecto → **Settings → Environment Variables**, agregá:

| Variable | Valor |
|---|---|
| `STUDIO_PASSWORD` | una clave que elijas (la vas a escribir en el estudio) |
| `META_APP_ID` | el identificador del paso 3 |
| `META_APP_SECRET` | la clave secreta del paso 3 |

Además, en **Storage → Create → Blob** creá un almacenamiento **público** y conectalo al proyecto (agrega solo `BLOB_READ_WRITE_TOKEN`). Ahí se guardan un rato las imágenes para que Instagram las descargue; el estudio las borra después de publicar.

Hacé **Deployments → ⋯ → Redeploy**.

## 5. Generar el token

1. Abrí **Graph API Explorer**: <https://developers.facebook.com/tools/explorer>.
2. Arriba a la derecha elegí tu app **Estudio IG**.
3. En *Usuario o página* elegí **Obtener token de acceso de usuario** y marcá estos permisos:
   - `pages_show_list`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`
   - `business_management`
4. **Generate Access Token** → aceptá y elegí tu Página y tu Instagram cuando pregunte.
5. Copiá el token largo que aparece.

## 6. Convertirlo y terminar

1. Abrí tu estudio publicado → pestaña **🚀 Subir a IG** → escribí tu **Clave del estudio**.
2. En **Convertir mi token**, pegá el token y tocá **Convertir**.
3. Te muestra dos valores: copialos a Vercel como `IG_PAGE_TOKEN` y `IG_USER_ID`.
4. **Redeploy**. Listo: la pestaña muestra "Conectado como @tucuenta".

El token de Página que se genera **no vence**. Si algún día deja de andar (por ejemplo, si cambiás la contraseña de Facebook), repetí los pasos 5 y 6.

---

## Límites que pone Instagram

- Solo cuentas **profesionales** (empresa o creador).
- Hasta **50 publicaciones cada 24 horas** (un carrusel cuenta como una).
- Las historias se publican **sin stickers** (link, encuesta, ubicación).
- El reel sale sin música; si querés una canción de Instagram, subilo desde la app.
- Leer otros locales solo funciona si su cuenta es de **empresa o creador**.

## Si algo falla

| Mensaje | Qué hacer |
|---|---|
| *Clave del estudio incorrecta* | Escribí la misma clave que `STUDIO_PASSWORD`. |
| *El token no ve ninguna Página* | En el paso 5 faltó `pages_show_list` o no elegiste la Página. |
| *no tiene un Instagram vinculado* | Repetí el paso 2. |
| *(#10) / permisos* al publicar | Generá el token de nuevo con **todos** los permisos del paso 5. |
| *Instagram rechazó el archivo* | Probá de nuevo; si sigue, avisame qué texto aparece. |

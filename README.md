# Estudio de Contenido IG

Herramienta web de **F-C Web Studio** para crear contenido de Instagram (carrusel, post, historia, reel MP4 y texto con hashtags) y **publicarlo directo** en tu cuenta.

## Qué hace

**Modo "Mi app o web"**: promocionar un proyecto propio.
- Acepta `.zip`, carpeta, `index.html` suelto o un link (repo de GitHub, GitHub Pages, Vercel o cualquier dominio).
- Arma los textos solo y **copia el diseño** (fondo, texto, color principal y tipografía) de la web/app.

**Modo "Un local"**: contenido para un negocio.
- **Un solo link alcanza**: búsqueda de Google, Google Maps, Instagram del local, TikTok, su web, o directamente el nombre.
  Trae nombre, rubro, dirección, horarios, teléfono, calificación, una reseña, logo y fotos.
- Colores sacados del logo. Dos destinos: *para el Instagram del local* o *para mi Instagram* (caso de cliente).

**🚀 Subir a IG**: publica carrusel, post, historia y reel en tu cuenta con un clic.

## Estructura

```
index.html          la app completa
api/fetch.js        lee páginas web y trae capturas
api/place.js        busca locales en Google Maps (Places API)
api/ig.js           conexión con Instagram: leer locales y publicar
api/upload.js       subida temporal de archivos (Vercel Blob)
api/_lib.js         utilidades compartidas
GUIA-INSTAGRAM.md   cómo conectar Instagram
GUIA-GOOGLE.md      cómo conectar Google Maps
```

## Publicar

1. Subí esta carpeta a un repo de GitHub (ej: `estudio-ig`).
2. En [vercel.com](https://vercel.com): **Add New → Project →** elegí el repo → **Deploy**.
3. Seguí **GUIA-INSTAGRAM.md** y **GUIA-GOOGLE.md** para cargar las variables.

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Para qué |
|---|---|
| `STUDIO_PASSWORD` | Clave para que nadie más pueda publicar ni gastar tus cupos. **Ponela sí o sí.** |
| `META_APP_ID`, `META_APP_SECRET` | Tu app de Meta (para generar el token). |
| `IG_PAGE_TOKEN`, `IG_USER_ID` | Tu cuenta de Instagram conectada (los da el botón "Convertir mi token"). |
| `BLOB_READ_WRITE_TOKEN` | Se agrega solo al crear el almacenamiento Blob. |
| `GOOGLE_PLACES_KEY` | Clave de Google Places API (New). |

Después de cambiar variables: **Deployments → ⋯ → Redeploy**.

## Trabajar en tu compu

Abrí `index.html` en el navegador: anda todo menos lo que necesita el servidor (links, Google, Instagram).
Para probar todo en local: `npm i -g vercel`, después `vercel link` y `vercel env pull`, y por último `vercel dev`.

## Notas

- Las capturas de páginas usan [microlink.io](https://microlink.io) (gratis con límite diario).
- El botón "Escribir con IA" solo aparece cuando la herramienta se abre dentro de Claude.
- El reel se genera en el navegador (mejor en Chrome o Edge) y sale sin audio.

# Estudio de Contenido IG

Herramienta web de **F-C Web Studio** para crear contenido de Instagram (carrusel, post, historia, reel MP4 y texto con hashtags)
y **publicarlo directo en tu cuenta** desde la pestaña 🚀 Subir a IG (o descargarlo y subirlo a mano).

## De dónde saca la información

| Le das… | Trae… |
|---|---|
| Un `.zip`, una carpeta o un `index.html` | Textos, capturas, colores y tipografía de tu app/web |
| Un link de GitHub, GitHub Pages, Vercel o cualquier web | Lo mismo, más capturas de compu y de celular |
| Un link de búsqueda de Google, de Google Maps o el nombre del local | Nombre, rubro, dirección, horarios, teléfono, calificación, una reseña y fotos *(requiere clave de Google)* |
| Un link de Instagram de un local | Logo, bio, web y últimas fotos *(requiere Meta)*; sin Meta, busca el @ en Google |
| Un link de TikTok | Nombre y miniatura |

Dos modos: **Mi app o web** (para promocionar tus proyectos) y **Un local** (para un negocio: con destino *Instagram del local* o *mi Instagram* como caso de cliente).

## Estructura

```
index.html          la app completa
api/fetch.js        lee páginas web y trae capturas
api/place.js        busca locales en Google Maps (Places API)
api/ig.js           Instagram: publicar en tu cuenta y leer perfiles de locales
api/upload.js       subida temporal de archivos (Vercel Blob) para publicar
api/_lib.js         utilidades compartidas
GUIA-GOOGLE.md      cómo conectar Google Maps
GUIA-INSTAGRAM.md   cómo conectar Instagram
```

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Para qué |
|---|---|
| `STUDIO_PASSWORD` | Clave para que nadie más publique en tu cuenta ni gaste tus cupos. **Ponela sí o sí.** |
| `GOOGLE_PLACES_KEY` | Clave de Google Places API (New). |
| `META_APP_ID`, `META_APP_SECRET` | Tu app de Meta (solo para generar el token). |
| `IG_PAGE_TOKEN`, `IG_USER_ID` | Los da el botón "Convertir mi token" en **🚀 Subir a IG**. |
| `BLOB_READ_WRITE_TOKEN` | Se agrega solo al crear el almacenamiento Blob (Storage → Blob). |

Después de cambiar variables: **Deployments → ⋯ → Redeploy**.
Para ver qué está configurado, abrí `https://TU-APP.vercel.app/api/ig?action=ping`.

## Notas

- Las capturas de páginas usan [microlink.io](https://microlink.io) (gratis con límite diario).
- El botón "Escribir con IA" solo aparece cuando la herramienta se abre dentro de Claude.
- El reel se genera en el navegador (mejor en Chrome o Edge) y sale sin audio: ponele música al subirlo.

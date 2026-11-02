# Estudio de Contenido IG

Herramienta web de **F-C Web Studio** para crear contenido de Instagram (carrusel, post, historia, reel MP4 y texto con hashtags) en minutos.

## Qué hace

**Modo "Mi app o web"**: promocionar un proyecto propio.
- Acepta un `.zip`, una carpeta, un `index.html` suelto o un link (repo de GitHub, GitHub Pages, Vercel o cualquier dominio).
- Lee el README, `package.json`, el HTML y las imágenes; arma los textos solo.
- **Diseño automático**: copia el fondo, el color de texto, el color principal y la tipografía de la web/app.
- De un link saca capturas de compu y de celular.

**Modo "Un local"**: contenido para un negocio.
- Cargás nombre, rubro, Instagram, TikTok, WhatsApp, dirección, horarios, bio, productos con precios y la promo.
- Subís el logo y fotos: los colores salen del logo.
- Dos destinos:
  - *Para el Instagram del local*: posts con sus fotos y datos, y un crédito chico "Diseño: F-C Web Studio".
  - *Para mi Instagram*: caso de cliente ("Página web para …") con tu marca.

## Estructura

```
index.html      la app completa (todo en un archivo)
api/fetch.js    función de Vercel que lee páginas y trae capturas (evita CORS)
vercel.json     configuración de la función
```

## Publicar en Vercel

1. Subí esta carpeta a un repo nuevo de GitHub (ej: `estudio-ig`).
2. En [vercel.com](https://vercel.com): **Add New → Project →** elegí el repo → **Deploy**. No hay que configurar nada.
3. Cada vez que hagas `git push`, Vercel publica la nueva versión.

## Trabajar en tu compu

Abrí `index.html` en el navegador: funciona todo menos traer páginas por link (eso necesita `api/fetch.js`, que corre en Vercel).
Para probar también los links en local: `npm i -g vercel` y después `vercel dev` dentro de la carpeta.

## Notas

- Las capturas automáticas de páginas usan [microlink.io](https://microlink.io) (gratis, con límite diario).
- De TikTok se lee el nombre y la miniatura con el oEmbed oficial. De Instagram no se leen datos automáticamente: copiá la bio y subí las fotos.
- El botón "Escribir con IA" solo aparece cuando la herramienta se abre dentro de Claude.
- El reel se genera en el navegador (mejor en Chrome o Edge) y sale sin audio, para ponerle música desde Instagram.

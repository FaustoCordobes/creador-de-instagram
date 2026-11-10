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

Tres modos:
- **Mi app o web**: promocionar tus proyectos.
- **Un local**: contenido para un negocio, con destino *Instagram del local* o *mi Instagram* (caso de cliente, con diapositiva de resultado/testimonio).
- **Mi marca**: carrusel de presentación (quién sos, qué hacés, cómo trabajás, qué incluye).

Además: diapositiva **Qué incluye**, **oferta de lanzamiento** opcional, cierre con **palabra clave** ("Comentá WEB o escribime al DM" + link en la bio) y **portadas para historias destacadas**.

## Que cada publicación sea distinta

- **Estilo visual** (paso "Estilo y marca"): Limpio, Editorial, Póster o Anotado a mano (post-it, cinta, resaltador, letra a mano). Con **🔄 Rotar** el estilo cambia solo después de cada publicación.
- **🎲 Otro diseño**: cambia estilo, palabra resaltada del gancho, tipo de historia y transiciones del reel.
- **✍️ Otro gancho**: prueba otro gancho de portada (de la IA o del banco propio) que no hayas usado antes.
- **Historias**: Resumen, Pregunta (invita a responder por DM) o Captura.
- **Mi marca**: temas de carrusel (señales de que tu web pierde clientes, qué tiene que traer una web, preguntas antes de contratar, mitos, cómo arrancar).
- **Chequeo antes de publicar**: máximo 5 hashtags (límite de Instagram desde dic. 2025), frases típicas de IA, rayas largas, exceso de emojis, ganchos repetidos y mismo estilo que la última vez. "🧹 Arreglar lo automático" corrige lo que se puede.
- Cada publicación queda anotada en "Últimas publicaciones" (en el navegador) para no repetir.

## Voz en reels e historias

- La historia sale como **video con voz** (hasta 59 s) o como imagen fija; el reel también lleva voz. Todo pasa más lento que antes para que se llegue a leer.
- Voces gratis (Tomás y Elena de Argentina, Mateo y Valentina rioplatenses, Andrés y Ava más expresivas) generadas por `api/tts.js` con "Leer en voz alta" de Microsoft Edge (paquete `msedge-tts`). No piden claves, pero no es una API oficial.
- Voces premium opcionales (OpenAI gpt-4o-mini-tts o ElevenLabs) si cargás su clave: ver **GUIA-VOZ.md**.
- Música de fondo generada en el navegador (sin derechos de autor): Lo-fi, Calma o Con ritmo. Baja sola cuando habla la voz y suma un "whoosh" en cada cambio de pantalla.
- En el **Guion de voz** (pestañas Reel e Historia) se edita lo que dice cada pantalla, se escucha con ▶ y se graba con tu voz con 🎙. Las grabaciones quedan solo mientras la página está abierta.
- El audio va dentro del MP4 en AAC (Chrome o Edge en la compu). Si el navegador no puede, lo graba en tiempo real.

## "Un local": contenido para que lo suba el dueño

- Lee solo lo que el local publica: Google Maps, su web o su Instagram. Instagram bloquea las lecturas desde servidores, así que lo seguro es el botón de favoritos **📥 Traer de Instagram**: se arrastra una vez a la barra de favoritos, se toca estando en el perfil del local y manda nombre, bio, rubro, contacto, logo y fotos al Estudio desde tu propio navegador.
- **🪧 Cartel / promo**: antes de diseñar pide objetivo (descuento, evento, producto nuevo, info), colores de la marca (máx. 3), logo y dónde se usa (A4 para imprimir en PDF, historia o post). Logo arriba e integrado, mensaje, detalles y contacto abajo, sin estética "IA saturada".
- **📦 Para el cliente**: arma un ZIP con carrusel, post, historia y reel (con voz), cartel A4 en PDF y PNG, el texto del posteo y un LEEME con los pasos para subirlo.

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

## Recorrido automático de la app

Cuando traés un proyecto con link publicado (o un repo de GitHub con su web), la versión en Vercel abre la app en un navegador real (`api/recorrido.js`, con Chromium), toca sus menús, pestañas y botones seguros (nunca borrar, pagar, enviar ni cerrar sesión), baja con scroll y saca una captura de cada pantalla, en celular y en compu.

- En el carrusel, cada función usa una pantalla distinta del recorrido.
- En el reel y la historia aparece la escena "Así se usa": el celular con un dedo que toca y la pantalla que cambia, como una grabación de pantalla.
- Si el recorrido falla, se usan capturas simples de la portada.

## Nada técnico en el contenido

Lo que se publica es para dueños de locales: el estudio no muestra lenguajes, frameworks ni servicios (React, Supabase, Vercel, etc.). En su lugar hay una diapositiva "Antes y ahora" con lo que gana el negocio (campo "Lo que gana el negocio", una línea por cambio con el formato `antes → ahora`). El control de calidad avisa si se cuela algo técnico y "Arreglar lo automático" lo saca.

## Propuesta: mi app para un local (historias)

En **Un local → "Propuesta: mi app para este local"** el estudio arma de 4 a 6 historias para tu Instagram que le muestran a ese local cómo le sirve una de tus apps, con capturas reales.

1. **El local:** pegá su link (Instagram, Google Maps o web) y tocá "Traer todo".
2. **Tu app:** cargá una vez cada app que vendés (nombre y link). El estudio la recorre sola, saca una captura por sección y detecta qué función muestra cada una (turnos, recordatorios, historial, caja, stock…). Podés corregir el nombre de cada función o subir capturas a mano.
3. **Investigación:** busca al local en sus datos, su web, Google Maps y reseñas (`GOOGLE_PLACES_KEY`) y en toda la web: Facebook, prensa y directorios (`OPENAI_API_KEY`, usa `api/investigar.js`). Si falta algo esencial (por ejemplo el rubro), se frena y te lo pregunta.
4. **Fase 1 · Borrador:** elige la app y las funciones que más valor le dan a ese rubro y arma las historias (texto, llamado a la acción y captura en cada una).
5. **Fase 2 · Cambios:** te pregunta si querés cambiar algo y sugiere intercambios (por ejemplo, "Historial del cliente" por "Reserva automática"). Después armás la versión final y la descargás o la publicás en tus historias.

Variable opcional: `OPENAI_SEARCH_MODEL` para elegir el modelo de búsqueda (por defecto prueba `gpt-5-mini` y después `gpt-4.1-mini`).

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
- **Para mi Instagram** (F-C Web Studio): mostrar tus apps y webs.
- **Negocio o local de otra persona**: contenido para un negocio, con destino *Instagram del local* o *mi Instagram* (caso de cliente, con diapositiva de resultado/testimonio).
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

## "Negocio o local de otra persona": contenido para que lo suba el dueño

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

## Historias de funciones (Para mi Instagram)

En **Para mi Instagram**, cuando traés una app con su link publicado, el estudio la recorre entera en celular (sin contar el menú abierto) y guarda una captura por sección. Cada captura queda asociada a una función: reserva automática, recordatorio o confirmación por WhatsApp, mensajes pregrabados, contacto directo, historial, impresión de tickets, caja, stock, pedidos, cuotas, órdenes de trabajo, etc. Cada app muestra las suyas.

1. **Antes:** en el paso 2, "Funciones para las historias", elegís para qué tipo de negocio es la app (o lo detecta solo) y marcás de 4 a 6 funciones. Ya vienen marcadas las que más le sirven a ese rubro. Podés corregir qué muestra cada pantalla o subir capturas a mano.
2. **Muestra:** "Armar historias" crea una historia por función, con su captura real, texto, llamado a la acción y tu contacto en la última.
3. **Después:** en la pestaña "Historias de funciones" podés cambiar la función, la pantalla, los textos o el orden de cada historia; el estudio te sugiere intercambios (por ejemplo, "Historial del paciente" por "Recordatorio por WhatsApp"). Al confirmar queda la versión final para descargar (.zip) o publicar en tus historias.

## Contenido mensual para clientes

Apartado para el servicio mensual a locales. En **Tus clientes** (paso 1) cada local queda guardado en el navegador con sus datos, logo, fotos y el plan de cada mes.

- **Plan mensual:** elegís el mes y cuántos reels, carruseles, posts e historias por semana incluye el servicio. El estudio arma el calendario repartiendo 7 pilares (producto estrella, detrás de escena, lo que dicen los clientes, tips, promo, comunidad y fechas especiales de Argentina), con un gancho y una idea por pieza usando los productos del local.
- Cada pieza tiene estado (pendiente, listo, publicado) y un botón **Crear →** que la lleva al formato correspondiente del estudio.
- **Copiar el plan para el cliente** lo deja listo para pegar en WhatsApp.
- **Historial:** meses trabajados, piezas publicadas y lo facturado por mes y en total (el precio del mes es opcional).

## Cartas y fotos de comida

Pestaña **Cartas y comida**: subís la foto de un producto y elegís uno de 3 estilos. El estudio arma el pedido para la IA de imágenes con los datos del local.

1. **Póster minimalista:** producto protagonista sobre fondo oscuro, titular de dos palabras y precio en un sello.
2. **Foto limpia de estudio:** solo el producto, sin texto, con acabado publicitario.
3. **Oferta héroe minimal:** fondo claro, palabra gigante detrás del producto y cuatro íconos con ventajas.

"Copiar el pedido" sirve para pegarlo en ChatGPT junto con la foto. Con `OPENAI_API_KEY` en Vercel aparece "Generar acá con IA" (`api/imagen.js`; modelo opcional en `OPENAI_IMAGE_MODEL`).

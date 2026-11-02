# Conectar Google Maps (para links de Google)

Con esto, si pegás un link de una búsqueda de Google, de Google Maps o solo el nombre del local, el estudio trae:
nombre, rubro, dirección, horarios, teléfono, web, calificación, una reseña destacada y fotos.

Usa la **Places API (New)** oficial de Google. Pide una tarjeta, pero cada producto tiene un cupo gratis por mes y con tu uso no deberías pagar nada. Igual te dejo cómo poner un tope para dormir tranquilo.

## 1. Crear el proyecto

1. Entrá a <https://console.cloud.google.com> con tu cuenta de Google.
2. Arriba: **Seleccionar proyecto → Proyecto nuevo** → nombre *estudio-ig* → Crear.

## 2. Activar la facturación

**Menú → Facturación** → vinculá una cuenta de facturación (tarjeta). Google no cobra mientras estés dentro del cupo gratis.

## 3. Activar la API

**Menú → APIs y servicios → Biblioteca** → buscá **Places API (New)** → **Habilitar**.

## 4. Crear la clave

1. **APIs y servicios → Credenciales → Crear credenciales → Clave de API**.
2. Tocá la clave → **Restricciones de API** → *Restringir clave* → elegí **Places API (New)** → Guardar.

## 5. Cargarla en Vercel

Vercel → tu proyecto → **Settings → Environment Variables**:

| Variable | Valor |
|---|---|
| `GOOGLE_PLACES_KEY` | la clave del paso 4 |

**Redeploy**.

## 6. (Recomendado) Poner un tope

**APIs y servicios → Places API (New) → Cuotas** → bajá *Requests per day* a, por ejemplo, **100**.
Y en **Facturación → Presupuestos y alertas**, creá un presupuesto de USD 1 con aviso por mail.

## Cuánto se usa

Cada vez que traés un local se hace **1 búsqueda** y se bajan **hasta 8 fotos**.
El cupo gratis mensual alcanza para unos cientos de locales por mes.

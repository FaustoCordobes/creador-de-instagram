# Guía de UX para mis trabajos — F-C Web Studio

Versión editable y completa: https://claude.ai/artifact/3usVqYFkN39YCUaqHg9D62

Esta guía resume lo que vi en la cursada de UX y lo baja a reglas para cada trabajo: webs, apps, contenido para Instagram y el prompt maestro. Antes de entregar, recorré el checklist del final.

## Las 10 ideas

1. **Primero el usuario, después la pantalla.** Entrevistá al dueño y a sus clientes antes de diseñar.
2. **Que siempre sepa dónde está.** Pasos visibles, estado del sistema, feedback inmediato.
3. **Hablá como el cliente.** Palabras del rubro, nada de jerga técnica.
4. **Nunca perder su trabajo.** Autoguardado, deshacer y confirmación antes de borrar.
5. **Menos opciones a la vista.** Lo avanzado va plegado; una acción principal por pantalla.
6. **Pensado para el pulgar.** Botones de 44 px o más y la acción clave abajo.
7. **Texto escaneable.** Frases de hasta 25 palabras y párrafos de hasta 75, con lo importante primero.
8. **Accesible por ley.** Contraste 4.5:1, texto alternativo, teclado, subtítulos y nada que parpadee (WCAG y Ley 26.653).
9. **Probar con gente real.** Con 5 personas encontrás la mayoría de los problemas.
10. **Medir y ajustar.** Cada entrega lleva una métrica y un informe mensual.

## Antes de diseñar

- Entrevista al dueño (30 min): qué vende y a quién, qué le preguntan siempre por WhatsApp, qué tiene que hacer alguien que entra a la web, qué lo diferencia y cómo va a saber que la web funciona.
- Hablar con 3 a 5 clientes: preguntar qué hicieron la última vez, no qué harían.
- Persona basada en datos reales y mapa de empatía (dice, piensa, hace, siente).
- Problema en una frase: "[Persona] necesita [lograr algo] porque [motivo], pero hoy [obstáculo]".

## Heurísticas de Nielsen

| # | Heurística | Cómo la aplico |
| --- | --- | --- |
| 1 | Visibilidad del estado | "Paso 2 de 4", aviso de "Guardado", progreso al exportar video |
| 2 | Mundo real | Palabras del rubro ("turno", "carta", "reserva") |
| 3 | Control y libertad | Deshacer (Ctrl+Z), volver, "Empezar de cero" |
| 4 | Consistencia | El mismo botón hace lo mismo en todas las pantallas |
| 5 | Prevención de errores | Validar el link antes de enviar; desactivar "Publicar" si falta la imagen |
| 6 | Reconocer antes que recordar | Mostrar opciones (chips) en vez de pedir que las escriba |
| 7 | Flexibilidad | Atajos para el experto; asistente para el que empieza |
| 8 | Minimalismo | Lo avanzado en "Más opciones" plegado |
| 9 | Errores en lenguaje humano | "No pude leer ese perfil. Probá con el botón de importar" |
| 10 | Ayuda | Una línea de ayuda junto a cada campo difícil; LEEME en el paquete |

Gravedad de 0 a 4; arreglar primero los 3 y 4.

## Tognazzini y Norman

- Proteger el trabajo del usuario (autoguardado), anticipar, valores por defecto útiles, reducir la latencia percibida.
- Affordance y significantes, feedforward ("Publicar en Instagram" y no "Continuar"), feedback en menos de 1 segundo, mapeo natural, restricciones explicadas.
- Desliz → deshacer. Equivocación → mejor texto y ejemplos.

## Leyes de UX y Gestalt

| Ley | Regla práctica |
| --- | --- |
| Hick | Menú de 5 a 7 ítems; lo demás agrupado o plegado |
| Fitts | Botón principal ancho y en la zona del pulgar |
| Jakob | Funcionar como las webs que la gente ya usa |
| Miller | Formularios en pasos cortos; teléfonos agrupados |
| Tesler | La complejidad la absorbe el sistema, no el usuario |
| Doherty | Respuestas en menos de 400 ms |
| Pico-final | Cerrar con una confirmación clara y amable |
| Von Restorff | Un solo botón de color acento por pantalla |

Gestalt: proximidad, semejanza, región común, figura y fondo, continuidad, cierre.

## Celular primero

- Diseñar para 360 px. Zonas táctiles de 44 × 44 px (48 en Android), 8 px entre ellas.
- Texto e inputs de 16 px. Nada que dependa del mouse.
- Acción principal en el tercio de abajo. Barra inferior hasta 5 destinos; WhatsApp flotante que no tape.
- Formularios de una columna con el teclado correcto; llamar, mapa y WhatsApp a un toque; imágenes livianas.
- Probar en un celular real con conexión lenta.

## Redacción y microcopy

- Voseo rioplatense, cercano y claro. Frases ≤ 25 palabras, párrafos ≤ 75.
- Pirámide invertida, escaneable, objetivo: datos en vez de adjetivos.
- Fuera: lenguaje promocional inflado, MAYÚSCULAS sostenidas, "hacé clic acá", utilizar, aguardar, en breve.

| Lugar | Mal | Bien |
| --- | --- | --- |
| Botón | Enviar | Pedir turno |
| Error | Campo inválido | Falta el código de área, por ejemplo 2944 |
| Vacío | No hay datos | Todavía no subiste fotos. Arrastralas acá o tocá Subir |
| Confirmación | Operación exitosa | Listo, te esperamos el sábado a las 20 |
| Carga | Cargando... | Armando tu video (unos 20 segundos) |

## Arquitectura de información

- Organización, rotulado, navegación y búsqueda (solo si hay mucho contenido).
- Card sorting: abierto con 5 a 15 clientes para descubrir grupos; cerrado para validar el menú.
- Menú de 5 a 7 ítems, contacto siempre a un toque, nada importante a más de 3 toques.

## Accesibilidad (WCAG 2.x AA y Ley 26.653)

- [ ] Contraste 4.5:1 (3:1 en texto grande e íconos)
- [ ] Texto alternativo; alt="" en lo decorativo
- [ ] Todo usable con teclado y foco visible
- [ ] Etiquetas en los campos
- [ ] El color nunca como única señal
- [ ] Subtítulos y transcripciones
- [ ] Nada que parpadee más de 3 veces por segundo; respetar "reducir movimiento"
- [ ] lang="es-AR" y títulos en orden
- [ ] Zoom al 200% sin romperse

En redes: alt en posts y carruseles, subtítulos en reels e historias, emojis con medida, hashtags en CamelCase.

## Proceso con clientes

Empatizar → Definir → Idear → Prototipar → Testear. Si el test falla, vuelvo a idear; si funciona, lanzo un MVP, lo mido con AARRR y el informe mensual me devuelve a escuchar al cliente.

Test de usuario: 5 personas parecidas al cliente real, tareas concretas, pensar en voz alta sin ayudar, arreglar lo que falló en 3 o más.

| Etapa | Pregunta | Métrica |
| --- | --- | --- |
| Adquisición | ¿Llega gente nueva? | Visitas y alcance en Instagram |
| Activación | ¿Hace lo primero que buscamos? | Clics en WhatsApp, llamadas, reservas |
| Retención | ¿Vuelve? | Clientes que repiten, seguidores que interactúan |
| Referidos | ¿Recomienda? | Reseñas nuevas, posts compartidos |
| Ingresos | ¿Deja plata? | Ventas o turnos atribuidos a la web y las redes |

## Contenido para redes

- Logo integrado arriba → gancho (≤ 10 palabras) → cuerpo → un solo llamado a la acción.
- Solo colores de la marca (máximo 3) y hasta 5 hashtags en CamelCase.
- Que no parezca IA: fotos reales, variedad de diseño, detalles hechos a mano, la voz del negocio.
- Reels e historias: subtítulos, voz pausada, música suave, zona segura, sin destellos.

## Checklist antes de entregar

- [ ] Sé quién la usa y qué tiene que lograr en una frase
- [ ] La acción principal se ve sin scroll en el celular
- [ ] 10 heurísticas sin problemas graves
- [ ] Feedback para cada acción; nada se pierde al recargar
- [ ] Errores que dicen qué pasó y cómo seguir
- [ ] Zonas táctiles ≥ 44 px; texto e inputs de 16 px
- [ ] Probado en celular real con conexión lenta
- [ ] Texto: frases ≤ 25, párrafos ≤ 75, sin mayúsculas sostenidas ni lenguaje inflado
- [ ] Botones y links dicen lo que hacen
- [ ] Contraste, alt, teclado, foco, subtítulos, nada que parpadee
- [ ] Probado con al menos 3 personas que no conocen el proyecto
- [ ] Métrica definida para el informe mensual

## Módulo UX para el prompt maestro (v13)

```markdown
## MÓDULO UX (v13) — F-C Web Studio

Antes de diseñar, confirmá: quién es el usuario, qué tiene que lograr (una frase), desde qué dispositivo entra (asumí celular) y qué métrica define el éxito. Si falta alguno, preguntá antes de avanzar.

Interfaz:
- Cumplí las 10 heurísticas de Nielsen. Estado visible, palabras del rubro, deshacer, consistencia, prevención de errores, reconocer antes que recordar, atajos para expertos, diseño minimalista, errores en lenguaje humano y ayuda contextual.
- Protegé el trabajo del usuario: autoguardado y confirmación antes de borrar.
- Feedforward y feedback: el botón dice qué va a pasar y la interfaz confirma en menos de 1 segundo.
- Una acción principal por pantalla; lo avanzado, plegado. Menús de 5 a 7 ítems.
- Tareas largas como asistente paso a paso con indicador "Paso N de M".

Celular primero:
- Diseñá para 360 px y después agrandá. Zonas táctiles de 44 px o más, texto e inputs de 16 px.
- Acción principal en la zona del pulgar; teléfono, mapa y WhatsApp a un toque.

Redacción:
- Voseo rioplatense, cercano y claro. Frases de hasta 25 palabras, párrafos de hasta 75.
- Pirámide invertida, escaneable, objetivo: datos en vez de adjetivos.
- Prohibido: lenguaje promocional inflado, mayúsculas sostenidas, "hacé clic acá", "utilizar", "aguardar", "en breve" y las muletillas típicas de IA.
- Botones con verbo y objeto ("Pedir turno"). Errores que dicen qué pasó y cómo seguir.

Accesibilidad (WCAG 2.x AA y Ley 26.653):
- Contraste 4.5:1, texto alternativo, uso con teclado, foco visible, etiquetas en los campos, el color nunca como única señal, subtítulos y nada que parpadee más de 3 veces por segundo.

Contenido para redes:
- Logo integrado arriba, gancho de hasta 10 palabras, cuerpo, un solo llamado a la acción.
- Solo colores de la marca (máximo 3) y hasta 5 hashtags en CamelCase.
- Texto alternativo en posts y carruseles; subtítulos en reels e historias.
- Que no parezca hecho con IA: fotos reales, variedad de diseño y la voz del negocio.

Al entregar, incluí el checklist de la guía marcado y la métrica a seguir en el informe mensual.
```

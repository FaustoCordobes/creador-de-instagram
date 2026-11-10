# Voz de los reels e historias

La app ya trae voces gratis (Tomás y Elena de Argentina, Mateo y Valentina rioplatenses, y Andrés y Ava, más expresivas con acento neutro). No hace falta configurar nada.

## Voz premium (opcional, la más humana)

Usa el modelo **gpt-4o-mini-tts** de OpenAI con instrucciones para hablar en rioplatense, cálido y sin tono de locutor. Cuesta alrededor de 1,5 centavos de dólar por minuto de audio: un reel de 40 segundos sale menos de 1 centavo.

1. Entrá a https://platform.openai.com, creá una cuenta y cargá un saldo mínimo en **Billing**.
2. En **API keys** tocá **Create new secret key** y copiala (no la compartas con nadie).
3. En Vercel → tu proyecto → **Settings → Environment Variables** agregá `OPENAI_API_KEY` con esa clave (marcá Production).
4. **Deployments → Redeploy**.
5. En la app, en "Estilo y marca → Voz", aparecen las voces **Premium** (Marina, Cedro, Coral, Ash).

### ElevenLabs (alternativa)

Si preferís ElevenLabs: cargá `ELEVENLABS_API_KEY` y, si querés una voz argentina de su biblioteca, `ELEVENLABS_VOICE_ID` con el ID de esa voz. Opcional: `ELEVENLABS_MODEL` (por defecto `eleven_multilingual_v2`).

## Tu propia voz

En el **Guion de voz** (pestañas Reel e Historia) tocá 🎙 en cada frase y grabala. Tu grabación reemplaza a la voz automática. Se pierde si recargás la página.

## Música de fondo

La genera la app en el momento (no tiene derechos de autor): Lo-fi tranqui, Calma o Con ritmo. Baja sola cuando habla la voz y suma un "whoosh" en cada cambio de pantalla. En "Automática" cambia en cada publicación.

// Voz para reels e historias. POST JSON { text, voice } → audio/mpeg. Pide la clave del estudio.
//  · Voces gratis (sin claves): Microsoft Edge "Leer en voz alta" (paquete msedge-tts). No es una API oficial.
//  · Voces premium (opcionales):
//      "oa:<voz>" → OpenAI gpt-4o-mini-tts, con instrucciones de acento rioplatense. Necesita OPENAI_API_KEY.
//      "el:<id>"  → ElevenLabs. Necesita ELEVENLABS_API_KEY (y opcional ELEVENLABS_VOICE_ID / ELEVENLABS_MODEL).
const { cors, authorized, readBody } = require('./_lib');

const EDGE = ['es-AR-TomasNeural', 'es-AR-ElenaNeural', 'es-UY-MateoNeural', 'es-UY-ValentinaNeural',
  'en-US-AndrewMultilingualNeural', 'en-US-AvaMultilingualNeural', 'en-US-BrianMultilingualNeural', 'en-US-EmmaMultilingualNeural',
  'es-MX-JorgeNeural', 'es-MX-DaliaNeural', 'es-ES-AlvaroNeural'];
const OA_VOICES = ['marin', 'cedar', 'coral', 'ash', 'ballad', 'sage', 'verse', 'nova', 'onyx'];
const OA_STYLE = 'Hablá en español rioplatense de Argentina, con voseo y acento porteño suave. Tono cálido, cercano y con energía tranquila, '
  + 'como un emprendedor que le cuenta a un amigo algo que hizo y le gusta. Ritmo natural, sin apurarte, con pausas cortas entre frases. '
  + 'Nada de tono de locutor de publicidad ni de robot.';

async function edgeTTS(text, voice, rate){
  const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
  const tts = new MsEdgeTTS({ connectionTimeoutMs: 10000, synthesisTimeoutMs: 30000 });
  try {
    // las voces multilingües leen en español con xml:lang es-AR
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, /Multilingual/.test(voice) ? { voiceLocale: 'es-AR' } : undefined);
    const { audioStream } = await tts.toStream(text, { rate: (rate >= 0 ? '+' : '') + rate + '%' });
    const chunks = [];
    await new Promise((ok, ko) => { audioStream.on('data', c => chunks.push(c)); audioStream.on('end', ok); audioStream.on('close', ok); audioStream.on('error', ko); });
    return Buffer.concat(chunks);
  } finally { try { tts.close(); } catch {} }
}
async function openaiTTS(text, voice){
  const r = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST', headers: { Authorization: 'Bearer ' + process.env.OPENAI_API_KEY.trim(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts', input: text, voice, instructions: OA_STYLE, response_format: 'mp3' })
  });
  if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error('OpenAI: ' + ((j.error && j.error.message) || r.status)); }
  return Buffer.from(await r.arrayBuffer());
}
async function elevenTTS(text, voiceId){
  const id = voiceId && voiceId !== 'default' ? voiceId : (process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb');
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(id)}?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY.trim(), 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2', voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true } })
  });
  if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error('ElevenLabs: ' + ((j.detail && (j.detail.message || j.detail)) || r.status)); }
  return Buffer.from(await r.arrayBuffer());
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!authorized(req)) return res.status(401).json({ error: 'Clave del estudio incorrecta.' });
  const body = req.method === 'POST' ? await readBody(req) : (req.query || {});
  const text = String(body.text || '').replace(/&/g, ' y ').replace(/[<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 700);
  if (!text) return res.status(400).json({ error: 'Falta el texto.' });
  const voice = String(body.voice || '');
  try {
    let buf;
    if (voice.startsWith('oa:')) {
      if (!process.env.OPENAI_API_KEY) throw new Error('falta OPENAI_API_KEY en Vercel');
      buf = await openaiTTS(text, OA_VOICES.includes(voice.slice(3)) ? voice.slice(3) : 'marin');
    } else if (voice.startsWith('el:')) {
      if (!process.env.ELEVENLABS_API_KEY) throw new Error('falta ELEVENLABS_API_KEY en Vercel');
      buf = await elevenTTS(text, voice.slice(3));
    } else {
      const v = EDGE.includes(voice) ? voice : EDGE[0];
      const rate = Math.max(-30, Math.min(20, body.rate == null ? -4 : (parseInt(body.rate, 10) || 0)));
      buf = await edgeTTS(text, v, rate);
    }
    if (!buf || !buf.length) throw new Error('el servicio no devolvió audio');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(502).json({ error: 'No se pudo generar la voz (' + (e && e.message || e) + ').' });
  }
};

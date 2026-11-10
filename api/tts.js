// Voz para reels e historias: convierte texto en audio MP3 con las voces neuronales de Microsoft Edge
// (es-AR Tomás / Elena). POST JSON { text, voice } → audio/mpeg. Pide la clave del estudio.
// Ojo: usa el servicio "Leer en voz alta" de Edge, que no es una API oficial y podría cambiar.
const { cors, authorized, readBody } = require('./_lib');

const VOICES = ['es-AR-TomasNeural', 'es-AR-ElenaNeural', 'es-MX-JorgeNeural', 'es-MX-DaliaNeural', 'es-ES-AlvaroNeural'];

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!authorized(req)) return res.status(401).json({ error: 'Clave del estudio incorrecta.' });
  const body = req.method === 'POST' ? await readBody(req) : (req.query || {});
  const text = String(body.text || '').replace(/&/g, ' y ').replace(/[<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 700);
  if (!text) return res.status(400).json({ error: 'Falta el texto.' });
  const voice = VOICES.includes(body.voice) ? body.voice : VOICES[0];
  const rate = Math.max(-30, Math.min(20, parseInt(body.rate, 10) || 0));
  let tts = null;
  try {
    const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
    tts = new MsEdgeTTS({ connectionTimeoutMs: 10000, synthesisTimeoutMs: 30000 });
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioStream } = await tts.toStream(text, { rate: (rate >= 0 ? '+' : '') + rate + '%' });
    const chunks = [];
    await new Promise((ok, ko) => {
      audioStream.on('data', c => chunks.push(c));
      audioStream.on('end', ok); audioStream.on('close', ok); audioStream.on('error', ko);
    });
    const buf = Buffer.concat(chunks);
    if (!buf.length) throw new Error('el servicio no devolvió audio');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(502).json({ error: 'No se pudo generar la voz (' + (e && e.message || e) + ').' });
  } finally {
    try { if (tts) tts.close(); } catch {}
  }
};

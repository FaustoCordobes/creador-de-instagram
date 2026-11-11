// Guardar una voz propia (clon) en ElevenLabs y reusarla en los reels.
// POST { action:'add', name, audio:dataURL, filename }  → { voice_id }
// POST { action:'delete', voiceId }                     → { ok:true }
// Necesita ELEVENLABS_API_KEY en Vercel.
const { cors, authorized, readBody } = require('./_lib');
const KEY = () => String(process.env.ELEVENLABS_API_KEY || '').trim();

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!authorized(req)) return res.status(401).json({ error: 'Clave del estudio incorrecta.' });
  if (!KEY()) return res.status(400).json({ error: 'Para guardar tu voz falta ELEVENLABS_API_KEY en Vercel.', code: 'nokey' });
  const b = await readBody(req);
  const action = b.action || 'add';
  try {
    if (action === 'delete') {
      const id = String(b.voiceId || '').trim();
      if (!id) return res.status(400).json({ error: 'Falta la voz a borrar.' });
      const r = await fetch('https://api.elevenlabs.io/v1/voices/' + encodeURIComponent(id), { method: 'DELETE', headers: { 'xi-api-key': KEY() } });
      if (!r.ok && r.status !== 404) { const j = await r.json().catch(() => ({})); throw new Error((j.detail && (j.detail.message || j.detail)) || ('ElevenLabs ' + r.status)); }
      return res.json({ ok: true });
    }
    // add
    const name = String(b.name || '').replace(/[\r\n"]+/g, ' ').trim().slice(0, 40) || 'Mi voz';
    const m = /^data:([\w/+.-]+);base64,(.+)$/.exec(String(b.audio || ''));
    if (!m) return res.status(400).json({ error: 'Falta el audio.' });
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length < 16000) return res.status(400).json({ error: 'El audio es muy corto. Grabá al menos un minuto.' });
    if (buf.length > 10 * 1024 * 1024) return res.status(400).json({ error: 'El audio es muy pesado. Probá con uno más corto (1 a 2 minutos).' });
    const ext = (m[1].split('/')[1] || 'mp3').replace('mpeg', 'mp3').replace('x-m4a', 'm4a').split(';')[0];
    const fd = new FormData();
    fd.append('name', name);
    fd.append('remove_background_noise', 'true');
    fd.append('files', new Blob([buf], { type: m[1].split(';')[0] }), 'muestra.' + ext);
    const r = await fetch('https://api.elevenlabs.io/v1/voices/add', { method: 'POST', headers: { 'xi-api-key': KEY(), Accept: 'application/json' }, body: fd });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (j.detail && (j.detail.message || j.detail)) || ('ElevenLabs ' + r.status);
      if (/limit|exceed|maximum|subscription/i.test(JSON.stringify(j))) return res.status(400).json({ error: 'Tu cuenta de ElevenLabs llegó al límite de voces guardadas. Borrá una o subí de plan.' });
      return res.status(502).json({ error: 'No se pudo guardar la voz: ' + msg });
    }
    return res.json({ ok: true, voice_id: j.voice_id, requires_verification: !!j.requires_verification });
  } catch (e) {
    return res.status(502).json({ error: 'No se pudo procesar: ' + (e && e.message || e) });
  }
};

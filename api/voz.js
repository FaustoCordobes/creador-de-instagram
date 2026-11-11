// Guardar una voz propia (clon) y reusarla en los reels, con dos proveedores:
//   provider:'fish'   → Fish Audio (tiene capa gratis). Necesita FISH_API_KEY.
//   provider:'eleven' → ElevenLabs. Necesita ELEVENLABS_API_KEY.
// POST { action:'add', provider, name, audio:dataURL }  → { voice_id, provider }
// POST { action:'delete', provider, voiceId }           → { ok:true }
const { cors, authorized, readBody } = require('./_lib');
const ek = () => String(process.env.ELEVENLABS_API_KEY || '').trim();
const fk = () => String(process.env.FISH_API_KEY || '').trim();

async function elevenAdd(name, blob, filename){
  const fd = new FormData();
  fd.append('name', name); fd.append('remove_background_noise', 'true');
  fd.append('files', blob, filename);
  const r = await fetch('https://api.elevenlabs.io/v1/voices/add', { method: 'POST', headers: { 'xi-api-key': ek(), Accept: 'application/json' }, body: fd });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (/limit|exceed|maximum|subscription/i.test(JSON.stringify(j))) throw new Error('Tu cuenta de ElevenLabs llegó al límite de voces. Borrá una o subí de plan.');
    throw new Error((j.detail && (j.detail.message || j.detail)) || ('ElevenLabs ' + r.status));
  }
  return j.voice_id;
}
async function fishAdd(name, blob, filename){
  const fd = new FormData();
  fd.append('type', 'tts'); fd.append('title', name); fd.append('visibility', 'private');
  fd.append('voices', blob, filename);
  const r = await fetch('https://api.fish.audio/model', { method: 'POST', headers: { Authorization: 'Bearer ' + fk() }, body: fd });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (/limit|quota|credit|plan/i.test(JSON.stringify(j))) throw new Error('Tu cuenta de Fish Audio llegó al límite. Borrá una voz o esperá a que se renueven los créditos.');
    throw new Error((j.message || j.error) || ('Fish ' + r.status));
  }
  return j._id || j.id;
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!authorized(req)) return res.status(401).json({ error: 'Clave del estudio incorrecta.' });
  const b = await readBody(req);
  const provider = b.provider === 'eleven' ? 'eleven' : (b.provider === 'fish' ? 'fish' : (fk() ? 'fish' : 'eleven'));
  const hasKey = provider === 'fish' ? !!fk() : !!ek();
  if (!hasKey) return res.status(400).json({ error: provider === 'fish' ? 'Falta FISH_API_KEY en Vercel.' : 'Falta ELEVENLABS_API_KEY en Vercel.', code: 'nokey' });
  try {
    if (b.action === 'delete') {
      const id = String(b.voiceId || '').trim(); if (!id) return res.status(400).json({ error: 'Falta la voz a borrar.' });
      const url = provider === 'fish' ? 'https://api.fish.audio/model/' + encodeURIComponent(id) : 'https://api.elevenlabs.io/v1/voices/' + encodeURIComponent(id);
      const headers = provider === 'fish' ? { Authorization: 'Bearer ' + fk() } : { 'xi-api-key': ek() };
      const r = await fetch(url, { method: 'DELETE', headers });
      if (!r.ok && r.status !== 404) { const t = await r.text().catch(() => ''); throw new Error(t.slice(0, 120) || ('error ' + r.status)); }
      return res.json({ ok: true });
    }
    const name = String(b.name || '').replace(/[\r\n"]+/g, ' ').trim().slice(0, 40) || 'Mi voz';
    const m = /^data:([\w/+.-]+);base64,(.+)$/.exec(String(b.audio || ''));
    if (!m) return res.status(400).json({ error: 'Falta el audio.' });
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length < 16000) return res.status(400).json({ error: 'El audio es muy corto. Grabá al menos un minuto.' });
    if (buf.length > 10 * 1024 * 1024) return res.status(400).json({ error: 'El audio es muy pesado. Probá con uno más corto (1 a 2 minutos).' });
    const mime = m[1].split(';')[0], ext = (mime.split('/')[1] || 'mp3').replace('mpeg', 'mp3').replace('x-m4a', 'm4a');
    const blob = new Blob([buf], { type: mime }), filename = 'muestra.' + ext;
    const voice_id = provider === 'fish' ? await fishAdd(name, blob, filename) : await elevenAdd(name, blob, filename);
    if (!voice_id) throw new Error('el servicio no devolvió la voz');
    return res.json({ ok: true, voice_id, provider });
  } catch (e) {
    return res.status(502).json({ error: 'No se pudo guardar la voz: ' + (e && e.message || e) });
  }
};

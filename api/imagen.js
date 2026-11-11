// Rehace la foto de un producto con uno de los estilos publicitarios (usa la API de imágenes de OpenAI).
// POST { image: dataURL, prompt, size }  →  { img: dataURL }
const { cors, authorized, readBody } = require('./_lib');
const MODELS = [process.env.OPENAI_IMAGE_MODEL, 'gpt-image-1.5', 'gpt-image-1'].filter(Boolean);

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!authorized(req)) return res.status(401).json({ error: 'Falta la clave del estudio (o no coincide).' });
  const key = String(process.env.OPENAI_API_KEY || '').trim();
  if (!key) return res.status(400).json({ error: 'Falta OPENAI_API_KEY en Vercel.', code: 'noai' });
  const b = await readBody(req);
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(String(b.image || ''));
  const prompt = String(b.prompt || '').slice(0, 6000);
  if (!m || !prompt) return res.status(400).json({ error: 'Falta la foto o el texto del estilo.' });
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 4 * 1024 * 1024) return res.status(400).json({ error: 'La foto es muy pesada. Probá con una más chica.' });
  const size = ['1024x1024', '1024x1536', '1536x1024'].includes(b.size) ? b.size : '1024x1536';
  let last = '';
  for (const model of MODELS) {
    try {
      const fd = new FormData();
      fd.append('model', model); fd.append('prompt', prompt); fd.append('size', size); fd.append('quality', 'medium');
      fd.append('output_format', 'jpeg'); fd.append('output_compression', '90');
      fd.append('image', new Blob([buf], { type: m[1] }), 'producto.' + m[1].split('/')[1].replace('jpeg', 'jpg'));
      const r = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: 'Bearer ' + key }, body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        last = (j.error && j.error.message) || ('OpenAI respondió ' + r.status);
        if (r.status === 401) return res.status(400).json({ error: 'La clave de OpenAI no es válida.' });
        if (r.status === 429) return res.status(400).json({ error: 'OpenAI no tiene saldo o está saturado. Revisá tu cuenta.' });
        continue;
      }
      const d = j.data && j.data[0] && j.data[0].b64_json;
      if (!d) { last = 'respuesta sin imagen'; continue; }
      return res.json({ ok: true, model, img: 'data:image/jpeg;base64,' + d });
    } catch (e) { last = e.message; }
  }
  res.status(502).json({ error: last.slice(0, 200) || 'No se pudo generar.' });
};

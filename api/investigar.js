// Investiga un local en toda la web (su sitio, Google Maps, reseñas, Facebook, prensa, directorios)
// con la búsqueda web de OpenAI. Devuelve un resumen para armar contenido a medida.
// POST { name, city, ig, web, rubro, address }  →  { data: {...}, sources: [{ title, url }] }
const { cors, authorized, readBody } = require('./_lib');

const MODELS = [process.env.OPENAI_SEARCH_MODEL, 'gpt-5-mini', 'gpt-4.1-mini', 'gpt-4o-mini'].filter(Boolean);

function prompt(b) {
  return `Investigá este comercio de Argentina buscando en toda la web: su sitio oficial, Google Maps y sus reseñas, Facebook, Instagram, prensa local y directorios.
Comercio: "${b.name}"${b.city ? ` en ${b.city}` : ''}${b.ig ? `. Instagram: @${b.ig}` : ''}${b.web ? `. Web: ${b.web}` : ''}${b.address ? `. Dirección: ${b.address}` : ''}${b.rubro ? `. Rubro según el usuario: ${b.rubro}` : ''}.
Si encontrás varios comercios con ese nombre, quedate con el de esa ciudad. No inventes: si un dato no aparece, dejalo vacío y anotalo en "faltantes".
Respondé SOLO con un objeto JSON (sin texto antes ni después) con esta forma:
{"encontrado": true,
 "rubro": "una o dos palabras (ej: gimnasio, peluquería, consultorio odontológico)",
 "que_vende": ["hasta 5 productos o servicios principales"],
 "publico": "a quién le vende, en una frase corta",
 "tono": "cómo se comunica la marca, en pocas palabras (ej: cercano y motivador)",
 "diferencial": "qué lo distingue, en una frase",
 "dolores": ["3 problemas del día a día que probablemente tiene este negocio (consultas repetidas por WhatsApp, turnos, faltazos, pedidos, caja, stock), basados en reseñas o en el rubro"],
 "resenas": ["hasta 2 cosas que dicen sus clientes, parafraseadas en una frase corta"],
 "datos": {"direccion": "", "horarios": "", "whatsapp": "", "web": "", "instagram": "", "facebook": ""},
 "faltantes": ["lo que no pudiste averiguar"]}`;
}

function textOf(j) {
  if (typeof j.output_text === 'string') return j.output_text;
  return (j.output || []).flatMap(o => o.content || []).filter(c => c.type === 'output_text').map(c => c.text).join('\n');
}
function sourcesOf(j) {
  const out = [];
  (j.output || []).flatMap(o => o.content || []).forEach(c => (c.annotations || []).forEach(a => { if (a.type === 'url_citation' && a.url && !out.some(x => x.url === a.url)) out.push({ title: a.title || a.url, url: a.url }); }));
  return out.slice(0, 8);
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!authorized(req)) return res.status(401).json({ error: 'Clave del estudio incorrecta.' });
  const key = String(process.env.OPENAI_API_KEY || '').trim();
  if (!key) return res.status(400).json({ error: 'Para buscar en toda la web falta OPENAI_API_KEY en Vercel.', code: 'noai' });
  const b = await readBody(req);
  const clean = v => String(v || '').replace(/[\r\n"]+/g, ' ').trim().slice(0, 120);
  const body = { name: clean(b.name), city: clean(b.city), ig: clean(b.ig).replace(/^@/, ''), web: clean(b.web), rubro: clean(b.rubro), address: clean(b.address) };
  if (!body.name && !body.ig) return res.status(400).json({ error: 'Falta el nombre del local.' });
  let lastErr = '';
  for (const model of MODELS) {
    try {
      const r = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body: JSON.stringify({ model, tools: [{ type: 'web_search', user_location: { type: 'approximate', country: 'AR', city: body.city || undefined } }], input: prompt(body) })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        lastErr = (j.error && j.error.message) || ('OpenAI respondió ' + r.status);
        if (r.status === 404 || /model/i.test(lastErr)) continue; // probar otro modelo
        if (r.status === 401) return res.status(400).json({ error: 'La clave de OpenAI (OPENAI_API_KEY) no es válida.', code: 'noai' });
        if (r.status === 429) return res.status(400).json({ error: 'OpenAI no tiene saldo o está saturado. Revisá tu cuenta de OpenAI.', code: 'quota' });
        continue;
      }
      const txt = textOf(j), m = txt.match(/\{[\s\S]*\}/);
      if (!m) { lastErr = 'respuesta sin datos'; continue; }
      let data; try { data = JSON.parse(m[0]); } catch { lastErr = 'respuesta ilegible'; continue; }
      return res.json({ ok: true, model, data, sources: sourcesOf(j) });
    } catch (e) { lastErr = e.message; }
  }
  return res.status(502).json({ error: 'No pude investigar el local en la web: ' + lastErr.slice(0, 160) });
};

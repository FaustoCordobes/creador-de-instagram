// Utilidades compartidas por las funciones de /api
const GRAPH = 'https://graph.facebook.com/' + (process.env.GRAPH_VERSION || 'v25.0');

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-studio-key');
  res.setHeader('Access-Control-Expose-Headers', 'x-igstudio');
  res.setHeader('x-igstudio', '1');
}

// Si definiste STUDIO_PASSWORD en Vercel, todas las acciones sensibles la piden.
function authorized(req) {
  const pass = process.env.STUDIO_PASSWORD;
  if (!pass) return true;
  const got = req.headers['x-studio-key'] || (req.query && req.query.k) || '';
  return got === pass;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  const chunks = []; for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
}

async function graph(path, params = {}, method = 'GET') {
  const url = new URL(GRAPH + path);
  let opts = { method };
  if (method === 'GET') Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  else { const body = new URLSearchParams(); Object.entries(params).forEach(([k, v]) => v != null && body.set(k, String(v))); opts.body = body; opts.headers = { 'Content-Type': 'application/x-www-form-urlencoded' }; }
  const r = await fetch(url, opts);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) {
    const e = new Error((j.error && (j.error.error_user_msg || j.error.message)) || ('Meta respondió ' + r.status));
    e.meta = j.error || null; throw e;
  }
  return j;
}

module.exports = { GRAPH, cors, authorized, readBody, graph };

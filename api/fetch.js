// Proxy chico para que "Estudio de Contenido" pueda leer cualquier página web
// y bajar sus imágenes/capturas sin problemas de CORS.
// Uso: /api/fetch?url=https://ejemplo.com
const dns = require('dns').promises;
const net = require('net');

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  const v = ip.toLowerCase();
  return v === '::1' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80') || v.startsWith('::ffff:127.') || v.startsWith('::ffff:10.') || v.startsWith('::ffff:192.168.');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('x-igstudio', '1');
  res.setHeader('Access-Control-Expose-Headers', 'x-igstudio');
  let target;
  try { target = new URL(req.query.url || ''); } catch { res.status(400).send('URL inválida'); return; }
  if (!/^https?:$/.test(target.protocol)) { res.status(400).send('Solo http/https'); return; }
  try {
    const { address } = await dns.lookup(target.hostname);
    if (isPrivateIp(address)) { res.status(403).send('Destino no permitido'); return; }
  } catch { res.status(404).send('No se encontró el dominio'); return; }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const r = await fetch(target.href, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36', 'Accept-Language': 'es-AR,es;q=0.9' }
    });
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > MAX_BYTES) { res.status(413).send('Archivo muy grande'); return; }
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Cache-Control', 's-maxage=3600');
    res.status(r.status).send(buf);
  } catch (e) {
    res.status(502).send('No se pudo leer: ' + (e.name === 'AbortError' ? 'tardó demasiado' : e.message));
  } finally { clearTimeout(timer); }
};

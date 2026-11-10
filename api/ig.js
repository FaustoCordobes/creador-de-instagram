// Conexión con Instagram (API oficial de Meta, camino "Facebook Login").
// Acciones (POST JSON { action, ... } o GET ?action=):
//   ping       → qué está configurado (no pide clave)
//   status     → cuenta conectada
//   setup      → convierte un token de Graph API Explorer en un token de Página que no vence
//   discover   → lee el perfil público de otra cuenta de empresa/creador (business discovery)
//   container  → crea un contenedor (imagen, historia, reel, item de carrusel o carrusel)
//   check      → estado de un contenedor (IN_PROGRESS, FINISHED, ERROR…)
//   publish    → publica un contenedor y devuelve el link
//   sign       → link firmado temporal para archivos de un Blob privado
//   cleanup    → borra los archivos temporales subidos a Vercel Blob
const { cors, authorized, readBody, graph, studioPass, passInfo } = require('./_lib');

const TOKEN = () => process.env.IG_PAGE_TOKEN;

const unent = s => String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
async function igPublic(user){
  const ctl = () => AbortSignal.timeout(9000);
  // 1) el JSON que usa la web de Instagram (trae bio, logo, datos de contacto y las últimas fotos)
  try {
    const r = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${user}`, { signal: ctl(), headers: {
      'x-ig-app-id': '936619743392459', 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.0', 'Accept-Language': 'es-AR,es;q=0.9' } });
    if (r.ok) {
      const u = ((await r.json()).data || {}).user;
      if (u) {
        let addr = ''; try { const a = JSON.parse(u.business_address_json || '{}'); addr = [a.street_address, a.city_name].filter(Boolean).join(', '); } catch {}
        const edges = ((u.edge_owner_to_timeline_media || {}).edges || []).map(e => e.node);
        return { source: 'public', username: u.username, name: u.full_name, biography: u.biography, website: u.external_url, profile_picture_url: u.profile_pic_url_hd || u.profile_pic_url,
          category: u.category_name || u.business_category_name || '', phone: u.business_phone_number || u.public_phone_number || '', address: addr, private: !!u.is_private,
          media: { data: edges.slice(0, 12).map(n => ({ media_type: n.is_video ? 'VIDEO' : 'IMAGE', media_url: n.display_url, thumbnail_url: n.thumbnail_src || n.display_url, caption: (((n.edge_media_to_caption || {}).edges || [])[0] || { node: { text: '' } }).node.text })) } };
      }
    }
  } catch {}
  // 2) las etiquetas de la página (nombre y foto de perfil)
  const r = await fetch(`https://www.instagram.com/${user}/`, { signal: ctl(), headers: { 'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'Accept-Language': 'es-AR,es;q=0.9' } });
  const html = await r.text();
  const meta = k => unent((html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]+content=["']([^"']*)`, 'i')) || [])[1]);
  const title = meta('og:title'), desc = meta('og:description');
  if (!title && !desc) { const x = new Error('Instagram no dejó ver el perfil de @' + user + ' desde el servidor.'); x.code = 'blocked'; throw x; }
  const name = (title.match(/^(.*?)\s*\(@/) || [])[1] || '';
  const bio = (desc.match(/[“"](.+)[”"]\s*$/) || [])[1] || '';
  return { source: 'og', username: user, name, biography: bio, profile_picture_url: meta('og:image'), media: { data: [] } };
}
const IGID = () => process.env.IG_USER_ID;

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  const body = req.method === 'POST' ? await readBody(req) : {};
  const action = body.action || (req.query && req.query.action) || 'ping';

  if (action === 'ping') {
    return res.json({
      ok: true,
      ig: !!(TOKEN() && IGID()),
      igToken: !!TOKEN(), igUserId: !!IGID(),
      env: process.env.VERCEL_ENV || null,
      version: (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || null,
      vars: Object.keys(process.env).filter(k => /^(IG_|META_|STUDIO_|GOOGLE_|BLOB_)/.test(k)).sort(),
      metaApp: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
      metaInfo: { idLen: String(process.env.META_APP_ID || '').trim().length, secretLen: String(process.env.META_APP_SECRET || '').trim().length },
      google: !!process.env.GOOGLE_PLACES_KEY,
      tts: true,
      ttsPremium: { openai: !!process.env.OPENAI_API_KEY, eleven: !!process.env.ELEVENLABS_API_KEY },
      blob: !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID),
      blobMode: process.env.BLOB_READ_WRITE_TOKEN ? 'token' : (process.env.BLOB_STORE_ID ? 'presigned' : null),
      protected: !!studioPass(),
      pass: passInfo()
    });
  }
  if (!authorized(req)) return res.status(401).json({ error: 'Clave del estudio incorrecta.' });

  try {
    if (action === 'setup') {
      const id = String(process.env.META_APP_ID || '').replace(/["'\s]/g, ''), secret = String(process.env.META_APP_SECRET || '').replace(/["'\s]/g, '');
      if (!id || !secret) throw new Error('Faltan META_APP_ID y META_APP_SECRET en Vercel.');
      if (!body.token) throw new Error('Pegá el token de Graph API Explorer.');
      let long;
      try { long = await graph('/oauth/access_token', { grant_type: 'fb_exchange_token', client_id: id, client_secret: secret, fb_exchange_token: body.token.trim() }); }
      catch (e) { if (/client secret/i.test(e.message)) throw new Error('La clave secreta de Meta (META_APP_SECRET) no coincide con la app ' + id + '. Copiala de nuevo desde Configuración de la app → Básica (tocá Mostrar), cargala en Vercel y hacé Redeploy.'); throw e; }
      const pages = await graph('/me/accounts', { fields: 'name,access_token,instagram_business_account{id,username}', access_token: long.access_token });
      const out = (pages.data || []).map(p => ({ page: p.name, pageToken: p.access_token, igId: p.instagram_business_account && p.instagram_business_account.id, igUser: p.instagram_business_account && p.instagram_business_account.username }));
      if (!out.length) throw new Error('El token no ve ninguna Página. Revisá que hayas dado el permiso pages_show_list y elegido tu Página.');
      return res.json({ pages: out });
    }

    if (!TOKEN() || !IGID()) throw new Error('Instagram todavía no está conectado (faltan IG_PAGE_TOKEN e IG_USER_ID en Vercel).');

    if (action === 'status') {
      const me = await graph('/' + IGID(), { fields: 'username,name,profile_picture_url,followers_count,media_count', access_token: TOKEN() });
      let limit = null; try { limit = await graph('/' + IGID() + '/content_publishing_limit', { fields: 'quota_usage,config', access_token: TOKEN() }); } catch {}
      let scopes = null;
      try {
        const id = String(process.env.META_APP_ID || '').replace(/["'\s]/g, ''), secret = String(process.env.META_APP_SECRET || '').replace(/["'\s]/g, '');
        if (id && secret) { const d = await graph('/debug_token', { input_token: TOKEN(), access_token: id + '|' + secret }); scopes = (d.data && d.data.scopes) || null; }
      } catch {}
      const need = ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights', 'pages_read_engagement', 'pages_show_list'];
      return res.json({ ...me, limit: limit && limit.data && limit.data[0], scopes, missing: scopes ? need.filter(x => !scopes.includes(x)) : null });
    }

    if (action === 'public') {
      // perfil público de Instagram sin permisos de Meta (respaldo cuando business discovery no anda)
      const user = String(body.username || '').replace(/^@/, '').trim();
      if (!/^[A-Za-z0-9._]{1,30}$/.test(user)) throw new Error('Usuario de Instagram inválido.');
      return res.json(await igPublic(user));
    }

    if (action === 'discover') {
      const user = String(body.username || '').replace(/^@/, '').trim();
      if (!/^[A-Za-z0-9._]{1,30}$/.test(user)) throw new Error('Usuario de Instagram inválido.');
      const mediaFields = 'caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}';
      const full = `business_discovery.username(${user}){username,name,biography,website,profile_picture_url,followers_count,media_count,media.limit(18){${mediaFields}}}`;
      const lite = `business_discovery.username(${user}){username,biography,website,followers_count,media_count,media.limit(18){caption,media_type,media_url,permalink}}`;
      let j;
      const perm = e => e && ((e.meta && (e.meta.code === 10 || e.meta.code === 200)) || /permission/i.test(e.message));
      const permErr = () => { const x = new Error('PERMISO: tu token de Instagram no tiene el permiso instagram_manage_insights, que Meta pide para leer otras cuentas. Generá el token de nuevo con ese permiso (GUIA-INSTAGRAM.md, paso 5), convertilo y reemplazá IG_PAGE_TOKEN en Vercel.'); x.code = 'perm'; return x; };
      try { j = await graph('/' + IGID(), { fields: full, access_token: TOKEN() }); }
      catch (e) {
        if (perm(e)) throw permErr();
        if (/not.*(business|creator)|cannot be found|does not exist|No.*user|110/i.test(e.message)) { const x = new Error(`@${user} no es una cuenta de empresa o creador (o no existe). Instagram solo deja leer cuentas profesionales.`); x.code = 'personal'; throw x; }
        try { j = await graph('/' + IGID(), { fields: lite, access_token: TOKEN() }); } catch (e2) { if (perm(e2)) throw permErr(); throw e2; }
      }
      return res.json(j.business_discovery || {});
    }

    if (action === 'container') {
      // kind: image | story | reel | item | carousel
      const p = { access_token: TOKEN() };
      const k = body.kind;
      if (k === 'image') { p.image_url = body.url; p.caption = body.caption || ''; }
      else if (k === 'item') { p.image_url = body.url; p.is_carousel_item = 'true'; }
      else if (k === 'story') { p.media_type = 'STORIES'; if (body.video) p.video_url = body.url; else p.image_url = body.url; }
      else if (k === 'reel') { p.media_type = 'REELS'; p.video_url = body.url; p.caption = body.caption || ''; p.share_to_feed = body.shareToFeed === false ? 'false' : 'true'; }
      else if (k === 'carousel') { p.media_type = 'CAROUSEL'; p.children = (body.children || []).join(','); p.caption = body.caption || ''; }
      else throw new Error('Tipo de contenido desconocido.');
      const j = await graph('/' + IGID() + '/media', p, 'POST');
      return res.json({ id: j.id });
    }

    if (action === 'check') {
      const j = await graph('/' + body.id, { fields: 'status_code,status', access_token: TOKEN() });
      return res.json(j);
    }

    if (action === 'publish') {
      const j = await graph('/' + IGID() + '/media_publish', { creation_id: body.id, access_token: TOKEN() }, 'POST');
      let link = null; try { const m = await graph('/' + j.id, { fields: 'permalink', access_token: TOKEN() }); link = m.permalink; } catch {}
      return res.json({ id: j.id, permalink: link });
    }

    if (action === 'sign') {
      // Blob privado: link firmado temporal para que Instagram pueda descargar el archivo
      const u = new URL(String(body.url || ''));
      if (!/blob\.vercel-storage\.com$/.test(u.hostname)) throw new Error('URL de almacenamiento inválida.');
      const pathname = decodeURIComponent(u.pathname.replace(/^\//, ''));
      const { issueSignedToken, presignUrl } = require('@vercel/blob');
      const validUntil = Date.now() + 60 * 60 * 1000;
      const token = await issueSignedToken({ pathname, operations: ['get'], validUntil });
      const { presignedUrl } = await presignUrl(token, { operation: 'get', pathname, access: 'private', validUntil });
      return res.json({ url: presignedUrl });
    }

    if (action === 'cleanup') {
      const urls = (body.urls || []).filter(u => /blob\.vercel-storage\.com/.test(u));
      if (urls.length && (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)) { const { del } = require('@vercel/blob'); await del(urls); }
      return res.json({ deleted: urls.length });
    }

    return res.status(400).json({ error: 'Acción desconocida' });
  } catch (e) {
    return res.status(400).json({ error: e.message, code: e.code || undefined, meta: e.meta || undefined });
  }
};

// Recorrido de una app o web: la abre en un navegador real, toca sus secciones
// (menús, pestañas, botones seguros), baja con scroll y saca una captura de cada pantalla.
// Así el contenido muestra la app funcionando y no solo la portada.
// POST { url, device: 'movil' | 'compu', max: 6 }  →  { frames: [{ label, kind, tap, img }] }
const dns = require('dns').promises;
const net = require('net');
const crypto = require('crypto');
const { cors, authorized, readBody } = require('./_lib');

const DEVICES = {
  movil: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  compu: { width: 1366, height: 860, deviceScaleFactor: 1, isMobile: false, hasTouch: false }
};
const UA = {
  movil: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  compu: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36'
};
const BUDGET_MS = 40000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  const v = ip.toLowerCase();
  return v === '::1' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80') || v.startsWith('::ffff:127.') || v.startsWith('::ffff:10.') || v.startsWith('::ffff:192.168.');
}
function privateHost(h) {
  h = (h || '').toLowerCase().replace(/^\[|\]$/g, '');
  return h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.internal') || (net.isIP(h) && isPrivateIp(h));
}

async function launch() {
  const puppeteer = require('puppeteer-core');
  if (process.env.CHROME_PATH) {
    return puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars', '--mute-audio'] });
  }
  const chromium = require('@sparticuz/chromium');
  return puppeteer.launch({ executablePath: await chromium.executablePath(), headless: true, args: [...chromium.args, '--hide-scrollbars', '--mute-audio'] });
}

// se corre adentro de la página: busca lo que se puede tocar sin romper nada
function findTargets(usedTexts, noToggle) {
  const DANGER = /(borr|elimin|quit|salir|cerrar sesi|log ?out|sign ?out|pag(ar|á)|compr(ar|á)|finaliz|confirm|enviar|envi(á|a) |mand(ar|á)|delete|remove|vaciar|reset|restablec|cancel|descarg|download|imprim|print|whats|llam(ar|á)|tel[eé]fono|instagram|facebook|tiktok|twitter|youtube|linkedin|mail|correo|compart|registr|crear cuenta|suscrib|donar|desinstal|cookies?|privacidad|t[eé]rminos|aviso legal)/i;
  const vw = innerWidth, vh = innerHeight;
  const groups = [
    ['[role=tab]', 12], ['nav a, nav button, [role=navigation] a, [role=navigation] button', 10], ['.tabs button, .tabs a, .tab, .tab-btn, .nav-link, .nav-item, .bottom-nav button, .bottom-nav a, .tabbar button', 10],
    ['aside a, aside button, .sidebar a, .sidebar button, .menu a, .menu button', 9], ['[data-tab], [data-view], [data-page], [data-section], [data-target], [data-screen], [data-route]', 9],
    ['header a, header button', 7], ['a[href^="#"]:not([href="#"])', 6], ['[onclick]', 5], ['summary, [aria-expanded]', 5], ['button, [role=button], .btn', 3]
  ];
  const seen = new Set(), out = [];
  const fixedAnc = el => { for (let n = el; n && n !== document.body; n = n.parentElement) { const p = getComputedStyle(n).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
  groups.forEach(([sel, base]) => {
    let list; try { list = document.querySelectorAll(sel); } catch { return; }
    list.forEach(el => {
      if (seen.has(el) || out.length > 80) return; seen.add(el);
      const r = el.getBoundingClientRect();
      if (r.width < 14 || r.height < 14 || (r.width > vw * 0.95 && r.height > vh * 0.4)) return;
      const st = getComputedStyle(el); if (st.visibility === 'hidden' || st.display === 'none' || +st.opacity < 0.15 || st.pointerEvents === 'none') return;
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
      if (el.closest('input, select, textarea, [contenteditable=true]')) return;
      const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').replace(/\s+/g, ' ').trim();
      if (!text || text.length > 32 || DANGER.test(text)) return;
      const toggle = /^(☰|≡|⋮|…|menu|men[uú]|abrir men[uú]|navegaci[oó]n)$/i.test(text) || /burger|ham|menu-toggle|nav-toggle|toggler/i.test(el.className || '') || (el.hasAttribute('aria-expanded') && el.getAttribute('aria-expanded') === 'false' && el.closest('header, nav'));
      if (toggle && noToggle) return;
      if (!toggle && usedTexts.includes(text.toLowerCase())) return;
      const label = /\p{L}{2,}/u.test(text) ? text : (el.getAttribute('aria-label') || el.getAttribute('title') || 'Menú');
      if (el.tagName === 'A') {
        const href = el.getAttribute('href') || '';
        if (/^(mailto|tel|sms|javascript):/i.test(href) || el.target === '_blank' || el.hasAttribute('download')) return;
        try { const u = new URL(el.href, location.href); if (u.origin !== location.origin || /\.(pdf|zip|rar|png|jpe?g|webp|docx?|xlsx?|csv)$/i.test(u.pathname)) return; } catch { return; }
      }
      const type = (el.getAttribute('type') || '').toLowerCase();
      if (type === 'submit' || type === 'reset' || (el.tagName === 'BUTTON' && el.closest('form') && type !== 'button')) return;
      const inView = r.top >= 0 && r.bottom <= vh && r.left >= 0 && r.right <= vw;
      const score = base + (inView ? 3 : 0) + (fixedAnc(el) ? 2 : 0) - (r.top > vh * 3 ? 3 : 0) + (el.matches('[aria-selected=true], .active, .selected, [aria-current]') ? -6 : 0);
      out.push({ el, text, label, toggle: !!toggle, score: score - (toggle ? 4 : 0), top: r.top });
    });
  });
  out.sort((a, b) => b.score - a.score || a.top - b.top);
  const uniq = [], texts = new Set();
  out.forEach(o => { const k = o.text.toLowerCase(); if (!texts.has(k)) { texts.add(k); uniq.push(o); } });
  document.querySelectorAll('[data-ig-tour]').forEach(n => n.removeAttribute('data-ig-tour'));
  return uniq.slice(0, 10).map((o, i) => { o.el.setAttribute('data-ig-tour', String(i)); return { i, text: o.text, label: o.label, toggle: o.toggle }; });
}

async function shot(page) {
  const img = await page.screenshot({ type: 'jpeg', quality: 72, encoding: 'base64' });
  return { img, hash: crypto.createHash('sha1').update(img).digest('hex') };
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (!authorized(req)) { res.status(401).json({ error: 'Falta la clave del estudio (o no coincide).' }); return; }
  const body = await readBody(req);
  let target;
  try { target = new URL(String(body.url || req.query.url || '')); } catch { res.status(400).json({ error: 'Ese link no es válido.' }); return; }
  if (!/^https?:$/.test(target.protocol)) { res.status(400).json({ error: 'Solo links http o https.' }); return; }
  try { const { address } = await dns.lookup(target.hostname); if (isPrivateIp(address) && !process.env.RECORRIDO_LOCAL_TEST) { res.status(403).json({ error: 'Ese destino no está permitido.' }); return; } }
  catch { res.status(404).json({ error: 'No encontré esa página. Revisá el link.' }); return; }

  const device = DEVICES[body.device] ? body.device : 'movil';
  const max = Math.max(2, Math.min(8, +body.max || 6));
  const t0 = Date.now(), left = () => BUDGET_MS - (Date.now() - t0);
  let browser, page = null;
  try {
    browser = await launch();
    browser.on('targetcreated', async t => { try { if (page && t.type() === 'page') { const p = await t.page(); if (p && p !== page) await p.close(); } } catch {} });
    page = await browser.newPage();
    await page.setViewport(DEVICES[device]);
    await page.setUserAgent(UA[device]);
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'es-AR,es;q=0.9' });
    await page.evaluateOnNewDocument(() => { window.open = () => null; window.print = () => {}; window.alert = () => {}; window.confirm = () => false; window.prompt = () => null; });
    page.on('dialog', d => d.dismiss().catch(() => {}));
    await page.setRequestInterception(true);
    page.on('request', r => { let h = ''; try { h = new URL(r.url()).hostname; } catch {} if ((privateHost(h) && !process.env.RECORRIDO_LOCAL_TEST) || r.isNavigationRequest() && r.frame() === page.mainFrame() && /\.(pdf|zip)$/i.test(r.url())) r.abort().catch(() => {}); else r.continue().catch(() => {}); });

    await page.goto(target.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 8000 }).catch(() => {});
    await sleep(900);
    // cartel de cookies: aceptarlo para que no tape
    await page.evaluate(() => { const b = [...document.querySelectorAll('button, a')].find(x => /^(aceptar( todo| todas)?|acepto|entendido|ok|accept( all)?|got it)$/i.test((x.innerText || '').trim()) && x.closest('[class*=cookie i], [id*=cookie i], [class*=consent i], [id*=consent i]')); if (b) b.click(); }).catch(() => {});
    await sleep(300);

    const origin = new URL(page.url()).origin;
    const frames = [];
    // lo que ya está abierto al entrar (pestaña activa) no hace falta tocarlo
    const used = await page.evaluate(() => [...document.querySelectorAll('[aria-selected=true], [aria-current], .active, .selected, .is-active')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim().toLowerCase()).filter(t => t && t.length < 33)).catch(() => []);
    let cur = await shot(page);
    frames.push({ label: 'Inicio', kind: 'start', tap: null, img: cur.img });

    let misses = 0, lastToggle = false, toggles = 0;
    while (frames.length < max && left() > 4000 && misses < 6) {
      // un menú (☰) se puede volver a abrir, pero no dos veces seguidas ni como última pantalla
      const targets = await page.evaluate(findTargets, used, lastToggle || toggles >= 4 || frames.length >= max - 1).catch(() => []);
      if (!targets.length) break;
      const t = targets[0];
      if (t.toggle) toggles++; else used.push(t.text.toLowerCase());
      const sel = `[data-ig-tour="${t.i}"]`;
      // si está fuera de la pantalla, primero bajamos hasta ahí (y eso también se ve)
      const before = await page.evaluate(() => scrollY);
      await page.evaluate(s => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: 'center', behavior: 'instant' }); }, sel).catch(() => {});
      await sleep(350);
      const after = await page.evaluate(() => scrollY);
      if (Math.abs(after - before) > 60) {
        const s2 = await shot(page);
        if (s2.hash !== cur.hash) { frames.push({ label: '', kind: 'scroll', tap: null, img: s2.img }); cur = s2; if (frames.length >= max) break; }
      }
      const box = await page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: innerWidth, h: innerHeight }; }, sel).catch(() => null);
      if (!box || box.y < 0 || box.y > box.h) { misses++; continue; }
      const urlBefore = page.url();
      try {
        if (DEVICES[device].hasTouch) await page.touchscreen.tap(box.x, box.y); else { await page.mouse.move(box.x, box.y, { steps: 4 }); await page.mouse.click(box.x, box.y); }
      } catch { misses++; continue; }
      await Promise.race([page.waitForNavigation({ timeout: 3000, waitUntil: 'domcontentloaded' }).catch(() => {}), sleep(1100)]);
      await page.waitForNetworkIdle({ idleTime: 400, timeout: 2500 }).catch(() => {});
      await sleep(450);
      let here; try { here = new URL(page.url()).origin; } catch { here = ''; }
      if (here !== origin) { await page.goBack({ timeout: 6000 }).catch(() => page.goto(urlBefore, { timeout: 10000 }).catch(() => {})); await sleep(600); cur = await shot(page); misses++; continue; }
      const s3 = await shot(page);
      if (s3.hash === cur.hash) { misses++; continue; }
      lastToggle = t.toggle;
      frames.push({ label: t.label, kind: 'tap', tap: { x: +(box.x / box.w).toFixed(3), y: +(box.y / box.h).toFixed(3) }, img: s3.img });
      cur = s3; misses = 0;
    }
    // si quedó lugar, bajar por la página para mostrar más
    while (frames.length < Math.min(max, 4) && left() > 3000) {
      const moved = await page.evaluate(() => { const y = scrollY; scrollBy(0, innerHeight * 0.85); return scrollY - y; }).catch(() => 0);
      if (moved < 80) break;
      await sleep(500);
      const s4 = await shot(page);
      if (s4.hash === cur.hash) break;
      frames.push({ label: '', kind: 'scroll', tap: null, img: s4.img }); cur = s4;
    }
    const v = DEVICES[device];
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true, url: page.url(), device, w: v.width * v.deviceScaleFactor, h: v.height * v.deviceScaleFactor,
      frames: frames.map(f => ({ label: f.label, kind: f.kind, tap: f.tap, img: 'data:image/jpeg;base64,' + f.img })) });
  } catch (e) {
    const m = String(e && e.message || e);
    res.status(502).json({ error: /timeout|Timeout/.test(m) ? 'La página tardó demasiado en abrir. Probá de nuevo o subí capturas a mano.' : 'No pude recorrer la página: ' + m.slice(0, 160) });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
};

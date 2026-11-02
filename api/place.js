// Busca un local en Google Maps (Places API New) y trae sus datos y fotos.
//   GET ?q=fitos cafeteria san martin de los andes  → datos del local más parecido (+ 2 alternativas)
//   GET ?photo=places/XXX/photos/YYY                 → la foto (imagen)
//   GET ?resolve=https://maps.app.goo.gl/...         → URL final de un link corto
const { cors, authorized } = require('./_lib');

const FIELDS = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.shortFormattedAddress',
  'places.nationalPhoneNumber', 'places.internationalPhoneNumber', 'places.websiteUri',
  'places.regularOpeningHours.weekdayDescriptions', 'places.rating', 'places.userRatingCount',
  'places.photos', 'places.primaryTypeDisplayName', 'places.editorialSummary', 'places.googleMapsUri', 'places.reviews'
].join(',');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  const q = req.query || {};

  if (q.resolve) {
    try {
      const u = new URL(q.resolve);
      if (!/(^|\.)(goo\.gl|app\.goo\.gl|g\.co|google\.[a-z.]+)$/i.test(u.hostname)) throw new Error('Solo links de Google');
      const r = await fetch(u.href, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
      return res.json({ url: r.url });
    } catch (e) { return res.status(400).json({ error: e.message }); }
  }

  if (!authorized(req)) return res.status(401).json({ error: 'Clave del estudio incorrecta.' });
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) return res.status(400).json({ error: 'Falta GOOGLE_PLACES_KEY en Vercel.' });

  try {
    if (q.photo) {
      if (!/^places\/[\w-]+\/photos\/[\w-]+$/.test(q.photo)) throw new Error('Foto inválida');
      const r = await fetch(`https://places.googleapis.com/v1/${q.photo}/media?maxWidthPx=1600&key=${key}`);
      if (!r.ok) throw new Error('Google respondió ' + r.status);
      res.setHeader('Content-Type', r.headers.get('content-type') || 'image/jpeg');
      res.setHeader('Cache-Control', 's-maxage=86400');
      return res.send(Buffer.from(await r.arrayBuffer()));
    }
    if (!q.q) throw new Error('Falta la búsqueda');
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FIELDS },
      body: JSON.stringify({ textQuery: String(q.q).slice(0, 200), languageCode: 'es', regionCode: 'AR', pageSize: 3 })
    });
    const j = await r.json();
    if (!r.ok) throw new Error((j.error && j.error.message) || 'Google respondió ' + r.status);
    const places = (j.places || []).map(p => ({
      name: p.displayName && p.displayName.text,
      type: p.primaryTypeDisplayName && p.primaryTypeDisplayName.text,
      address: p.shortFormattedAddress || p.formattedAddress,
      phone: p.nationalPhoneNumber || p.internationalPhoneNumber,
      website: p.websiteUri, maps: p.googleMapsUri,
      hours: (p.regularOpeningHours && p.regularOpeningHours.weekdayDescriptions) || [],
      rating: p.rating, ratings: p.userRatingCount,
      summary: p.editorialSummary && p.editorialSummary.text,
      reviews: (p.reviews || []).map(rv => ({ rating: rv.rating, text: (rv.text && rv.text.text) || (rv.originalText && rv.originalText.text) || '', author: rv.authorAttribution && rv.authorAttribution.displayName })),
      photos: (p.photos || []).slice(0, 8).map(ph => ph.name)
    }));
    return res.json({ places });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

// Entrega permisos de subida directa a Vercel Blob (para que Instagram pueda descargar
// las imágenes y el video desde una URL pública). Los archivos se borran después de publicar.
const { handleUpload } = require('@vercel/blob/client');
const { cors, readBody } = require('./_lib');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const body = await readBody(req);
    const json = await handleUpload({
      body, request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const pass = process.env.STUDIO_PASSWORD;
        if (pass && clientPayload !== pass) throw new Error('Clave del estudio incorrecta.');
        return { allowedContentTypes: ['image/jpeg', 'video/mp4'], maximumSizeInBytes: 200 * 1024 * 1024, addRandomSuffix: true };
      }
    });
    res.json(json);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

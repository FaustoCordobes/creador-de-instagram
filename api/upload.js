// Subida temporal a Vercel Blob para que Instagram pueda descargar las imágenes y el video
// desde una URL pública. Los archivos se borran después de publicar.
// Funciona con los dos tipos de conexión de Blob:
//   - BLOB_READ_WRITE_TOKEN (conexión clásica)
//   - BLOB_STORE_ID (conexión nueva de Vercel, sin token)
const { handleUpload, handleUploadPresigned } = require('@vercel/blob/client');
const { issueSignedToken } = require('@vercel/blob');
const { cors, readBody, studioPass } = require('./_lib');

const TYPES = ['image/jpeg', 'video/mp4'];
const MAX = 200 * 1024 * 1024;
function checkKey(clientPayload) {
  const pass = studioPass();
  if (pass && String(clientPayload || '').trim() !== pass) throw new Error('Clave del estudio incorrecta.');
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const body = await readBody(req);
    let json;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      json = await handleUpload({
        body, request: req,
        onBeforeGenerateToken: async (pathname, clientPayload) => { checkKey(clientPayload); return { allowedContentTypes: TYPES, maximumSizeInBytes: MAX, addRandomSuffix: true }; }
      });
    } else {
      json = await handleUploadPresigned({
        body, request: req,
        getSignedToken: async (pathname, clientPayload) => {
          checkKey(clientPayload);
          const token = await issueSignedToken({ pathname, operations: ['put'], allowedContentTypes: TYPES, maximumSizeInBytes: MAX, validUntil: Date.now() + 30 * 60 * 1000 });
          return { token, urlOptions: { allowedContentTypes: TYPES, maximumSizeInBytes: MAX, addRandomSuffix: true } };
        }
      });
    }
    res.json(json);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

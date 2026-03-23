// api/submit.js (Vercel Serverless Function)

// Загрузка base64 изображения в Cloudinary, возвращает URL
async function uploadToCloudinary(base64DataUri) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary env variables not configured');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formBody = new URLSearchParams();
  formBody.append('file', base64DataUri);
  formBody.append('upload_preset', uploadPreset);

  const resp = await fetch(url, {
    method: 'POST',
    body: formBody,
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Cloudinary upload failed (${resp.status}): ${errText}`);
  }

  const data = await resp.json();
  return data.secure_url;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Вебхук Leadteh
    const WEBHOOK_URL = 'https://rb729467.leadteh.ru/inner_webhook/0f32708a-4738-425e-903a-986db0842534';

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = null; }
    }
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const telegram_id = body.telegram_id ?? null;

    // Валидация 7 числовых полей замеров
    const measurementFields = ['weight', 'chest', 'navel', 'stomach', 'hips', 'legs', 'arms'];
    const measurements = {};
    const errors = [];

    for (const field of measurementFields) {
      const val = parseFloat(body[field]);
      if (isNaN(val) || val <= 0) {
        errors.push(`${field} must be a positive number`);
      } else {
        measurements[field] = val;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Фото (опциональные, base64 строки) → загрузка в Cloudinary → URL
    const photoFields = ['photo_1', 'photo_2', 'photo_3'];
    const photoUrls = {};

    for (const field of photoFields) {
      const raw = body[field];
      if (typeof raw === 'string' && raw.length > 0) {
        try {
          photoUrls[field] = await uploadToCloudinary(raw);
        } catch (err) {
          return res.status(502).json({
            error: `Failed to upload ${field} to Cloudinary`,
            message: err.message,
          });
        }
      } else {
        photoUrls[field] = null;
      }
    }

    // Подготовка данных для LEADTEX
    const payloadToLeadteh = {
      contact_by: 'telegram_id',
      search: String(telegram_id),
      variables: {
        // Замеры тела
        weight: measurements.weight,
        chest: measurements.chest,
        navel: measurements.navel,
        stomach: measurements.stomach,
        hips: measurements.hips,
        legs: measurements.legs,
        arms: measurements.arms,

        // Фото (URL из Cloudinary)
        photo_1: photoUrls.photo_1,
        photo_2: photoUrls.photo_2,
        photo_3: photoUrls.photo_3,

        // Системные поля
        telegram_id: telegram_id,
        source: 'telegram-webapp-data-collection',
        ts: new Date().toISOString(),
        submission_date: new Date().toISOString().split('T')[0]
      }
    };

    const r = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadToLeadteh),
    });

    const text = await r.text().catch(() => '');
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch {}

    if (!r.ok) {
      return res.status(502).json({
        error: 'Leadteh webhook error',
        status: r.status,
        body: json || text || null,
      });
    }

    return res.status(200).json({ ok: true, leadteh: json || null });
  } catch (e) {
    return res.status(500).json({
      error: 'Unhandled server error',
      message: e && e.message ? e.message : 'unknown',
    });
  }
};

// api/submit.js (Vercel Serverless Function)

module.exports = async (req, res) => {
  // CORS-заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Вебхук Leadteh
    const WEBHOOK_URL = 'https://rb729467.leadteh.ru/inner_webhook/4c77523d-3415-43d1-8668-07d35281cadb';

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = null; }
    }
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const telegram_id = body.telegram_id ?? null;

    // Валидация: telegram_id обязателен
    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    // Валидация 7 числовых полей замеров
    const measurementFields = ['weight', 'chest', 'navel', 'stomach', 'hips', 'legs', 'arms'];
    const measurements = {};
    const errors = [];

    for (const field of measurementFields) {
      const val = body[field];
      if (typeof val !== 'string' || val.trim() === '') {
        errors.push(`${field} must be a non-empty string`);
      } else {
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) {
          errors.push(`${field} must be a positive number`);
        } else {
          measurements[field] = val;
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Подготовка данных для Leadteh
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

        // Системные поля
        telegram_id: String(telegram_id),
        source: 'telegram-webapp-data-collection',
        ts: new Date().toISOString(),
        submission_date: new Date().toISOString().split('T')[0]
      }
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let r;
    try {
      r = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToLeadteh),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

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
    if (e && e.name === 'AbortError') {
      return res.status(504).json({ error: 'Leadteh webhook timeout (15s)' });
    }
    return res.status(500).json({
      error: 'Unhandled server error',
      message: e && e.message ? e.message : 'unknown',
    });
  }
};

// api/submit.js (Vercel Serverless Function)

module.exports = async (req, res) => {
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

    // Валидация 7 числовых полей замеров
    const measurementFields = ['weight', 'chest', 'navel', 'stomach', 'hips', 'legs', 'arms'];
    const measurements = {};
    const errors = [];

    for (const field of measurementFields) {
      const val = body[field];
      if (typeof val !== 'string' || val.trim() === '') {
        errors.push(`${field} must be a non-empty string`);
      } else {
        measurements[field] = val;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
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

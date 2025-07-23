import fetch from 'node-fetch';

const { WEBHOOK_URL, PERSONA_FIELD } = process.env;

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Only POST');

  try {
    const { name, phone, persona } = req.body;

    const fields = {
      TITLE: `Квиз: ${name}`,
      NAME:  name,
      PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }],
      [PERSONA_FIELD]: persona
    };

    const r = await fetch(`${WEBHOOK_URL}crm.lead.add.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });

    const json = await r.json();
    if (json.error) throw new Error(json.error_description || json.error);

    res.json({ ok: true, id: json.result });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

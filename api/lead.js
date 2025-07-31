export default async (req, res) => {
  /* ----------  CORS  ---------- */
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();               // pre-flight ответ без тела
  }
  res.setHeader('Access-Control-Allow-Origin', '*'); // для обычного POST

  /* ----------  только POST  ---------- */
  if (req.method !== 'POST')
    return res.status(405).end('Only POST');

  try {
    /* ----------  получаем данные формы  ---------- */
    const { name, phone, persona } = req.body;

    /* ----------  готовим поля лида  ---------- */
    const { WEBHOOK_URL, PERSONA_FIELD } = process.env;  // из переменных Vercel

    const fields = {
      TITLE: `Квиз: ${name}`,
      NAME:  name,
      PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }],
      [PERSONA_FIELD]: persona              // пользовательское поле «Типаж квиза»
    };

    /* ----------  вызываем Bitrix24  ---------- */
    const r = await fetch(`${WEBHOOK_URL}crm.lead.add.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    const json = await r.json();
    if (json.error) throw new Error(json.error_description || json.error);

    /* ----------  успех  ---------- */
    return res.status(200).json({ ok: true, id: json.result });
  } catch (e) {
    /* ----------  ошибка  ---------- */
    return res.status(500).send(e.message);
  }
};

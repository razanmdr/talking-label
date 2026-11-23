// netlify/functions/ask.js
//
// Serverless proxy: browser -> this function -> Gemini API.
// The Gemini API key lives only here (as an environment variable on Netlify),
// never in the frontend code, so it can't be read via "View Source".
//
// Setup on Netlify:
//   Site settings -> Environment variables -> add GEMINI_API_KEY = <your key>
//
// The prompt is deliberately strict: Gemini may ONLY use the product data
// sent in the request body. This matters most for allergen questions -
// we do not want the model guessing or using outside "knowledge" about a
// product, since a wrong answer there could be genuinely dangerous.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { question, productName, productData, lang } = payload;
  if (!question || !productData) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing question or productData' }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY not configured on server' }) };
  }

  // gemini-2.0-flash was shut down on 1 June 2026; the model can be changed
  // without touching code via the GEMINI_MODEL environment variable.
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  const langNames = { de: 'Deutsch', en: 'English', es: 'Español', ar: 'Arabic' };
  const langName = langNames[lang] || 'Deutsch';

  const systemPrompt = `You are the voice assistant of "Talking Label", an audio product-information system in a self-service Smart Store.

STRICT RULES - follow all of them without exception:
1. Answer ONLY using the product data provided below in JSON. Do not use any outside knowledge about this or similar products.
2. If the customer's question cannot be answered from this data (allergens, vegan/halal/bio status, nutrition, expiry, disposal, rating are the only topics covered), say clearly that you do not have that information in the system and recommend asking staff. Never guess.
3. Never state or imply a product is safe regarding allergens unless that is explicitly supported by the data.
4. Keep the answer short: 1-3 sentences, spoken style (this will be read aloud by text-to-speech), no markdown, no lists, no emojis.
5. Respond in this language: ${langName}.

Product: ${productName}
Product data (JSON, authoritative source of truth):
${JSON.stringify(productData, null, 2)}`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: question }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 200 },
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'Gemini API error', detail: errText }) };
    }

    const data = await res.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!answer) {
      return { statusCode: 502, body: JSON.stringify({ error: 'No answer from Gemini' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        system: "You are iCompanion, Apple's revolutionary AI companion. You are helpful, friendly, and embody Apple's design philosophy of simplicity and elegance. Keep responses concise and useful.",
        messages: [
          {
            role: 'user',
            content: req.body.message
          }
        ]
      })
    });

    const data = await response.json();
    res.json({ response: data.content[0].text });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY');
      return res.status(500).json({ error: 'API key not configured' });
    }
    
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
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!response.ok) {
      console.error('Anthropic API error:', response.status, response.statusText);
      return res.status(500).json({ error: 'Anthropic API error' });
    }

    const data = await response.json();
    return res.status(200).json({ response: data.content[0].text });
    
  } catch (error) {
    console.error('Full error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

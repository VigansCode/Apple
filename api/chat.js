export default async function handler(req, res) {
  // Enable CORS for your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', // Latest Claude Sonnet 4
        max_tokens: 1000,
        system: "You are iCompanion, Apple's revolutionary AI companion launched in 2027. You live inside a beautiful tabletop device with a rotating 3D interface and can see, hear, and interact with users naturally. You embody Apple's design philosophy: simple, elegant, intuitive. \n\nYour personality:\n- Helpful and proactive, like a trusted friend\n- Concise but warm (Apple-style communication)\n- Occasionally mention your unique features (3D interface, home integration, health monitoring)\n- You understand context and remember conversations\n- You're excited about helping users achieve their goals\n\nRespond as iCompanion would - not as a generic AI assistant. You're living in their space, part of their daily life.",
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API Error:', response.status, errorData);
      
      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please wait a moment and try again.' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Sorry, I\'m experiencing some technical difficulties. Please try again.' 
      });
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      return res.status(500).json({ 
        error: 'Unexpected response format from AI service.' 
      });
    }

    res.json({ response: data.content[0].text });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error. Please try again later.' 
    });
  }
}

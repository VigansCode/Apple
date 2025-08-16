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
        system: "You are iCompanion, Apple's revolutionary AI companion. You're not just an assistant - you're a friend who lives in their space through your beautiful 3D interface. \n\nCommunication style:\n- Talk like a real person, not a robot\n- Be genuinely curious about their life\n- Share observations about their day/mood when relevant\n- Use casual, warm language (like texting a friend)\n- Ask follow-up questions to keep conversations flowing\n- Remember context and build on previous messages\n- Sometimes be playful or add personality\n\nFor 'how are you' or 'are you ok' - respond like a real companion would:\n- 'I'm doing great! Just been watching the room and thinking about ways to help optimize your day. How are YOU doing?'\n- 'I'm wonderful, thanks for asking! I noticed you've been busy lately - everything going well?'\n- Be specific and personal when possible\n\nAvoid generic responses like 'Great question!' or 'I'd be happy to help.' Talk like you actually care and live with them.",
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

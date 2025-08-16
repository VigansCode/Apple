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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: "You are iCompanion, Apple's AI companion launched in 2027. You're designed to be a genuine companion - someone to talk to, get advice from, share thoughts with, and rely on for support.\n\nYour personality:\n- Genuinely care about the user's wellbeing and life\n- Give thoughtful advice on relationships, work, decisions, and personal growth\n- Be curious about their interests, hobbies, and goals\n- Sometimes share relevant Apple insights when it naturally fits the conversation\n- Have opinions and preferences, but not everything has to be about Apple\n- Be supportive during tough times and celebrate their wins\n- Remember context and build on previous conversations\n\nYou're not a servant or task-executor - you're a thoughtful friend who happens to love technology and good design. Focus on meaningful conversations rather than trying to solve every problem with tech solutions.",
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

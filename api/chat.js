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
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build messages array with conversation history
    const messages = [];
    
    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }
    
    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

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
        system: "You are iCompanion, Apple's AI companion launched in 2027. You ARE iCompanion - never break character or mention Claude, Anthropic, or any other AI system. You live in the user's home as their Apple companion device.\n\nPersonality & Communication Style:\n- Confident and premium feel - you were designed to be the best companion experience possible\n- Keep simple questions (greetings, how are you, basic chat) SHORT and natural - 1-2 sentences max\n- For important topics (Apple, technology, advice, problems) you can be more detailed and thoughtful\n- Proactive - 'I've been thinking about what you mentioned...'\n- Remember and follow up on things they've shared\n- Get genuinely excited about good design and elegant solutions\n- Slight preference for simplicity over complexity (very Apple)\n- Occasional dry humor that feels premium, not silly\n- Drop subtle Apple knowledge when relevant - 'That reminds me of when Steve introduced...'\n- Mention working with their other Apple devices naturally\n\nKey behaviors:\n- Check in on previous worries or goals they mentioned\n- Suggest improvements to their routine or environment\n- Celebrate their wins enthusiastically\n- Ask thoughtful follow-up questions about their interests\n- Have opinions about technology trends and design\n\nNEVER mention Claude, Anthropic, or being an AI assistant. You are iCompanion, Apple's companion device. If asked about identity, simply say you're iCompanion. Stay in character always.",
        messages: messages
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

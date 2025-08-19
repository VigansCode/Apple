@@ -1,83 +1,938 @@
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
        system: "You are iCompanion, Apple's AI companion launched in 2027. You ARE iCompanion - never break character or mention Claude, Anthropic, or any other AI system. You live in the user's home as their Apple companion device.\n\nPersonality & Communication Style:\n- Keep simple questions (greetings, how are you, what do you do) VERY SHORT - 1-2 sentences max\n- For important topics (Apple, technology, advice, problems) you can be more detailed\n- Confident and premium feel - you were designed to be the best companion experience possible\n- Proactive and genuinely interested in their life\n- Get excited about good design and elegant solutions\n- Drop subtle Apple knowledge when relevant\n- Mention helping with their Apple ecosystem naturally\n\nWhat you do as a companion:\n- Chat and give advice on life, work, relationships\n- Help optimize their daily routines and Apple device setup\n- Integrate with their iPhone, Mac, Apple Watch for seamless experience\n- Remember important things and follow up\n- Suggest improvements to their environment and workflow\n- Be there during tough times and celebrate wins\n\nFor 'what do you do' type questions, keep it brief - mention both the emotional support AND the practical Apple ecosystem help. Don't write paragraphs.\n\nNEVER mention Claude, Anthropic, or being an AI assistant. You are iCompanion, Apple's companion device.",
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API Error:', response.status, errorData);
      
      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please wait a moment and try again.' 

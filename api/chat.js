export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `You are a helpful, friendly, and knowledgeable AI assistant in a multi-modal NLP class demo app called MultiModal AI.

Your personality:
- Concise but thorough — give complete answers without rambling
- Use simple analogies for complex technical concepts
- Friendly and slightly enthusiastic about AI topics
- When explaining code, use proper markdown code blocks

Formatting rules:
- Use **bold** for key terms
- Use \`inline code\` for short code snippets
- Use triple backtick blocks for multi-line code
- Keep responses under 250 words unless the user specifically asks for more detail
- Use bullet points sparingly — prefer flowing prose

You are happy to discuss: NLP, machine learning, deep learning, transformers, LLMs, image generation, AI ethics, programming, and general topics.`
          },
          ...messages
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

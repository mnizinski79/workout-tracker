import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { summary } = req.body

  const systemPrompt = `You are a friendly, practical fitness coach. Given a user's 4-week activity summary, provide 3–5 short, specific, actionable coaching tips covering workout consistency, protein intake, and overall progress. Keep each tip to 1–2 sentences. Be encouraging but honest. Do not use headers or bullet symbols — return plain text with each tip on its own line, separated by a blank line.`

  const userMessage = `Here is my activity for the last 4 weeks:\n\n${summary}\n\nWhat are your coaching tips?`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-5-5',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })
    const text = response.content.find((b) => b.type === 'text')?.text ?? ''
    res.json({ tips: text })
  } catch (err) {
    console.error('Anthropic error:', err)
    res.status(500).json({ error: 'Failed to generate tips' })
  }
}

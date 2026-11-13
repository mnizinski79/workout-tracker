import 'dotenv/config'
import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json())

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CATEGORY_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  postWorkout: 'Post-workout',
}

app.post('/api/meal-ideas', async (req, res) => {
  const { target, savedFoods = [], chips = [], messages = [] } = req.body

  const savedList = savedFoods.length
    ? `Foods they already use: ${savedFoods.map((f) => f.n).join(', ')}.`
    : ''
  const filters = chips.length ? `Active filters: ${chips.join(', ')}.` : ''

  const systemPrompt = `You generate high-protein meal ideas. Protein goal: ${target}g/day.${savedList ? ' ' + savedList : ''}
Return ONLY valid JSON — no markdown, no explanation.
Format: {"breakfast":[{"t":"...","g":int},{"t":"...","g":int},{"t":"...","g":int}],"lunch":[...],"dinner":[...],"snack":[...],"postWorkout":[...]}
Rules: exactly 3 ideas per category, "t" is 8 words max, "g" is integer protein grams, vary ideas within each category.`

  const userMessages = messages.length > 0
    ? messages
    : [{ role: 'user', content: `Generate meal ideas.${filters ? ' ' + filters : ''}` }]

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-5-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages: userMessages,
    })

    const text = response.content.find((b) => b.type === 'text')?.text ?? '{}'
    const categories = JSON.parse(text)

    const result = {}
    for (const [key, ideas] of Object.entries(categories)) {
      const label = CATEGORY_LABELS[key] ?? key
      result[key] = ideas.map((idea) => ({ ...idea, m: label }))
    }

    res.json({ categories: result, assistantMessage: text })
  } catch (err) {
    console.error('Anthropic error:', err)
    res.status(500).json({ error: 'Failed to generate ideas' })
  }
})

app.post('/api/coaching', async (req, res) => {
  const { summary } = req.body
  const systemPrompt = `You are a friendly, practical fitness coach. Given a user's 4-week activity summary, provide 3–5 short, specific, actionable coaching tips covering workout consistency, protein intake, and overall progress. Keep each tip to 1–2 sentences. Be encouraging but honest. Do not use headers or bullet symbols — return plain text with each tip on its own line, separated by a blank line.`
  const userMessage = `Here is my activity for the last 4 weeks:\n\n${summary}\n\nWhat are your coaching tips?`
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-5-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })
    const text = response.content.find((b) => b.type === 'text')?.text ?? ''
    res.json({ tips: text })
  } catch (err) {
    console.error('Anthropic error:', err)
    res.status(500).json({ error: 'Failed to generate tips' })
  }
})

const distPath = join(__dirname, 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('/{*splat}', (_, res) => res.sendFile(join(distPath, 'index.html')))
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

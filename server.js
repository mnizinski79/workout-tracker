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

app.post('/api/meal-ideas', async (req, res) => {
  const { target, savedFoods = [], chips = [], freeText = '' } = req.body

  const preferences = [...chips, freeText].filter(Boolean).join(', ')
  const savedList = savedFoods.length
    ? `Foods they already use: ${savedFoods.map((f) => f.n).join(', ')}.`
    : ''

  const prompt = `Return ONLY a JSON array of 5 high-protein meal ideas. No markdown, no explanation, just the array.
Goal: ${target}g protein/day.${savedList ? ' ' + savedList : ''}${preferences ? ' Preferences: ' + preferences + '.' : ''}
Format: [{"m":"Meal type","t":"10 words max description","g":protein_int},...]
Vary meal types (Breakfast/Lunch/Dinner/Snack/Post-workout). Keep "t" under 10 words.`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-5-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content.find((b) => b.type === 'text')?.text ?? '[]'
    const ideas = JSON.parse(text)
    res.json({ ideas })
  } catch (err) {
    console.error('Anthropic error:', err)
    res.status(500).json({ error: 'Failed to generate ideas' })
  }
})

// Serve built app in production
const distPath = join(__dirname, 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('/{*splat}', (_, res) => res.sendFile(join(distPath, 'index.html')))
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

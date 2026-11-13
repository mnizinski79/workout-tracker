import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CATEGORY_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  postWorkout: 'Post-workout',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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

    // Attach category label as "m" field to match IdeaDef shape
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
}

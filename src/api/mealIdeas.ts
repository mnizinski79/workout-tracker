import type { IdeaDef, SavedFood } from '../domain/types'

export type CategorizedIdeas = Record<string, IdeaDef[]>

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

interface GenerateParams {
  target: number
  savedFoods: SavedFood[]
  chips: string[]
  messages: ConversationMessage[]
}

export async function generateCategorizedIdeas(
  params: GenerateParams,
): Promise<{ categories: CategorizedIdeas; assistantMessage: string }> {
  const res = await fetch('/api/meal-ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Server error')
  return res.json()
}

// Legacy flat list (kept for the existing MealIdeas list display)
export async function generateMealIdeas(params: {
  target: number
  savedFoods: SavedFood[]
  chips: string[]
  freeText: string
}): Promise<IdeaDef[]> {
  const { categories } = await generateCategorizedIdeas({
    target: params.target,
    savedFoods: params.savedFoods,
    chips: [...params.chips, params.freeText].filter(Boolean),
    messages: [],
  })
  return Object.values(categories).flat()
}

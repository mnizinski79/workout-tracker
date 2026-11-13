import type { IdeaDef } from '../domain/types'
import type { SavedFood } from '../domain/types'

interface GenerateParams {
  target: number
  savedFoods: SavedFood[]
  chips: string[]
  freeText: string
}

export async function generateMealIdeas(params: GenerateParams): Promise<IdeaDef[]> {
  const res = await fetch('/api/meal-ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Server error')
  const data = await res.json()
  return data.ideas as IdeaDef[]
}

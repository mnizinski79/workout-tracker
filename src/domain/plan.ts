import type { WorkoutDay, WarmItem, FoodItem, MealDef, IdeaDef, ExercisePlan } from './types'

export const WK: Record<string, WorkoutDay> = {
  tue: {
    name: 'Tuesday',
    sub: 'Free weights and core',
    ex: [
      { id: 'curl', n: 'Bicep curls', sets: 3, lo: 12, hi: 15, w: 20, inc: 5 },
      { id: 'tri', n: 'Triceps press', sets: 3, lo: 12, hi: 15, w: 25, inc: 5 },
      { id: 'sarow', n: 'Single-arm row', sets: 3, lo: 12, hi: 15, w: 25, inc: 5, note: 'each side' },
      { id: 'incl', n: 'Incline chest press', sets: 3, lo: 12, hi: 15, w: 30, inc: 5 },
      { id: 'plank', n: 'Plank', sets: 3, lo: 30, hi: 45, w: 0, nw: true, unit: 'sec' },
      { id: 'rdl', n: 'Romanian deadlift', sets: 3, lo: 12, hi: 15, w: 30, inc: 5 },
      { id: 'squat', n: 'Squats', sets: 3, lo: 12, hi: 15, w: 0, inc: 5, note: 'bodyweight, add load when easy' },
    ],
  },
  wed: {
    name: 'Wednesday',
    sub: 'Machines: legs, chest, back',
    ex: [
      { id: 'legpress', n: 'Leg press', sets: 4, lo: 12, hi: 15, w: 140, inc: 10 },
      { id: 'chestm', n: 'Chest press machine', sets: 4, lo: 10, hi: 12, w: 60, inc: 5 },
      { id: 'lat', n: 'Lat pulldown', sets: 4, lo: 10, hi: 12, w: 80, inc: 5 },
      { id: 'legcurl', n: 'Leg curl', sets: 3, lo: 12, hi: 15, w: 50, inc: 5 },
      { id: 'hcr', n: 'High cable row', sets: 3, lo: 12, hi: 15, w: 32.5, inc: 2.5 },
      { id: 'situp', n: 'Sit-ups', sets: 3, lo: 12, hi: 15, w: 0, nw: true },
    ],
  },
  thu: {
    name: 'Thursday',
    sub: 'Glutes, shoulders, back',
    ex: [
      { id: 'bridge', n: 'Glute bridges', sets: 4, lo: 10, hi: 12, w: 35, inc: 5 },
      { id: 'scr', n: 'Seated cable row', sets: 4, lo: 10, hi: 12, w: 42.5, inc: 2.5 },
      { id: 'shp', n: 'Shoulder press', sets: 4, lo: 10, hi: 12, w: 60, inc: 5 },
      { id: 'legext', n: 'Leg extension', sets: 3, lo: 12, hi: 15, w: 50, inc: 5 },
      { id: 'tripd', n: 'Tricep pushdown', sets: 3, lo: 12, hi: 15, w: 80, inc: 5 },
      { id: 'sldl', n: 'Single-leg deadlift', sets: 3, lo: 10, hi: 12, w: 30, inc: 5, note: 'each leg' },
      { id: 'abc', n: 'Ab crunch machine', sets: 3, lo: 12, hi: 15, w: 90, inc: 5 },
    ],
  },
}

export const WARM: WarmItem[] = [
  { id: 'arm', n: 'Arm circles', d: '10 forward, 10 backward' },
  { id: 'row', n: 'Rowing machine', d: '1-2 min, about 200 strokes' },
  { id: 'thread', n: 'Thread the needle', d: '5 per side' },
]

export const FOODS: FoodItem[] = [
  { id: 'gy', n: 'Greek yogurt', s: '1 cup', g: 23, c: 'Dairy and eggs' },
  { id: 'cc', n: 'Cottage cheese', s: '1 cup', g: 25, c: 'Dairy and eggs' },
  { id: 'eggs', n: 'Eggs', s: '2 large', g: 12, c: 'Dairy and eggs' },
  { id: 'milk', n: 'Milk', s: '1 cup', g: 8, c: 'Dairy and eggs' },
  { id: 'string', n: 'String cheese', s: '1 stick', g: 7, c: 'Dairy and eggs' },
  { id: 'whey', n: 'Whey protein shake', s: '1 scoop', g: 24, c: 'Dairy and eggs' },
  { id: 'tofu', n: 'Firm tofu', s: '7 oz, half a block', g: 20, v: 1, c: 'Plant proteins' },
  { id: 'tempeh', n: 'Tempeh', s: '4 oz', g: 22, v: 1, c: 'Plant proteins' },
  { id: 'seitan', n: 'Seitan', s: '3 oz', g: 21, v: 1, c: 'Plant proteins' },
  { id: 'lentils', n: 'Lentils, cooked', s: '1 cup', g: 18, v: 1, c: 'Plant proteins' },
  { id: 'edamame', n: 'Edamame, shelled', s: '1 cup', g: 18, v: 1, c: 'Plant proteins' },
  { id: 'bbeans', n: 'Black beans, cooked', s: '1 cup', g: 15, v: 1, c: 'Plant proteins' },
  { id: 'chick', n: 'Chickpeas, cooked', s: '1 cup', g: 14, v: 1, c: 'Plant proteins' },
  { id: 'pea', n: 'Pea protein shake', s: '1 scoop', g: 21, v: 1, c: 'Plant proteins' },
  { id: 'soy', n: 'Soy milk', s: '1 cup', g: 7, v: 1, c: 'Plant proteins' },
  { id: 'hemp', n: 'Hemp seeds', s: '3 tbsp', g: 10, v: 1, c: 'Boosters' },
  { id: 'pb', n: 'Peanut butter', s: '2 tbsp', g: 7, v: 1, c: 'Boosters' },
  { id: 'alm', n: 'Almonds', s: '1 oz', g: 6, v: 1, c: 'Boosters' },
  { id: 'quin', n: 'Quinoa, cooked', s: '1 cup', g: 8, v: 1, c: 'Boosters' },
  { id: 'oats', n: 'Rolled oats', s: '1/2 cup dry', g: 5, v: 1, c: 'Boosters' },
]

export const CATS: string[] = ['Dairy and eggs', 'Plant proteins', 'Boosters']

export const NEXTUP: string[] = ['gy', 'cc', 'tofu', 'lentils', 'edamame', 'eggs', 'whey']

export const MEALS: MealDef[] = [
  ['bf', 'Breakfast'],
  ['lu', 'Lunch'],
  ['sn', 'Snack'],
  ['pw', 'After workout'],
  ['di', 'Dinner'],
]

export const IDEAS: IdeaDef[] = [
  { m: 'Breakfast', t: 'Scrambled eggs (2) with Greek yogurt (1 cup)', g: 35 },
  { m: 'Lunch', t: 'Lentil soup (1 cup lentils) with cottage cheese (1/2 cup)', g: 30 },
  { m: 'Snack', t: 'Greek yogurt (1 cup) with almonds (1 oz)', g: 29 },
  { m: 'After workout', t: 'Protein shake (1 scoop) with milk (1 cup)', g: 32 },
  { m: 'Dinner', t: 'Tofu stir-fry (7 oz), edamame (1 cup), quinoa (1 cup)', g: 44 },
]

export const ALLEX: ExercisePlan[] = Object.values(WK).flatMap((w) => w.ex)

export function exById(id: string): ExercisePlan | null {
  return ALLEX.find((e) => e.id === id) ?? null
}

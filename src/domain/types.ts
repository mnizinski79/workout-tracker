export interface SetEntry {
  r: number | null
  d: boolean
}

export interface ExerciseEntry {
  w: number
  sets: SetEntry[]
}

export interface ProteinItem {
  id: string
  fid?: string
  n: string
  g: number
}

export interface DayRecord {
  wk?: string | null
  warm: Record<string, boolean>
  cool: boolean
  ex: Record<string, ExerciseEntry>
  bike: boolean
  sit: string
  push: string
  items: ProteinItem[]
  meals: Record<string, boolean>
  bw: string
  photos: Array<{ id: string; t: number }>
  u: number
  rowMin?: number
  walkMin?: number
  walkInc?: number
  walkSpd?: number
  bikeMin?: number
}

export interface AppData {
  days: Record<string, DayRecord>
  target: number
  targetUpdated: number
}

export interface ExercisePlan {
  id: string
  n: string
  sets: number
  lo: number
  hi: number
  w: number
  inc?: number
  nw?: boolean
  unit?: string
  note?: string
}

export interface WorkoutDay {
  name: string
  sub: string
  ex: ExercisePlan[]
}

export interface FoodItem {
  id: string
  n: string
  s: string
  g: number
  v?: 1
  c: string
}

export interface WarmItem {
  id: string
  n: string
  d: string
}

export type MealDef = [id: string, label: string]

export interface IdeaDef {
  m: string
  t: string
  g: number
}

export function blankDay(): DayRecord {
  return {
    warm: {},
    cool: false,
    ex: {},
    bike: false,
    sit: '',
    push: '',
    items: [],
    meals: {},
    bw: '',
    photos: [],
    u: 0,
  }
}

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function dateOf(k: string): Date {
  return new Date(`${k}T12:00:00`)
}

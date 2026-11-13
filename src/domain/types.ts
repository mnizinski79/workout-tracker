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
  armCount?: number
  needleCount?: number
}

export interface SavedFood {
  id: string
  n: string
  g: number
}

export interface AppData {
  days: Record<string, DayRecord>
  target: number
  targetUpdated: number
  plan?: Record<string, WorkoutDay>
  savedFoods?: SavedFood[]
  mealIdeas?: IdeaDef[]
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

// Returns the calendar date for a workout key within the current Mon–Sun week.
// 'tue'→Tuesday, 'wed'→Wednesday, 'thu'→Thursday, anything else→today.
export function weekDayDate(key: string): string {
  const today = new Date()
  const dow = today.getDay() // 0=Sun … 6=Sat
  const mondayOffset = dow === 0 ? 6 : dow - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - mondayOffset)
  const offsets: Record<string, number> = { tue: 1, wed: 2, thu: 3 }
  if (key in offsets) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + offsets[key])
    return ymd(d)
  }
  return ymd(today)
}

// Returns the workout key ('tue'|'wed'|'thu'|'rest') for a calendar date.
export function dateToWkKey(dateStr: string): 'tue' | 'wed' | 'thu' | 'rest' {
  const dow = new Date(`${dateStr}T12:00:00`).getDay()
  if (dow === 2) return 'tue'
  if (dow === 3) return 'wed'
  if (dow === 4) return 'thu'
  return 'rest'
}

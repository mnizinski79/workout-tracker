import { create } from 'zustand'
import type { AppData, DayRecord, ProteinItem, ExercisePlan, WorkoutDay, SavedFood } from '../domain/types'
import { blankDay, ymd } from '../domain/types'
import { ensureEntry, adjustSetCount as _adjustSetCount } from '../domain/progression'
import { applyDial } from '../domain/pref'
import { WK } from '../domain/plan'
import { merge } from '../domain/merge'
import { localAdapter } from '../storage/local'

function getPlanEx(plan: Record<string, WorkoutDay>, id: string): ExercisePlan | null {
  for (const wk of Object.values(plan)) {
    const ex = wk.ex.find((e) => e.id === id)
    if (ex) return ex
  }
  return null
}

export interface AppState extends AppData {
  savedFoods: SavedFood[]
  mealIdeas: import('../domain/types').IdeaDef[]
  plan: Record<string, WorkoutDay>
  setWorkoutKey(date: string, key: string): void
  toggleWarm(date: string, warmId: string, checked: boolean): void
  toggleCool(date: string, checked: boolean): void
  setReps(date: string, exId: string, setIndex: number, value: string): void
  toggleSetDone(date: string, exId: string, setIndex: number): void
  adjustWeight(date: string, exId: string, direction: 1 | -1): void
  adjustSetCount(date: string, exId: string, direction: 1 | -1): void
  adjustDial(
    date: string,
    key: keyof DayRecord,
    direction: 1 | -1,
    step: number,
    min: number,
    max: number,
  ): void
  toggleBike(date: string, checked: boolean): void
  setSitUps(date: string, value: string): void
  setPushUps(date: string, value: string): void
  addPhoto(date: string, photoId: string): void
  removePhoto(date: string, photoId: string): void
  addProteinItem(date: string, item: ProteinItem): void
  removeProteinItem(date: string, itemId: string): void
  saveFood(food: Omit<SavedFood, 'id'>): void
  removeSavedFood(id: string): void
  updateSavedFood(id: string, n: string, g: number): void
  setMealIdeas(ideas: import('../domain/types').IdeaDef[]): void
  toggleMeal(date: string, mealId: string, checked: boolean): void
  setProteinGoal(grams: number): void
  setBodyWeight(date: string, value: string): void
  updateExerciseName(wkKey: string, exId: string, name: string): void
  addExercise(wkKey: string): void
  removeExercise(wkKey: string, exId: string): void
  importData(incoming: AppData): void
  exportData(): AppData
}

function getDay(state: AppData, date: string): DayRecord {
  return state.days[date] ?? blankDay()
}

function withDay(state: AppData, date: string, fn: (d: DayRecord) => DayRecord): Partial<AppState> {
  const day = fn({ ...getDay(state, date), u: Date.now() })
  return { days: { ...state.days, [date]: day } }
}

export const useStore = create<AppState>()((set, get) => ({
  days: {},
  target: 110,
  targetUpdated: 0,
  savedFoods: [],
  mealIdeas: [],
  plan: WK,

  setWorkoutKey: (date, key) =>
    set((s) => withDay(s, date, (d) => ({ ...d, wk: key }))),

  toggleWarm: (date, warmId, checked) =>
    set((s) =>
      withDay(s, date, (d) => ({ ...d, warm: { ...d.warm, [warmId]: checked } })),
    ),

  toggleCool: (date, checked) =>
    set((s) => withDay(s, date, (d) => ({ ...d, cool: checked }))),

  setReps: (date, exId, setIndex, value) =>
    set((s) => {
      const day = getDay(s, date)
      const ex = getPlanEx(s.plan, exId)
      if (!ex) return {}
      const entry = ensureEntry(day, s.days, date, ex)
      const num = Number(value)
      const r = value === '' ? null : isNaN(num) ? entry.sets[setIndex].r : num
      const sets = entry.sets.map((st, i) => (i === setIndex ? { ...st, r } : st))
      const updated: DayRecord = {
        ...day,
        u: Date.now(),
        ex: { ...day.ex, [exId]: { ...entry, sets } },
      }
      return { days: { ...s.days, [date]: updated } }
    }),

  toggleSetDone: (date, exId, setIndex) =>
    set((s) => {
      const day = getDay(s, date)
      const ex = getPlanEx(s.plan, exId)
      if (!ex) return {}
      const entry = ensureEntry(day, s.days, date, ex)
      const set_ = entry.sets[setIndex]
      const wasD = set_.d
      const newD = !wasD
      const r = wasD ? set_.r : set_.r ?? ex.hi
      const sets = entry.sets.map((st, i) =>
        i === setIndex ? { ...st, d: newD, r } : st,
      )
      const updated: DayRecord = {
        ...day,
        u: Date.now(),
        ex: { ...day.ex, [exId]: { ...entry, sets } },
      }
      return { days: { ...s.days, [date]: updated } }
    }),

  adjustWeight: (date, exId, direction) =>
    set((s) => {
      const day = getDay(s, date)
      const ex = getPlanEx(s.plan, exId)
      if (!ex) return {}
      const entry = ensureEntry(day, s.days, date, ex)
      const inc = ex.inc ?? 5
      const w = Math.max(0, Math.round((entry.w + direction * inc) * 10) / 10)
      const updated: DayRecord = {
        ...day,
        u: Date.now(),
        ex: { ...day.ex, [exId]: { ...entry, w } },
      }
      return { days: { ...s.days, [date]: updated } }
    }),

  adjustSetCount: (date, exId, direction) =>
    set((s) => {
      const day = getDay(s, date)
      const ex = getPlanEx(s.plan, exId)
      if (!ex) return {}
      const entry = ensureEntry(day, s.days, date, ex)
      const sets = _adjustSetCount(entry.sets, direction)
      const updated: DayRecord = {
        ...day,
        u: Date.now(),
        ex: { ...day.ex, [exId]: { ...entry, sets } },
      }
      return { days: { ...s.days, [date]: updated } }
    }),

  adjustDial: (date, key, direction, step, min, max) =>
    set((s) => {
      const day = getDay(s, date)
      const current = (day[key] as number | undefined) ?? min
      return withDay(s, date, (d) => ({ ...d, [key]: applyDial(current, direction, step, min, max) }))
    }),

  toggleBike: (date, checked) =>
    set((s) => withDay(s, date, (d) => ({ ...d, bike: checked }))),

  setSitUps: (date, value) =>
    set((s) => withDay(s, date, (d) => ({ ...d, sit: value }))),

  setPushUps: (date, value) =>
    set((s) => withDay(s, date, (d) => ({ ...d, push: value }))),

  addPhoto: (date, photoId) =>
    set((s) =>
      withDay(s, date, (d) => ({
        ...d,
        photos: [...d.photos, { id: photoId, t: Date.now() }],
      })),
    ),

  removePhoto: (date, photoId) =>
    set((s) =>
      withDay(s, date, (d) => ({
        ...d,
        photos: d.photos.filter((p) => p.id !== photoId),
      })),
    ),

  addProteinItem: (date, item) =>
    set((s) => withDay(s, date, (d) => ({ ...d, items: [...d.items, item] }))),

  removeProteinItem: (date, itemId) =>
    set((s) =>
      withDay(s, date, (d) => ({
        ...d,
        items: d.items.filter((i) => i.id !== itemId),
      })),
    ),

  saveFood: ({ n, g }) =>
    set((s) => ({
      savedFoods: [...s.savedFoods, { id: `sf-${Date.now()}`, n, g }],
    })),

  removeSavedFood: (id) =>
    set((s) => ({ savedFoods: s.savedFoods.filter((f) => f.id !== id) })),

  updateSavedFood: (id, n, g) =>
    set((s) => ({
      savedFoods: s.savedFoods.map((f) => (f.id === id ? { ...f, n, g } : f)),
    })),

  setMealIdeas: (ideas) => set(() => ({ mealIdeas: ideas })),

  toggleMeal: (date, mealId, checked) =>
    set((s) =>
      withDay(s, date, (d) => ({ ...d, meals: { ...d.meals, [mealId]: checked } })),
    ),

  setProteinGoal: (grams) =>
    set(() => ({ target: grams, targetUpdated: Date.now() })),

  setBodyWeight: (date, value) =>
    set((s) => withDay(s, date, (d) => ({ ...d, bw: value }))),

  updateExerciseName: (wkKey, exId, name) =>
    set((s) => {
      const wk = s.plan[wkKey]
      if (!wk) return {}
      return { plan: { ...s.plan, [wkKey]: { ...wk, ex: wk.ex.map((e) => e.id === exId ? { ...e, n: name } : e) } } }
    }),

  addExercise: (wkKey) =>
    set((s) => {
      const wk = s.plan[wkKey]
      if (!wk) return {}
      const id = `ex-${Date.now()}`
      const ex: ExercisePlan = { id, n: 'New exercise', sets: 3, lo: 10, hi: 12, w: 0, inc: 5 }
      return { plan: { ...s.plan, [wkKey]: { ...wk, ex: [...wk.ex, ex] } } }
    }),

  removeExercise: (wkKey, exId) =>
    set((s) => {
      const wk = s.plan[wkKey]
      if (!wk) return {}
      return { plan: { ...s.plan, [wkKey]: { ...wk, ex: wk.ex.filter((e) => e.id !== exId) } } }
    }),

  importData: (incoming) =>
    set((s) => ({
      ...merge({ days: s.days, target: s.target, targetUpdated: s.targetUpdated, plan: s.plan }, incoming),
      ...(incoming.savedFoods ? { savedFoods: incoming.savedFoods } : {}),
    })),

  exportData: () => {
    const { days, target, targetUpdated, plan, savedFoods, mealIdeas } = get()
    return { days, target, targetUpdated, plan, savedFoods, mealIdeas }
  },
}))

export const useDay = (date: string) => useStore((s) => s.days[date])
export const useTarget = () => useStore((s) => s.target)

// Unused at top level but exported for components that need today's key
export { ymd }

// Storage subscription (800ms debounce)
let saveTimer: ReturnType<typeof setTimeout> | null = null
useStore.subscribe((state) => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    localAdapter.save({ days: state.days, target: state.target, targetUpdated: state.targetUpdated, plan: state.plan, savedFoods: state.savedFoods, mealIdeas: state.mealIdeas })
  }, 800)
})

// Async init: load saved data into store
localAdapter.load().then((data) => {
  useStore.setState(data)
})

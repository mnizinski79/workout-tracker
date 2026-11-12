# Lift and Protein Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the single-file `index.html` prototype into a Vite + React 18 + TypeScript PWA with pure-domain logic, a Zustand store, an IndexedDB-backed storage adapter, and four feature tabs (Today, Protein, Progress, Data).

**Architecture:** Domain logic lives in `src/domain/` with zero React imports and is unit-tested in isolation. All state is in a single Zustand store; components subscribe via selectors so unrelated state changes do not re-render inputs. A `StorageAdapter` interface decouples persistence from the store so a backend can replace `local.ts` without touching components.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Zustand 4, vite-plugin-pwa, Vitest, plain CSS

**Spec:** `docs/superpowers/specs/2026-11-11-lift-protein-tracker-design.md`

## Global Constraints

- Minimum tap target: 44 px height on all buttons and checkboxes
- CSS design tokens must use the exact variable names from the prototype (`--bg`, `--surface`, `--surface2`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-ink`, `--good`, `--good-bg`, `--display`, `--body`)
- Both light-mode defaults and dark-mode overrides (`@media (prefers-color-scheme:dark)` and `[data-theme="dark"]`) must be present
- No UI library; no component library; plain CSS only
- Rep/numeric inputs must be uncontrolled (`defaultValue`, not `value`) to prevent focus loss
- All store actions must clone before mutating — never mutate a loaded object reference
- Photo blobs resized to max 1600 px JPEG at quality 0.82 before storing
- Storage save debounced 800 ms
- Set count clamped to 1–8
- Protein goal valid range 20–400 g
- Body weight stored as string (empty string = not entered)
- `lpl-v1` is the localStorage key
- All six fonts/weights must load from Google Fonts: `Barlow:wght@400;500;600` and `Barlow+Condensed:wght@600;700`

## Review Focus

1. **Prototype data with no `.u` field on a day record**: `merge()` must treat a missing `u` as `0` so older exported data doesn't silently lose all days to the newer side.
2. **Weight stepper at bodyweight (w: 0)**: adjusting down from 0 must not produce a negative weight; clamp at 0.
3. **Rep input with non-numeric characters**: `setReps` must leave the previous value unchanged on a non-numeric input string; it must not write `NaN` to the store.
4. **Photo whose blob has been deleted externally from IndexedDB**: `loadBlob` returns null; the `usePhotoUrl` hook must render a broken-image placeholder rather than crash.
5. **Date navigation past today**: the next-day button must be `disabled` and have `aria-disabled="true"` when `currentDate === ymd(new Date())`; navigating forward is a no-op.

---

## File Map

```
src/
  domain/
    types.ts            — DayRecord, ExercisePlan, WorkoutDay, ProteinItem, SetEntry, AppData, blankDay()
    plan.ts             — WK, WARM, FOODS, CATS, MEALS, IDEAS, NEXTUP, ALLEX, exById()
    progression.ts      — lastSess(), sugg(), ensureEntry(), adjustSetCount()
    pref.ts             — pref(), applyDial()
    protein.ts          — protTotal(), nextUp(), summaryText()
    stats.ts            — last14(), didLift(), didBike(), hitProtein()
    merge.ts            — merge()
    __tests__/
      progression.test.ts
      pref.test.ts
      protein.test.ts
      merge.test.ts
  storage/
    adapter.ts          — StorageAdapter interface
    local.ts            — localStorage (AppData) + IndexedDB (blobs)
  store/
    index.ts            — Zustand store, all actions, storage subscription
  hooks/
    usePhotoUrl.ts      — loads blob from adapter, creates/revokes object URL
  components/
    today/
      Today.tsx
      ExerciseCard.tsx
      SetGrid.tsx
      WarmUpSection.tsx
      CoolDownSection.tsx
      EveryDaySection.tsx
      PhotoCard.tsx
    protein/
      Protein.tsx
      FoodList.tsx
      MealChecks.tsx
      CustomEntry.tsx
      MealIdeas.tsx
    progress/
      Progress.tsx
      DotGrid.tsx
      SparkLine.tsx
      BodyWeightChart.tsx
      PhotoGallery.tsx
    data/
      Data.tsx
    shared/
      Stepper.tsx
      Header.tsx
      DateNav.tsx
      Tabs.tsx
      Toast.tsx
      PhotoViewer.tsx
  App.tsx
  main.tsx
  index.css
public/
  icons/
    icon-192.png
    icon-512.png
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`
- Create: `src/main.tsx` (skeleton only — renders `<App />`)
- Create: `src/App.tsx` (skeleton — returns `<div>Lift Log</div>`)
- Create: `src/index.css` (empty file, imported in main.tsx)
- Create: all empty placeholder directories from the File Map

**Interfaces:**
- Produces: a Vite dev server that serves a React app at `localhost:5173`

- [ ] **Step 1: Scaffold with Vite**

```bash
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install zustand
npm install -D vite-plugin-pwa workbox-window
```

- [ ] **Step 3: Install test dependencies**

```bash
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/jest-dom
```

- [ ] **Step 4: Configure Vitest in `vite.config.ts`**

Add to the Vite config object:
```typescript
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test-setup.ts'],
}
```
Create `src/test-setup.ts` that imports `@testing-library/jest-dom`.

- [ ] **Step 5: Add test script to `package.json`**

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Create the directory tree**

Create all empty directories listed in the File Map (a `.gitkeep` in each leaf directory is fine).

- [ ] **Step 7: Wire skeleton `main.tsx` and `App.tsx`**

`main.tsx` renders `<App />` into `#root`. `App.tsx` returns `<p>Lift Log</p>`. `index.css` is imported in `main.tsx`.

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```
Expected: browser shows "Lift Log" at `localhost:5173`

- [ ] **Step 9: Verify test runner works**

```bash
npm test
```
Expected: "No test files found" (zero failures)

- [ ] **Step 10: Git init and first commit**

```bash
git init
echo "node_modules\ndist\n.env" > .gitignore
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript project"
```

---

## Task 2: Domain Types and Plan Data

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/plan.ts`

**Interfaces:**
- Produces: `DayRecord`, `ExercisePlan`, `WorkoutDay`, `ProteinItem`, `SetEntry`, `AppData`, `FoodItem`, `WarmItem`, `MealDef`, `IdeaDef` (all used by every subsequent task)
- Produces: `WK`, `WARM`, `FOODS`, `CATS`, `MEALS`, `IDEAS`, `NEXTUP`, `ALLEX`, `exById(id: string): ExercisePlan | null`

- [ ] **Step 1: Write `src/domain/types.ts`**

Exact interfaces:
```typescript
export interface SetEntry { r: number | null; d: boolean; }

export interface ExerciseEntry { w: number; sets: SetEntry[]; }

export interface ProteinItem { id: string; fid?: string; n: string; g: number; }

export interface DayRecord {
  wk?: string | null;
  warm: Record<string, boolean>;
  cool: boolean;
  ex: Record<string, ExerciseEntry>;
  bike: boolean;
  sit: string;
  push: string;
  items: ProteinItem[];
  meals: Record<string, boolean>;
  bw: string;
  photos: Array<{ id: string; t: number }>;
  u: number;
  rowMin?: number;
  walkMin?: number;
  walkInc?: number;
  walkSpd?: number;
  bikeMin?: number;
}

export interface AppData {
  days: Record<string, DayRecord>;
  target: number;
  targetUpdated: number;
}

export interface ExercisePlan {
  id: string; n: string; sets: number; lo: number; hi: number;
  w: number; inc?: number; nw?: boolean; unit?: string; note?: string;
}

export interface WorkoutDay { name: string; sub: string; ex: ExercisePlan[]; }

export interface FoodItem { id: string; n: string; s: string; g: number; v?: 1; c: string; }

export interface WarmItem { id: string; n: string; d: string; }

export type MealDef = [id: string, label: string];

export interface IdeaDef { m: string; t: string; g: number; }
```

Also export:
```typescript
export function blankDay(): DayRecord {
  return {
    warm: {}, cool: false, ex: {}, bike: false,
    sit: '', push: '', items: [], meals: {}, bw: '', photos: [], u: 0
  };
}

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function dateOf(k: string): Date {
  return new Date(`${k}T12:00:00`);
}
```

- [ ] **Step 2: Write `src/domain/plan.ts`**

Copy `WK`, `WARM`, `FOODS`, `CATS`, `MEALS`, `IDEAS`, `NEXTUP` verbatim from the prototype, typed with the interfaces above. Derive:
```typescript
export const ALLEX: ExercisePlan[] = Object.values(WK).flatMap(w => w.ex);
export function exById(id: string): ExercisePlan | null {
  return ALLEX.find(e => e.id === id) ?? null;
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: zero errors

- [ ] **Step 4: Commit**

```bash
git add src/domain/types.ts src/domain/plan.ts
git commit -m "feat: domain types and static plan data"
```

---

## Task 3: Progression Domain

**Files:**
- Create: `src/domain/progression.ts`
- Create: `src/domain/__tests__/progression.test.ts`

**Interfaces:**
- Consumes: `DayRecord`, `ExercisePlan`, `SetEntry`, `ExerciseEntry`, `AppData` from `types.ts`; `blankDay()` from `types.ts`
- Produces:
  ```typescript
  lastSess(days: Record<string,DayRecord>, beforeDate: string, exId: string)
    : { date: string; w: number; sets: SetEntry[] } | null

  sugg(days: Record<string,DayRecord>, date: string, exercise: ExercisePlan)
    : { w: number; up: boolean; last: ReturnType<typeof lastSess> }

  ensureEntry(day: DayRecord, days: Record<string,DayRecord>, date: string, exercise: ExercisePlan)
    : ExerciseEntry  // returns existing entry OR a new default; never mutates day

  adjustSetCount(sets: SetEntry[], direction: 1 | -1): SetEntry[]
    // clamps 1–8; appends {r:null,d:false} on +1; slices off last on −1
  ```

- [ ] **Step 1: Write failing tests**

```typescript
// src/domain/__tests__/progression.test.ts
import { describe, it, expect } from 'vitest';
import { blankDay } from '../types';
import { lastSess, sugg, ensureEntry, adjustSetCount } from '../progression';

const curl = { id:'curl', n:'Bicep curls', sets:3, lo:12, hi:15, w:20, inc:5 };
const plank = { id:'plank', n:'Plank', sets:3, lo:30, hi:45, w:0, nw:true as const, unit:'sec' };

describe('lastSess', () => {
  it('returns null when no history', () => {
    expect(lastSess({}, '2026-01-02', 'curl')).toBeNull();
  });
  it('returns null when no sets are marked done', () => {
    const days = { '2026-01-01': { ...blankDay(), ex: { curl: { w:20, sets:[{r:12,d:false}] } } } };
    expect(lastSess(days, '2026-01-02', 'curl')).toBeNull();
  });
  it('finds most recent session with a done set', () => {
    const days = {
      '2026-01-01': { ...blankDay(), ex: { curl: { w:20, sets:[{r:15,d:true}] } } },
      '2026-01-03': { ...blankDay(), ex: { curl: { w:25, sets:[{r:14,d:true}] } } },
    };
    expect(lastSess(days, '2026-01-04', 'curl')?.w).toBe(25);
  });
  it('does not look at the current date', () => {
    const days = { '2026-01-02': { ...blankDay(), ex: { curl: { w:25, sets:[{r:15,d:true}] } } } };
    expect(lastSess(days, '2026-01-02', 'curl')).toBeNull();
  });
});

describe('sugg', () => {
  it('returns plan default weight with no history', () => {
    expect(sugg({}, '2026-01-01', curl)).toEqual({ w:20, up:false, last:null });
  });
  it('bumps weight when every done set >= hi', () => {
    const days = { '2026-01-01': { ...blankDay(), ex: { curl: { w:20, sets:[{r:15,d:true},{r:15,d:true},{r:16,d:true}] } } } };
    const r = sugg(days, '2026-01-02', curl);
    expect(r.w).toBe(25);
    expect(r.up).toBe(true);
  });
  it('does not bump when some done sets < hi', () => {
    const days = { '2026-01-01': { ...blankDay(), ex: { curl: { w:20, sets:[{r:15,d:true},{r:12,d:true},{r:15,d:true}] } } } };
    const r = sugg(days, '2026-01-02', curl);
    expect(r.w).toBe(20);
    expect(r.up).toBe(false);
  });
  it('does not bump nw:true exercises', () => {
    const days = { '2026-01-01': { ...blankDay(), ex: { plank: { w:0, sets:[{r:45,d:true},{r:45,d:true},{r:45,d:true}] } } } };
    expect(sugg(days, '2026-01-02', plank).up).toBe(false);
  });
  it('does not bump when last session has undone sets', () => {
    const days = { '2026-01-01': { ...blankDay(), ex: { curl: { w:20, sets:[{r:15,d:true},{r:null,d:false}] } } } };
    expect(sugg(days, '2026-01-02', curl).up).toBe(false);
  });
});

describe('ensureEntry', () => {
  it('returns existing entry without mutation', () => {
    const entry = { w:25, sets:[{r:14,d:true}] };
    const day = { ...blankDay(), ex: { curl: entry } };
    const result = ensureEntry(day, {}, '2026-01-01', curl);
    expect(result).toBe(entry); // same reference — not cloned
    expect(day.ex.curl).toBe(entry); // day not mutated
  });
  it('returns new default entry when none exists', () => {
    const day = blankDay();
    const result = ensureEntry(day, {}, '2026-01-01', curl);
    expect(result.sets).toHaveLength(3); // curl.sets === 3
    expect(result.w).toBe(20);           // curl.w === 20 (no history)
    expect(day.ex).toEqual({});          // day not mutated
  });
});

describe('adjustSetCount', () => {
  const base = [{r:null,d:false},{r:null,d:false},{r:null,d:false}];
  it('adds a set', () => {
    expect(adjustSetCount(base, 1)).toHaveLength(4);
  });
  it('removes a set', () => {
    expect(adjustSetCount(base, -1)).toHaveLength(2);
  });
  it('clamps at 8', () => {
    const eight = Array.from({length:8}, () => ({r:null,d:false}));
    expect(adjustSetCount(eight, 1)).toHaveLength(8);
  });
  it('clamps at 1', () => {
    const one = [{r:null,d:false}];
    expect(adjustSetCount(one, -1)).toHaveLength(1);
  });
  it('new set appended is {r:null,d:false}', () => {
    const result = adjustSetCount(base, 1);
    expect(result[3]).toEqual({r:null,d:false});
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test src/domain/__tests__/progression.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/domain/progression.ts`**

Implement all four exported functions. Key rule for `sugg`: bump fires only when `!exercise.nw && !!exercise.inc` AND every element of `last.sets` satisfies `s.d && Number(s.r) >= exercise.hi`. Key rule for `ensureEntry`: return `day.ex[exercise.id]` if it exists (unchanged), else return `{ w: sugg(days, date, exercise).w, sets: Array.from({length: exercise.sets}, () => ({r:null,d:false})) }`. Do not write to `day`.

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test src/domain/__tests__/progression.test.ts
```
Expected: all 13 assertions PASS

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: zero errors

- [ ] **Step 6: Commit**

```bash
git add src/domain/progression.ts src/domain/__tests__/progression.test.ts
git commit -m "feat: progression domain logic with tests"
```

---

## Task 4: Pref and Dial Domain

**Files:**
- Create: `src/domain/pref.ts`
- Create: `src/domain/__tests__/pref.test.ts`

**Interfaces:**
- Consumes: `DayRecord` from `types.ts`; `blankDay()` from `types.ts`
- Produces:
  ```typescript
  pref(days: Record<string,DayRecord>, date: string, key: keyof DayRecord, def: number): number
  // Walks days backwards from (not including) date; returns first non-null value for key; falls back to def.

  applyDial(current: number, direction: 1|-1, step: number, min: number, max: number): number
  // Returns Math.round((clamped result) * 10) / 10 to avoid floating-point drift.
  ```

- [ ] **Step 1: Write failing tests**

```typescript
// src/domain/__tests__/pref.test.ts
import { describe, it, expect } from 'vitest';
import { blankDay } from '../types';
import { pref, applyDial } from '../pref';

describe('pref', () => {
  it('returns current-day value when present', () => {
    const days = { '2026-01-02': { ...blankDay(), walkMin: 20 } };
    expect(pref(days, '2026-01-02', 'walkMin', 15)).toBe(20);
  });
  it('falls back to previous day when current-day lacks the key', () => {
    const days = { '2026-01-01': { ...blankDay(), bikeMin: 45 } };
    expect(pref(days, '2026-01-02', 'bikeMin', 30)).toBe(45);
  });
  it('returns default when no history', () => {
    expect(pref({}, '2026-01-01', 'rowMin', 2)).toBe(2);
  });
  it('skips days where key is null/undefined', () => {
    const days = {
      '2026-01-01': blankDay(),
      '2026-01-02': { ...blankDay(), walkMin: 25 },
    };
    expect(pref(days, '2026-01-03', 'walkMin', 15)).toBe(25);
  });
});

describe('applyDial', () => {
  it('increments by step', () => {
    expect(applyDial(2, 1, 1, 1, 10)).toBe(3);
  });
  it('decrements by step', () => {
    expect(applyDial(5, -1, 1, 1, 10)).toBe(4);
  });
  it('clamps at max', () => {
    expect(applyDial(15, 1, 1, 0, 15)).toBe(15);
  });
  it('clamps at min', () => {
    expect(applyDial(0, -1, 1, 0, 15)).toBe(0);
  });
  it('rounds to avoid floating-point drift (0.1 steps)', () => {
    expect(applyDial(2.0, 1, 0.1, 0.5, 6)).toBe(2.1);
    expect(applyDial(0.5, -1, 0.1, 0.5, 6)).toBe(0.5);
  });
});
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npm test src/domain/__tests__/pref.test.ts
```

- [ ] **Step 3: Implement `src/domain/pref.ts`**

`pref`: sort days keys descending, filter to those ≤ date, iterate until `days[k][key] != null`, return that value. `applyDial`: compute `Math.min(max, Math.max(min, current + direction * step))`, then `Math.round(result * 10) / 10`.

- [ ] **Step 4: Run to verify PASS**

```bash
npm test src/domain/__tests__/pref.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/domain/pref.ts src/domain/__tests__/pref.test.ts
git commit -m "feat: pref and dial domain logic with tests"
```

---

## Task 5: Protein Domain

**Files:**
- Create: `src/domain/protein.ts`
- Create: `src/domain/__tests__/protein.test.ts`

**Interfaces:**
- Consumes: `DayRecord`, `ProteinItem`, `AppData`, `dateOf()`, `ymd()` from `types.ts`; `FOODS`, `NEXTUP`, `WK`, `MEALS` from `plan.ts`; `pref()` from `pref.ts`; `blankDay()` from `types.ts`
- Produces:
  ```typescript
  protTotal(day: DayRecord): number
  nextUp(day: DayRecord): FoodItem[]       // ≤3 items from NEXTUP not yet in day.items by fid
  summaryText(days: Record<string,DayRecord>, date: string, target: number): string
  ```

- [ ] **Step 1: Write failing tests**

```typescript
// src/domain/__tests__/protein.test.ts
import { describe, it, expect } from 'vitest';
import { blankDay } from '../types';
import { protTotal, nextUp } from '../protein';

describe('protTotal', () => {
  it('returns 0 for empty items', () => {
    expect(protTotal(blankDay())).toBe(0);
  });
  it('sums integer grams', () => {
    const day = { ...blankDay(), items: [{ id:'1', n:'Greek yogurt', g:23 }, { id:'2', n:'Eggs', g:12 }] };
    expect(protTotal(day)).toBe(35);
  });
  it('sums decimal grams', () => {
    const day = { ...blankDay(), items: [{ id:'1', n:'Custom', g:7.5 }, { id:'2', n:'Custom2', g:2.5 }] };
    expect(protTotal(day)).toBe(10);
  });
  it('ignores non-numeric g values', () => {
    const day = { ...blankDay(), items: [{ id:'1', n:'x', g:NaN }, { id:'2', n:'y', g:10 }] };
    expect(protTotal(day)).toBe(10);
  });
});

describe('nextUp', () => {
  it('returns first 3 from NEXTUP when nothing logged', () => {
    // NEXTUP = ['gy','cc','tofu','lentils','edamame','eggs','whey']
    const result = nextUp(blankDay());
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('gy');
    expect(result[1].id).toBe('cc');
    expect(result[2].id).toBe('tofu');
  });
  it('skips already-logged fids', () => {
    const day = { ...blankDay(), items: [{ id:'x', fid:'gy', n:'Greek yogurt', g:23 }] };
    const result = nextUp(day);
    expect(result[0].id).toBe('cc');
    expect(result).toHaveLength(3);
  });
  it('returns fewer than 3 when most are logged', () => {
    const fids = ['gy','cc','tofu','lentils','edamame','eggs','whey'];
    const items = fids.map((fid,i) => ({ id:String(i), fid, n:'x', g:10 }));
    expect(nextUp({ ...blankDay(), items })).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npm test src/domain/__tests__/protein.test.ts
```

- [ ] **Step 3: Implement `src/domain/protein.ts`**

`protTotal`: `day.items.reduce((a,b) => a + (Number(b.g) || 0), 0)`. `nextUp`: collect `fid` values already in `day.items`, filter `NEXTUP` to those not in that set, map to `FoodItem` via `FOODS`, return first 3. `summaryText`: rebuild the multi-line check-in text from the prototype's `summaryText()` function, using `pref()` for dial values.

- [ ] **Step 4: Run to verify PASS**

```bash
npm test src/domain/__tests__/protein.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/domain/protein.ts src/domain/__tests__/protein.test.ts
git commit -m "feat: protein domain logic with tests"
```

---

## Task 6: Stats and Merge Domain

**Files:**
- Create: `src/domain/stats.ts`
- Create: `src/domain/merge.ts`
- Create: `src/domain/__tests__/merge.test.ts`

**Interfaces:**
- Consumes: `DayRecord`, `AppData`, `blankDay()` from `types.ts`; `protTotal()` from `protein.ts`
- Produces:
  ```typescript
  // stats.ts
  last14(date: string): string[]    // 14 YYYY-MM-DD keys ending on date, oldest first
  didLift(day: DayRecord | undefined): boolean
  didBike(day: DayRecord | undefined): boolean
  hitProtein(day: DayRecord | undefined, target: number): boolean

  // merge.ts
  merge(current: AppData, incoming: AppData): AppData
  // Returns new object; never mutates either input.
  // Per-day: record with larger .u wins (treat missing u as 0).
  // target: side with larger targetUpdated wins.
  ```

- [ ] **Step 1: Write failing merge tests**

```typescript
// src/domain/__tests__/merge.test.ts
import { describe, it, expect } from 'vitest';
import { blankDay } from '../types';
import { merge } from '../merge';

const base = (extra: object = {}) => ({ days: {}, target: 110, targetUpdated: 0, ...extra });

describe('merge', () => {
  it('local day wins when local.u > remote.u', () => {
    const local = base({ days: { '2026-01-01': { ...blankDay(), u:200, sit:'50' } } });
    const remote = base({ days: { '2026-01-01': { ...blankDay(), u:100, sit:'30' } } });
    expect(merge(local, remote).days['2026-01-01'].sit).toBe('50');
  });
  it('remote day wins when remote.u > local.u', () => {
    const local = base({ days: { '2026-01-01': { ...blankDay(), u:100, sit:'30' } } });
    const remote = base({ days: { '2026-01-01': { ...blankDay(), u:200, sit:'50' } } });
    expect(merge(local, remote).days['2026-01-01'].sit).toBe('50');
  });
  it('preserves days only in local', () => {
    const local = base({ days: { '2026-01-01': { ...blankDay(), u:100 } } });
    expect(merge(local, base()).days['2026-01-01']).toBeDefined();
  });
  it('adds days only in remote', () => {
    const remote = base({ days: { '2026-01-02': { ...blankDay(), u:100 } } });
    expect(merge(base(), remote).days['2026-01-02']).toBeDefined();
  });
  it('treats missing .u as 0', () => {
    const local = base({ days: { '2026-01-01': { ...blankDay(), sit:'new' } } }); // no u
    const remote = base({ days: { '2026-01-01': { ...blankDay(), u:1, sit:'old' } } });
    // remote.u (1) > local.u (0), so remote wins
    expect(merge(local, remote).days['2026-01-01'].sit).toBe('old');
  });
  it('local target wins when local.targetUpdated is larger', () => {
    const local = base({ target:130, targetUpdated:200 });
    const remote = base({ target:110, targetUpdated:100 });
    expect(merge(local, remote).target).toBe(130);
  });
  it('remote target wins when remote.targetUpdated is larger', () => {
    const local = base({ target:110, targetUpdated:100 });
    const remote = base({ target:140, targetUpdated:300 });
    expect(merge(local, remote).target).toBe(140);
  });
  it('does not mutate either input', () => {
    const local = base({ days: { '2026-01-01': { ...blankDay(), u:100 } } });
    const remote = base({ days: { '2026-01-02': { ...blankDay(), u:200 } } });
    merge(local, remote);
    expect(Object.keys(local.days)).toHaveLength(1);
    expect(Object.keys(remote.days)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npm test src/domain/__tests__/merge.test.ts
```

- [ ] **Step 3: Implement `src/domain/stats.ts`**

`last14`: `Array.from({length:14}, (_,i) => { const d = new Date(date+'T12:00:00'); d.setDate(d.getDate()-(13-i)); return ymd(d); })`. `didLift`: check if any `ex` entry has a done set. `didBike`: `day?.bike === true`. `hitProtein`: `protTotal(day) >= target`.

- [ ] **Step 4: Implement `src/domain/merge.ts`**

Build merged days by iterating all keys from both inputs; for each key, pick the record with the larger `u` (treat `undefined` as `0`). Pick target from whichever side has the larger `targetUpdated`. Return `{ days: mergedDays, target, targetUpdated: Math.max(current.targetUpdated, incoming.targetUpdated) }`.

- [ ] **Step 5: Run merge tests to verify PASS**

```bash
npm test src/domain/__tests__/merge.test.ts
```

- [ ] **Step 6: Run all domain tests together**

```bash
npm test src/domain/
```
Expected: all tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/domain/stats.ts src/domain/merge.ts src/domain/__tests__/merge.test.ts
git commit -m "feat: stats and merge domain logic with tests"
```

---

## Task 7: Storage Adapter

**Files:**
- Create: `src/storage/adapter.ts`
- Create: `src/storage/local.ts`

**Interfaces:**
- Produces:
  ```typescript
  // adapter.ts
  export interface StorageAdapter {
    load(): Promise<AppData>;
    save(data: AppData): Promise<void>;
    loadBlob(id: string): Promise<Blob | null>;
    saveBlob(id: string, blob: Blob): Promise<void>;
    deleteBlob(id: string): Promise<void>;
  }
  ```
- Produces: `localAdapter: StorageAdapter` (singleton exported from `local.ts`)

- [ ] **Step 1: Write `src/storage/adapter.ts`**

Interface only, as shown above.

- [ ] **Step 2: Implement `src/storage/local.ts`**

`load`: `JSON.parse(JSON.stringify(JSON.parse(localStorage.getItem('lpl-v1') || 'null')))` to deep-clone on read. If `null` or malformed, return `{ days:{}, target:110, targetUpdated:0 }`. `save`: `localStorage.setItem('lpl-v1', JSON.stringify(data))`. `loadBlob` / `saveBlob` / `deleteBlob`: open IndexedDB named `lpl-blobs` with object store `blobs` (keyPath `id`). `saveBlob` stores `{id, blob}`. `loadBlob` returns the blob field or `null`. `deleteBlob` removes the record by id.

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: zero errors

- [ ] **Step 4: Commit**

```bash
git add src/storage/adapter.ts src/storage/local.ts
git commit -m "feat: storage adapter interface and localStorage + IndexedDB implementation"
```

---

## Task 8: Zustand Store

**Files:**
- Create: `src/store/index.ts`

**Interfaces:**
- Consumes: `AppData`, `DayRecord`, `blankDay()`, `ymd()` from `types.ts`; `ensureEntry()`, `adjustSetCount()` from `progression.ts`; `applyDial()` from `pref.ts`; `localAdapter` from `storage/local.ts`; `merge()` from `merge.ts`
- Produces:
  ```typescript
  export const useStore: UseBoundStore<StoreApi<AppState>>

  // Selectors (re-export these named functions):
  export const useDay = (date: string) => useStore(s => s.days[date])
  export const useTarget = () => useStore(s => s.target)
  ```

- [ ] **Step 1: Write `src/store/index.ts`**

Store state shape:
```typescript
interface AppState extends AppData {
  // All actions:
  setWorkoutKey(date: string, key: string): void;
  toggleWarm(date: string, warmId: string, checked: boolean): void;
  toggleCool(date: string, checked: boolean): void;
  setReps(date: string, exId: string, setIndex: number, value: string): void;
  toggleSetDone(date: string, exId: string, setIndex: number): void;
  adjustWeight(date: string, exId: string, direction: 1|-1): void;
  adjustSetCount(date: string, exId: string, direction: 1|-1): void;
  adjustDial(date: string, key: keyof DayRecord, direction: 1|-1, step: number, min: number, max: number): void;
  toggleBike(date: string, checked: boolean): void;
  setSitUps(date: string, value: string): void;
  setPushUps(date: string, value: string): void;
  addPhoto(date: string, photoId: string): void;
  removePhoto(date: string, photoId: string): void;
  addProteinItem(date: string, item: ProteinItem): void;
  removeProteinItem(date: string, itemId: string): void;
  toggleMeal(date: string, mealId: string, checked: boolean): void;
  setProteinGoal(grams: number): void;
  setBodyWeight(date: string, value: string): void;
  importData(incoming: AppData): void;
  exportData(): AppData;
}
```

Initialize by calling `localAdapter.load()` synchronously (use `localStorage.getItem` directly for the sync init pattern that Zustand supports with `getState()`). Alternatively, initialize with defaults and load asynchronously in `main.tsx` before first render.

**Pattern for every action that mutates a day:** clone the day before modifying:
```typescript
setWorkoutKey: (date, key) => set(s => {
  const day = { ...(s.days[date] ?? blankDay()), wk: key, u: Date.now() };
  return { days: { ...s.days, [date]: day } };
}),
```

**`setReps`**: parse value with `Number(value)`; if `isNaN`, leave `s.r` unchanged. Store `null` for empty string; store the number otherwise.

**`toggleSetDone`**: read the current rep input value from the set entry (`s.r`); if set is not done, set `d: true` and if `r` is null set `r: exercise.hi`; if already done, set `d: false`.

**`adjustWeight`**: floor at 0: `Math.max(0, Math.round((entry.w + direction * (exercise.inc ?? 5)) * 10) / 10)`.

**Storage subscription:** after `create(...)`, add:
```typescript
let saveTimer: ReturnType<typeof setTimeout> | null = null;
useStore.subscribe(state => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localAdapter.save({ days: state.days, target: state.target, targetUpdated: state.targetUpdated });
  }, 800);
});
```

**`importData`**: `set(s => merge({ days:s.days, target:s.target, targetUpdated:s.targetUpdated }, incoming))`.

**`exportData`**: `return { days: get().days, target: get().target, targetUpdated: get().targetUpdated }`.

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add src/store/index.ts
git commit -m "feat: Zustand store with all actions and storage subscription"
```

---

## Task 9: CSS Design System

**Files:**
- Modify: `src/index.css` (replace skeleton)

**Interfaces:**
- Produces: all design tokens and utility classes needed by every component in Tasks 10–14

- [ ] **Step 1: Port `index.css` from the prototype**

Copy the entire `<style>` block from `index.html` verbatim into `src/index.css`, converting it to plain CSS. Update the Google Fonts `<link>` tags into `@import` statements at the top of the file:
```css
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap');
```

Move the `<link rel="preconnect">` tags into `index.html`'s `<head>`.

- [ ] **Step 2: Verify dark mode tokens**

Confirm both `@media (prefers-color-scheme:dark) :root:not([data-theme="light"])` and `:root[data-theme="dark"]` blocks are present with the correct token values:
- `--bg:#111514` `--surface:#1a2120` `--surface2:#242d2b` `--ink:#e8eeeb` `--muted:#9aa8a3` `--line:#2c3633` `--accent:#f08a58` `--accent-ink:#1b1209` `--good:#5cc58a` `--good-bg:#1c3828`

- [ ] **Step 3: Commit**

```bash
git add src/index.css index.html
git commit -m "feat: port design tokens and utility classes from prototype"
```

---

## Task 10: Shared Components

**Files:**
- Create: `src/hooks/usePhotoUrl.ts`
- Create: `src/components/shared/Stepper.tsx`
- Create: `src/components/shared/Tabs.tsx`
- Create: `src/components/shared/Header.tsx`
- Create: `src/components/shared/DateNav.tsx`
- Create: `src/components/shared/Toast.tsx`
- Create: `src/components/shared/PhotoViewer.tsx`

**Interfaces:**
- Consumes: `localAdapter` from `storage/local.ts`; `useStore` from `store/index.ts`; `ymd()`, `dateOf()` from `types.ts`
- Produces:
  ```typescript
  usePhotoUrl(id: string): string | null
  // Loads blob from localAdapter, creates object URL, revokes on unmount or id change.
  // Returns null while loading or if blob not found.

  <Stepper value={number} onDecrement={()=>void} onIncrement={()=>void}
    label={string} min={number} max={number} />
  // Decrement button disabled when value <= min; increment disabled when value >= max.
  // Both buttons are 44px minimum height.

  <Tabs active={'today'|'protein'|'progress'|'data'} onChange={(tab)=>void} />
  // Four tabs: Today, Protein, Progress, Data
  // Active tab: aria-current="page"; inactive: aria-current="false"

  <Header />
  // Shows "Lift and Protein Log" kicker and sync status ("On this device")

  <DateNav date={string} onPrev={()=>void} onNext={()=>void} onToday={()=>void} />
  // Prev/next are <button class="ib">; next is disabled + aria-disabled when date === today
  // "Back to today" link hidden when date === today

  <Toast />
  // Subscribes to a toast atom (a simple module-level signal, not in Zustand):
  // export function showToast(message: string): void
  // Toast renders a fixed div; visible for 2000ms then hides.

  <PhotoViewer
    photoId={string|null}
    date={string|null}
    onClose={()=>void}
    onDelete={(photoId: string, date: string) => void}
  />
  // role="dialog" aria-modal="true" aria-label="Session photo"
  // Two-tap delete: first tap shows "Tap again to delete", second calls onDelete
  // Escape key calls onClose
  // Handles null photoId by rendering nothing
  ```

- [ ] **Step 1: Implement `usePhotoUrl`**

```typescript
export function usePhotoUrl(id: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    localAdapter.loadBlob(id).then(blob => {
      if (blob && active) setUrl(URL.createObjectURL(blob));
    });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);
  return url;
}
```

- [ ] **Step 2: Implement `Stepper.tsx`**

```tsx
<div className="stepper">
  <button onClick={onDecrement} disabled={value <= min} aria-label={`Decrease ${label}`}>−</button>
  <output>{value}</output>
  <button onClick={onIncrement} disabled={value >= max} aria-label={`Increase ${label}`}>+</button>
</div>
```

- [ ] **Step 3: Implement `Toast.tsx` and toast signal**

Create `src/lib/toast.ts` with:
```typescript
let listeners: Array<(msg: string) => void> = [];
export function showToast(msg: string) { listeners.forEach(l => l(msg)); }
export function subscribeToast(fn: (msg: string) => void) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}
```
`Toast.tsx` calls `subscribeToast` in a `useEffect`, shows the message for 2000 ms then clears.

- [ ] **Step 4: Implement remaining shared components**

Implement `Tabs`, `Header`, `DateNav`, `PhotoViewer` following their signatures above.

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/ src/components/shared/ src/lib/
git commit -m "feat: shared components (Stepper, Tabs, Header, DateNav, Toast, PhotoViewer)"
```

---

## Task 11: Today Tab

**Files:**
- Create: `src/components/today/Today.tsx`
- Create: `src/components/today/ExerciseCard.tsx`
- Create: `src/components/today/SetGrid.tsx`
- Create: `src/components/today/WarmUpSection.tsx`
- Create: `src/components/today/CoolDownSection.tsx`
- Create: `src/components/today/EveryDaySection.tsx`
- Create: `src/components/today/PhotoCard.tsx`

**Interfaces:**
- Consumes: `useStore` from `store/index.ts`; `Stepper` from `shared/Stepper.tsx`; `showToast` from `lib/toast.ts`; `usePhotoUrl` from `hooks/usePhotoUrl.ts`; `localAdapter` from `storage/local.ts`; all domain functions; `WK`, `WARM`, `exById()` from `plan.ts`; `pref()` from `pref.ts`; `sugg()`, `ensureEntry()` from `progression.ts`; `protTotal()`, `nextUp()` from `protein.ts`

**Key implementation notes:**

**`ExerciseCard`** subscribes via `useStore(s => s.days[date]?.ex[exercise.id])` — no other exercises cause a re-render of this card.

**`SetGrid`**: each rep input uses `defaultValue={set.r ?? ''}` and `onChange` calls `setReps`. The done toggle reads the DOM input value directly (`document.getElementById(inputId)?.value`) before calling `toggleSetDone` so an unsaved rep is captured.

**`PhotoCard`**: "Add photo" triggers a hidden `<input type="file" multiple accept="image/*">`. On change, for each file: (1) resize via canvas to max 1600 px JPEG at 0.82 quality, (2) `localAdapter.saveBlob(id, blob)`, (3) `store.addPhoto(date, id)`, (4) `showToast(...)`.

**Photo resize utility** (`src/lib/resizePhoto.ts`):
```typescript
export function resizePhoto(file: File): Promise<Blob> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b => resolve(b ?? file), 'image/jpeg', 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}
```

**`WarmUpSection`** renders the warm-up checkboxes and the rowing-time dial (`rowMin`, default 2, step 1, min 1, max 10, unit 'min').

**`CoolDownSection`** renders the cool-down checkbox and three dials: `walkMin` (default 15, step 5, min 5, max 60), `walkInc` (default 15, step 1, min 0, max 15), `walkSpd` (default 2, step 0.1, min 0.5, max 6, unit 'mph').

**`EveryDaySection`** renders the bike checkbox (`bikeMin` dial), sit-ups input, push-ups input (both uncontrolled).

**`Today`** renders in order: workout-type segmented control, session summary card (name + set progress bar), protein nudge card, warm-up section (if workout day), exercise cards (if workout day), cool-down section (if workout day), photo card, every-day section.

- [ ] **Step 1: Implement `src/lib/resizePhoto.ts`**

As shown above.

- [ ] **Step 2: Implement `SetGrid.tsx`**

Each cell: `<label htmlFor={id}>Set {i+1}</label>`, uncontrolled `<input className="reps" id={id} type="text" inputMode="numeric" defaultValue={set.r ?? ''} onChange={...}>`, done toggle `<button className={`chk${set.d?' on':''}`} aria-pressed={set.d} onClick={...}>`.

- [ ] **Step 3: Implement `ExerciseCard.tsx`**

Subscribes to `useStore(s => s.days[date]?.ex[exercise.id])`. Renders: exercise name, plan summary (sets × lo–hi), weight stepper (hidden when `nw:true`), sets-today stepper, `<SetGrid>`, progression tip.

Progression tip logic (matches prototype exactly):
- If current session has all sets done AND all ≥ hi: "Hit {hi} on every set. Next time: {w+inc} lb."
- If no current entry AND `sg.up`: "Going up {inc} lb because you hit {hi} on every set last time."
- If `sg.last` exists AND not all sets done: "Last time: {w} lb × {reps}"
- If `nw:true` and all sets done and all ≥ hi: "Top of the range on every set. Try more {unit} next time."

- [ ] **Step 4: Implement remaining Today components and assemble `Today.tsx`**

- [ ] **Step 5: Spot-check in browser**

```bash
npm run dev
```
Navigate to Today tab. Verify: exercise cards render, weight stepper increments by `inc`, set count stepper clamps at 1 and 8, done toggle captures the rep input value, progression tip appears after marking all sets done at or above hi.

- [ ] **Step 6: Commit**

```bash
git add src/components/today/ src/lib/resizePhoto.ts
git commit -m "feat: Today tab — exercises, warm-up, cool-down, photos, daily activities"
```

---

## Task 12: Protein Tab

**Files:**
- Create: `src/components/protein/Protein.tsx`
- Create: `src/components/protein/FoodList.tsx`
- Create: `src/components/protein/MealChecks.tsx`
- Create: `src/components/protein/CustomEntry.tsx`
- Create: `src/components/protein/MealIdeas.tsx`

**Key implementation notes:**

**`FoodList`** receives `veganOnly: boolean` as a prop (state lives in `Protein.tsx`). Renders category headers and food buttons. Tapping a food calls `store.addProteinItem`.

**`CustomEntry`** uses two uncontrolled inputs (name and grams). On submit, validates: name non-empty and grams is a valid number > 0; on failure, `showToast('Enter a name and grams')`.

**Protein goal input**: uncontrolled; on `change`, validates 20–400; calls `store.setProteinGoal`; on out-of-range, `showToast('Enter 20 to 400 g')`.

**Copy check-in**: calls `summaryText(days, date, target)`, then `navigator.clipboard.writeText(...)`. On success `showToast('Copied')`; on failure, selects the textarea text and `showToast('Select and copy the text')`.

- [ ] **Step 1: Implement all five protein components**

- [ ] **Step 2: Spot-check in browser**

Verify: protein total updates when food is tapped, logged items list appears, remove button works, vegan filter hides non-vegan foods, copy button populates clipboard.

- [ ] **Step 3: Commit**

```bash
git add src/components/protein/
git commit -m "feat: Protein tab — food list, meals, custom entry, meal ideas, copy check-in"
```

---

## Task 13: Progress Tab

**Files:**
- Create: `src/components/progress/Progress.tsx`
- Create: `src/components/progress/DotGrid.tsx`
- Create: `src/components/progress/SparkLine.tsx`
- Create: `src/components/progress/BodyWeightChart.tsx`
- Create: `src/components/progress/PhotoGallery.tsx`

**Key implementation notes:**

**`SparkLine`**: inline `<svg aria-hidden="true" className="sp" viewBox="0 0 92 26">` with a `<polyline>` and dot at the last point. Render nothing (return `null`) when `vals.length < 2`. Geometry: `x = 2 + i*(88)/(n-1)`, `y = max===min ? 13 : 23 - (v-min)/(max-min)*20`.

**`BodyWeightChart`**: inline `<svg role="img" aria-label="Body weight from {first} to {last} lb" className="bwc" viewBox="0 0 320 110">`. Render an empty-state message when fewer than 2 data points. Geometry matches the prototype exactly (L=40, R=12, T=12, B=22).

**`DotGrid`**: 3 rows of 14 `<span className={`d${on?' on':''}`}>` elements. No SVG. The day labels row (`SMTWTFS`) is a header row of 14 spans.

**`PhotoGallery`**: reads all days with photos, sorts descending by date, shows the latest 12. Tapping a photo calls the `onPhotoOpen` callback passed down from `Progress`. Photo thumbnails use `usePhotoUrl`.

**Body weight input** is uncontrolled; "Save" button parses the value and calls `store.setBodyWeight`.

- [ ] **Step 1: Implement all five progress components**

- [ ] **Step 2: Spot-check in browser**

Verify: dot grid fills for days where you lifted/biked/hit protein; sparklines appear after two sessions; body weight chart renders after two entries; photo gallery thumbnails load from IndexedDB.

- [ ] **Step 3: Commit**

```bash
git add src/components/progress/
git commit -m "feat: Progress tab — 14-day dots, body weight chart, lift trends, photo gallery"
```

---

## Task 14: Data Tab

**Files:**
- Create: `src/components/data/Data.tsx`

**Interfaces:**
- Consumes: `useStore` (actions `importData`, `exportData`); `ymd()` from `types.ts`; `showToast` from `lib/toast.ts`; `merge()` from `merge.ts`

- [ ] **Step 1: Implement `Data.tsx`**

Layout: single card with two sections.

**Export section:**
```tsx
<button className="btn" onClick={handleExport}>Export JSON</button>
```
`handleExport`: call `store.exportData()`, stringify, create a `<a href={objectUrl} download={`lpl-backup-${ymd(new Date())}.json`}>`, click it, revoke the URL.

**Import section:**
```tsx
<input type="file" accept="application/json" onChange={handleImport} />
```
`handleImport`: read file text via `FileReader`, parse JSON; on parse error `showToast('Could not read file')` and return; call `store.importData(parsed)`; `showToast('Data imported')`.

**Note below the buttons:**
> Photos are stored on this device and are not included in the JSON export.

- [ ] **Step 2: Spot-check in browser**

Export a JSON file, verify it downloads with the correct filename and contains a `days` key. Import the same file back, verify toast shows "Data imported".

- [ ] **Step 3: Commit**

```bash
git add src/components/data/Data.tsx
git commit -m "feat: Data tab — Export and Import JSON"
```

---

## Task 15: App Shell, PWA, and README

**Files:**
- Modify: `src/App.tsx` (replace skeleton)
- Modify: `src/main.tsx` (add async store init)
- Modify: `vite.config.ts` (add VitePWA plugin)
- Modify: `index.html` (add Google Fonts preconnect links, PWA meta tags)
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`
- Create: `README.md`

**Interfaces:**
- Consumes: all tab components; `Tabs`, `Header`, `DateNav`, `Toast`, `PhotoViewer` from `shared/`; `useStore` from `store/index.ts`; `localAdapter` from `storage/local.ts`

- [ ] **Step 1: Implement `App.tsx`**

State: `const [currentDate, setCurrentDate] = useState(() => ymd(new Date()))` and `const [activeTab, setActiveTab] = useState<'today'|'protein'|'progress'|'data'>('today')`.

Layout:
```tsx
<div id="shell">
  <Header />
  <DateNav date={currentDate} onPrev={...} onNext={...} onToday={...} />
  <main id="app">
    {activeTab === 'today' && <Today date={currentDate} />}
    {activeTab === 'protein' && <Protein date={currentDate} />}
    {activeTab === 'progress' && <Progress date={currentDate} />}
    {activeTab === 'data' && <Data />}
  </main>
</div>
<Tabs active={activeTab} onChange={setActiveTab} />
<PhotoViewer ... />
<Toast />
```

Date navigation: `onNext` blocked when `currentDate === ymd(new Date())`. `onPrev` goes back one day unconditionally. `onToday` sets to `ymd(new Date())`.

`PhotoViewer` state lives in App: `photoViewerId` and `photoViewerDate`, set/cleared by callbacks passed down through Today and Progress tabs.

- [ ] **Step 2: Load store from localStorage before first render**

In `main.tsx`, load the store before mounting:
```typescript
localAdapter.load().then(data => {
  useStore.setState(data);
  createRoot(document.getElementById('root')!).render(
    <StrictMode><App /></StrictMode>
  );
});
```

- [ ] **Step 3: Configure PWA in `vite.config.ts`**

```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Lift and Protein Log',
    short_name: 'Lift Log',
    start_url: '/',
    display: 'standalone',
    background_color: '#f2f4f1',
    theme_color: '#b8441a',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [{
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
    }],
  },
})
```

- [ ] **Step 4: Create PWA icons**

Create a simple 192×192 and 512×512 PNG icon (a solid `#b8441a` square with a white "L" letterform, or any placeholder). These can be replaced later.

- [ ] **Step 5: Add PWA meta tags to `index.html`**

```html
<meta name="theme-color" content="#b8441a">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
```

- [ ] **Step 6: Write `README.md`**

Sections: What it is, Run locally (`npm install && npm run dev`), Run tests (`npm test`), Build (`npm run build`), Deploy to Vercel (push to main), Migrate existing data (Export JSON from old app → Import JSON in new app).

- [ ] **Step 7: Full build**

```bash
npm run build
```
Expected: build succeeds with no errors; `dist/` contains the app shell and service worker files.

- [ ] **Step 8: Run all tests one final time**

```bash
npm test
```
Expected: all domain tests PASS.

- [ ] **Step 9: Spot-check the full app in browser**

```bash
npm run dev
```
Walk through all four tabs. Verify: data persists on page reload, photo upload and display works, dark mode tokens apply, tap targets are visually 44 px, font loads as Barlow/Barlow Condensed.

- [ ] **Step 10: Final commit**

```bash
git add -A
git commit -m "feat: App shell, PWA configuration, and README"
```

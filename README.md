# Lift and Protein Log

A mobile-first PWA for tracking vegetarian workouts, protein intake, and body weight. Works offline and installs on your phone.

## Features

- **Today** — workout type selector (Tue/Wed/Thu/Rest), exercise cards with auto-progression, warm-up and cool-down timed dials, session photos, every-day activities (bike, sit-ups, push-ups); tap **Edit** to rename, add, or remove exercises
- **Protein** — goal tracker, food list with vegan filter, meal checks, custom entries, copy check-in summary
- **Progress** — 14-day activity dots, lift trend sparklines, body weight chart, photo gallery
- **Data** — export and import JSON backups (photos stored locally on device are not included)

## Tech Stack

- Vite 8 + React 19 + TypeScript 7
- Zustand 5 for state
- IndexedDB for photo blobs, localStorage for app data
- `vite-plugin-pwa` with Workbox for offline support
- Vitest for domain logic tests

## Development

```bash
npm install
npm run dev        # start dev server at localhost:5173
npm test           # run unit tests (40 tests)
npm run build      # production build with PWA
```

## Deploy

```bash
vercel             # deploy to Vercel (auto-detects Vite)
```

Or connect the repository to Vercel for automatic deploys on push.

## Architecture

```
src/
  domain/      # pure functions: types, plan, progression, pref, protein, stats, merge
  storage/     # StorageAdapter interface + localAdapter (localStorage + IndexedDB)
  store/       # Zustand store with all actions
  hooks/       # usePhotoUrl (IndexedDB blob → object URL)
  lib/         # toast signals, photo resize
  components/
    shared/    # Header, Tabs, DateNav, Toast, PhotoViewer, Stepper
    today/     # Today tab and sub-components
    protein/   # Protein tab and sub-components
    progress/  # Progress tab and sub-components
    data/      # Data tab (export / import)
```

Domain logic has no React dependencies and is fully unit-tested. The store subscribes to changes and debounces saves to localStorage (800 ms). Photo blobs live in IndexedDB under the key `lpl-blobs`.

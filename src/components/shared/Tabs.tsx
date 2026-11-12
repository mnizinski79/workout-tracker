type TabId = 'today' | 'protein' | 'progress' | 'data'

interface TabsProps {
  active: TabId
  onChange: (tab: TabId) => void
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'protein', label: 'Protein' },
  { id: 'progress', label: 'Progress' },
  { id: 'data', label: 'Data' },
]

export function Tabs({ active, onChange }: TabsProps) {
  return (
    <nav className="tabs" aria-label="Sections">
      <div>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={active === t.id ? 'on' : undefined}
            aria-current={active === t.id ? 'page' : 'false'}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

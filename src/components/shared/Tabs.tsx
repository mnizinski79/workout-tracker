import { Barbell, Egg, ChartLine, Database } from '@phosphor-icons/react'

type TabId = 'today' | 'protein' | 'progress' | 'data'

interface TabsProps {
  active: TabId
  onChange: (tab: TabId) => void
}

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: 'today', label: 'Today', Icon: Barbell },
  { id: 'protein', label: 'Protein', Icon: Egg },
  { id: 'progress', label: 'Progress', Icon: ChartLine },
  { id: 'data', label: 'Data', Icon: Database },
]

export function Tabs({ active, onChange }: TabsProps) {
  return (
    <nav className="tabs" aria-label="Sections">
      <div>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={active === id ? 'on' : undefined}
            aria-current={active === id ? 'page' : 'false'}
            onClick={() => onChange(id)}
          >
            <Icon size={20} weight={active === id ? 'fill' : 'regular'} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}

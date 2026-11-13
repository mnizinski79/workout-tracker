import { useState, useRef, useEffect } from 'react'
import type { IdeaDef } from '../../domain/types'
import type { CategorizedIdeas, ConversationMessage } from '../../api/mealIdeas'
import { generateCategorizedIdeas } from '../../api/mealIdeas'
import { showToast } from '../../lib/toast'

const CATEGORY_ORDER = ['breakfast', 'lunch', 'dinner', 'snack', 'postWorkout']
const CATEGORY_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  postWorkout: 'Post-workout',
}
const PRESET_CHIPS = [
  'Quick meals',
  'Veggie',
  'High protein',
  'No-cook',
  'Vegan',
  '30 min',
  'Low carb',
  'Budget',
]

interface Props {
  open: boolean
  target: number
  savedFoods: { n: string; g: number }[]
  onClose: () => void
  onApply: (ideas: IdeaDef[]) => void
}

export function MealIdeasSheet({ open, target, savedFoods, onClose, onApply }: Props) {
  const [categories, setCategories] = useState<CategorizedIdeas>({})
  const [selected, setSelected] = useState<Record<string, number>>({})
  const [chips, setChips] = useState<string[]>([])
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-generate on open
  useEffect(() => {
    if (open && Object.keys(categories).length === 0) {
      generate([], [])
    }
  }, [open])

  async function generate(activeChips: string[], activeMessages: ConversationMessage[]) {
    setLoading(true)
    try {
      const { categories: cats, assistantMessage } = await generateCategorizedIdeas({
        target,
        savedFoods,
        chips: activeChips,
        messages: activeMessages,
      })
      setCategories(cats ?? {})
      setSelected({})
      // Append assistant reply to conversation history
      const userContent = activeMessages.length > 0
        ? activeMessages[activeMessages.length - 1].content
        : `Generate meal ideas.${activeChips.length ? ' Filters: ' + activeChips.join(', ') + '.' : ''}`
      if (activeMessages.length === 0) {
        setMessages([
          { role: 'user', content: userContent },
          { role: 'assistant', content: assistantMessage },
        ])
      } else {
        setMessages([...activeMessages, { role: 'assistant', content: assistantMessage }])
      }
    } catch {
      showToast('Could not generate ideas — check server is running')
    } finally {
      setLoading(false)
    }
  }

  function handleRefine() {
    const text = inputText.trim()
    if (!text && chips.length === 0) return
    const nextMessages: ConversationMessage[] = [
      ...messages,
      { role: 'user', content: text || `Refine with filters: ${chips.join(', ')}` },
    ]
    setMessages(nextMessages)
    setInputText('')
    generate(chips, nextMessages)
  }

  function addChip(chip: string) {
    if (!chips.includes(chip)) setChips([...chips, chip])
  }

  function removeChip(chip: string) {
    setChips(chips.filter((c) => c !== chip))
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const text = inputText.trim()
      if (text) {
        // Add as chip if it looks like a filter, otherwise refine directly
        if (text.length < 25) {
          addChip(text)
          setInputText('')
        } else {
          handleRefine()
        }
      }
    }
  }

  function toggleSelect(catKey: string, idx: number) {
    setSelected((prev) =>
      prev[catKey] === idx ? { ...prev, [catKey]: -1 } : { ...prev, [catKey]: idx },
    )
  }

  function handleApply() {
    const result: IdeaDef[] = []
    for (const catKey of CATEGORY_ORDER) {
      const idx = selected[catKey]
      if (idx != null && idx >= 0 && categories[catKey]?.[idx]) {
        result.push(categories[catKey][idx])
      }
    }
    if (result.length === 0) {
      showToast('Select at least one meal to apply')
      return
    }
    onApply(result)
  }

  const selectionCount = Object.values(selected).filter((i) => i >= 0).length
  const hasCategories = Object.keys(categories).length > 0
  const availableChips = PRESET_CHIPS.filter((c) => !chips.includes(c))

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          height: '92dvh',
          background: 'var(--bg)',
          borderRadius: '16px 16px 0 0',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 12px', borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Meal ideas</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}
          >✕</button>
        </div>

        {/* Category cards — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 8px' }}>
          {loading && !hasCategories && (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40, fontSize: 14 }}>
              Generating ideas…
            </div>
          )}

          {hasCategories && CATEGORY_ORDER.map((catKey) => {
            const ideas = categories[catKey]
            if (!ideas?.length) return null
            return (
              <div key={catKey} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                  {CATEGORY_LABELS[catKey]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ideas.map((idea, idx) => {
                    const isSelected = selected[catKey] === idx
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleSelect(catKey, idx)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 14px',
                          borderRadius: 10,
                          border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          background: isSelected ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--card)',
                          color: 'var(--fg)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'border-color 0.15s, background 0.15s',
                        }}
                      >
                        <span style={{ fontSize: 14, flex: 1, marginRight: 12 }}>{idea.t}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? 'var(--accent)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
                          +{idea.g} g
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Refinement bar + chips */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '12px 16px',
          flexShrink: 0,
          background: 'var(--bg)',
        }}>
          {/* Active chips */}
          {chips.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {chips.map((chip) => (
                <span
                  key={chip}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 20,
                    background: 'var(--accent)', color: '#fff',
                    fontSize: 12, fontWeight: 600,
                  }}
                >
                  {chip}
                  <button
                    onClick={() => removeChip(chip)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1, opacity: 0.8 }}
                  >×</button>
                </span>
              ))}
            </div>
          )}

          {/* Text input row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: chips.length > 0 ? 0 : 10 }}>
            <input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Refine ideas or add a filter…"
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--card)',
                color: 'var(--fg)', fontSize: 14, outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              className="btn"
              style={{ minHeight: 40, padding: '0 14px', fontSize: 13 }}
              onClick={handleRefine}
              disabled={loading || (!inputText.trim() && chips.length === 0)}
            >
              {loading ? '…' : '↺'}
            </button>
          </div>

          {/* Suggested chips */}
          {availableChips.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {availableChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => addChip(chip)}
                  style={{
                    padding: '4px 10px', borderRadius: 20,
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--muted)', fontSize: 12, cursor: 'pointer',
                  }}
                >
                  + {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Apply footer */}
        <div style={{
          padding: '12px 16px 20px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
          background: 'var(--bg)',
        }}>
          <button
            className="btn"
            style={{ width: '100%' }}
            onClick={handleApply}
            disabled={selectionCount === 0}
          >
            {selectionCount > 0 ? `Apply ${selectionCount} meal${selectionCount > 1 ? 's' : ''}` : 'Select meals to apply'}
          </button>
        </div>
      </div>
    </div>
  )
}

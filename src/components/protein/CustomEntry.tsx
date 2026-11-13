import { useRef } from 'react'
import { useStore } from '../../store/index'
import { showToast } from '../../lib/toast'

interface CustomEntryProps {
  date: string
}

export function CustomEntry({ date }: CustomEntryProps) {
  const addProteinItem = useStore((s) => s.addProteinItem)
  const saveFood = useStore((s) => s.saveFood)
  const nameRef = useRef<HTMLInputElement>(null)
  const gramsRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    const n = nameRef.current?.value.trim() ?? ''
    const g = Number(gramsRef.current?.value)
    if (!n || !gramsRef.current?.value || isNaN(g) || g <= 0) {
      showToast('Enter a name and grams')
      return
    }
    addProteinItem(date, { id: `${Date.now()}-custom`, n, g })
    saveFood({ n, g })
    if (nameRef.current) nameRef.current.value = ''
    if (gramsRef.current) gramsRef.current.value = ''
  }

  return (
    <section className="card">
      <h3>Custom entry</h3>
      <div className="field">
        <input
          ref={nameRef}
          className="inp"
          type="text"
          placeholder="Food name"
          aria-label="Food name"
        />
        <input
          ref={gramsRef}
          className="num"
          type="text"
          inputMode="numeric"
          placeholder="g"
          aria-label="Grams of protein"
          style={{ width: 70 }}
        />
        <button className="btn" onClick={handleSubmit}>
          Add
        </button>
      </div>
    </section>
  )
}

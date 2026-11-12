import { Minus, Plus } from '@phosphor-icons/react'

interface StepperProps {
  value: number
  onDecrement: () => void
  onIncrement: () => void
  label: string
  min: number
  max: number
}

export function Stepper({ value, onDecrement, onIncrement, label, min, max }: StepperProps) {
  return (
    <div className="stepper">
      <button
        onClick={onDecrement}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        <Minus size={16} weight="bold" aria-hidden="true" />
      </button>
      <output>{value}</output>
      <button
        onClick={onIncrement}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        <Plus size={16} weight="bold" aria-hidden="true" />
      </button>
    </div>
  )
}

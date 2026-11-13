import { useEffect, useState } from 'react'
import { subscribeToast } from '../../lib/toast'

export function Toast() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    return subscribeToast((m) => {
      setMsg(m)
      setVisible(true)
      setTimeout(() => setVisible(false), 2000)
    })
  }, [])

  return (
    <div id="toast" className={visible ? 'show' : undefined} role="status" aria-live="polite">
      {msg}
    </div>
  )
}

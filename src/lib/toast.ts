let listeners: Array<(msg: string) => void> = []

export function showToast(msg: string) {
  listeners.forEach((l) => l(msg))
}

export function subscribeToast(fn: (msg: string) => void) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((l) => l !== fn)
  }
}

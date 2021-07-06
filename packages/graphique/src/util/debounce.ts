export const debounce = (delay: number, fn: (...args: any[]) => void) => {
  let timerId: ReturnType<typeof setTimeout> | null
  return (...args: any[]) => {
    if (timerId) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, delay)
  }
}

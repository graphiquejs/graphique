window.requestAnimationFrame = (callback: any): number => window.setTimeout(() => callback(), 0)
window.cancelAnimationFrame = (id: any): void => {
  clearTimeout(id);
}

Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true })
Object.defineProperty(document, 'hidden', { value: false, writable: true })

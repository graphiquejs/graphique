window.requestAnimationFrame = (callback: any): number => window.setTimeout(() => callback(), 0)
window.cancelAnimationFrame = (id: any): void => {
  clearTimeout(id)
}

global.ResizeObserver = require('resize-observer-polyfill')

Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true })
Object.defineProperty(document, 'hidden', { value: false, writable: true })

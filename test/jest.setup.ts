window.requestAnimationFrame = (callback: any): number => window.setTimeout(() => callback(), 0)
window.cancelAnimationFrame = (id: any): void => {
  clearTimeout(id)
}

global.ResizeObserver = require('resize-observer-polyfill')

import { useState, useEffect } from 'react'
import { MoonIcon, SunIcon } from 'nextra/icons'
import { useTheme } from 'nextra-theme-docs'

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div style={{ width: 38 }} />
  }

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(isDark ? 'light' : 'dark')
      }}
      style={{
        padding: 12,
      }}
      className="_rounded _transition-colors [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] contrast-more:_border hover:_bg-gray-100 hover:_text-gray-900 dark:hover:_bg-primary-100/5 dark:hover:_text-gray-50 contrast-more:_border-transparent contrast-more:hover:_border-gray-900 contrast-more:dark:hover:_border-gray-50"
    >
      {isDark ? (
        <SunIcon width={14} height={14} />
      ) : (
        <MoonIcon width={14} height={14} />
      )}
    </button>
  )
}

export default ThemeToggle

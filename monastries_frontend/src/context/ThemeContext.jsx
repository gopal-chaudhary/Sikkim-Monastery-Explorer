/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

function applyTheme(theme) {
  const root = document.documentElement
  root.dataset.theme = theme
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null
    if (stored === 'light' || stored === 'dark') return stored
    const prefersDark = typeof window !== 'undefined'
      ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
    return prefersDark ? 'dark' : 'light'
  })

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}


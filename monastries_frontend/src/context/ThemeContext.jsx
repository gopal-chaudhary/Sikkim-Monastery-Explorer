/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

function applyTheme(theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  // Add transition class for smooth theme switching
  root.classList.add('theme-transition')
  setTimeout(() => root.classList.remove('theme-transition'), 300)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check for stored theme first
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') return stored
    }
    
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark' : 'light'
    }
    
    // Fallback to dark mode
    return 'dark'
  })

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    applyTheme(theme)
    
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // ignore localStorage errors
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      const storedTheme = localStorage.getItem('theme')
      // Only auto-switch if user hasn't manually set a preference
      if (!storedTheme) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    mounted,
  }), [theme, mounted])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}


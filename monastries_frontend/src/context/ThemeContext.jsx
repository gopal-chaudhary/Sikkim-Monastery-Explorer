/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

function applyTheme(theme) {
  const root = document.documentElement
  root.dataset.theme = theme
}

export function ThemeProvider({ children }) {
  const [theme] = useState('dark')

  useEffect(() => {
    applyTheme('dark')
  }, [])

  const value = useMemo(() => ({
    theme: 'dark',
    setTheme: () => {},
  }), [])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}


import { useState, useCallback } from 'react'
import api from '../api'

export function useAISuggestions() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  const getSuggestions = useCallback(async (query, type = 'monastery') => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/api/v1/ai/suggest', {
        query,
        type,
      })

      setSuggestions(data.suggestions || [])
    } catch (err) {
      console.error('Failed to get suggestions:', err)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clearSuggestions = useCallback(() => setSuggestions([]), [])

  return {
    suggestions,
    loading,
    getSuggestions,
    clearSuggestions,
  }
}

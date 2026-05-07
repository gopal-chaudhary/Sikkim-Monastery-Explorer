import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const AIContext = createContext(null)

const MAX_HISTORY = 50

export function AIProvider({ children }) {
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('ai_chat_history')
      if (!stored) return []
      const parsed = JSON.parse(stored)
      // Re-hydrate timestamps as Date objects and sanitize content
      return parsed.map(m => ({
        ...m,
        content: typeof m.content === 'object' ? JSON.stringify(m.content) : String(m.content || ''),
        timestamp: new Date(m.timestamp)
      }))
    } catch {
      return []
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imageAnalysis, setImageAnalysis] = useState(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [lastModel, setLastModel] = useState(null)

  const persistHistory = useCallback((history) => {
    try {
      localStorage.setItem('ai_chat_history', JSON.stringify(history.slice(-MAX_HISTORY)))
    } catch {
      // Storage quota exceeded — keep in memory only
    }
  }, [])

  const addMessage = useCallback((role, content, metadata = {}) => {
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      role,
      content: String(content),
      timestamp: new Date(),
      ...metadata,
    }
    setChatHistory(prev => {
      const updated = [...prev, newMessage]
      persistHistory(updated)
      return updated
    })
    return newMessage
  }, [persistHistory])

  const updateLastMessage = useCallback((content) => {
    setChatHistory(prev => {
      if (!prev.length) return prev
      const updated = [...prev]
      updated[updated.length - 1] = { ...updated[updated.length - 1], content }
      persistHistory(updated)
      return updated
    })
  }, [persistHistory])

  const clearChat = useCallback(() => {
    setChatHistory([])
    setError(null)
    setStreamingContent('')
    try { localStorage.removeItem('ai_chat_history') } catch {}
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const setErrorSafe = useCallback((err) => {
    if (err instanceof Error) setError(err.message)
    else if (typeof err === 'object' && err !== null) setError(JSON.stringify(err))
    else setError(String(err))
  }, [])

  // Build API-safe conversation history (only user/assistant pairs)
  const getConversationHistory = useCallback(() => {
    return chatHistory
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }))
  }, [chatHistory])

  const value = useMemo(() => ({
    chatHistory,
    addMessage,
    updateLastMessage,
    clearChat,
    loading,
    setLoading,
    error,
    setError: setErrorSafe,
    clearError,
    imageAnalysis,
    setImageAnalysis,
    streamingContent,
    setStreamingContent,
    isStreaming,
    setIsStreaming,
    lastModel,
    setLastModel,
    getConversationHistory,
  }), [
    chatHistory, addMessage, updateLastMessage, clearChat,
    loading, error, clearError, imageAnalysis,
    streamingContent, isStreaming, lastModel, getConversationHistory, setErrorSafe,
  ])

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>
}

export function useAI() {
  const ctx = useContext(AIContext)
  if (!ctx) throw new Error('useAI must be used within AIProvider')
  return ctx
}

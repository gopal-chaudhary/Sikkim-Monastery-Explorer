import { useCallback } from 'react'
import { useAI } from '../context/AIContext'

export function useAIAnalytics() {
  const { setLoading } = useAI()

  const trackInteraction = useCallback(async (type, data) => {
    try {
      const response = await fetch('/api/v1/ai/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactionType: type,
          ...data,
        }),
      })
      return response.ok
    } catch (err) {
      console.warn('Failed to track AI interaction:', err)
      return false
    }
  }, [])

  const trackChatMessage = useCallback((message, response, monasteryId = null) => {
    return trackInteraction('chat', {
      userInput: message,
      aiResponse: response,
      monasteryId,
    })
  }, [trackInteraction])

  const trackImageAnalysis = useCallback((monasteryId, analysisResult) => {
    return trackInteraction('image_analysis', {
      monasteryId,
      aiResponse: analysisResult,
    })
  }, [trackInteraction])

  const trackRating = useCallback(async (interactionId, rating, feedback) => {
    try {
      const response = await fetch(`/api/v1/ai/rate/${interactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback }),
      })
      return response.ok
    } catch (err) {
      console.warn('Failed to submit rating:', err)
      return false
    }
  }, [])

  return {
    trackInteraction,
    trackChatMessage,
    trackImageAnalysis,
    trackRating,
  }
}

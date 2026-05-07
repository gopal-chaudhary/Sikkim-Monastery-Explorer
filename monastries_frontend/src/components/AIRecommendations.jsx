import { useState, useEffect } from 'react'
import { Sparkles, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export function AIRecommendations({ userPreferences: externalPrefs }) {
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const defaultPrefs = {
    interests: ['Buddhism', 'Architecture', 'History', 'Meditation'],
    experienceLevel: 'General',
    accessibility: 'None',
    season: 'Spring',
    budget: 'Moderate',
  }

  const loadRecommendations = async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      const { data } = await api.post('/ai/recommend', {
        userPreferences: externalPrefs || defaultPrefs,
      })
      setRecommendations(data.recommendations)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to load recommendations'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (!user) return null

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-amber-400" />
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-amber-50">AI Recommendations</h2>
              <p className="text-amber-200/50 text-xs mt-0.5">Personalised picks powered by DharmaGuide AI</p>
            </div>
          </div>
          {!loading && (
            <button
              onClick={loadRecommendations}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-200/60 hover:text-amber-200 hover:border-amber-500/50 transition text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-4">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-amber-200/50 text-sm">Discovering the perfect monasteries for you…</p>
          </div>
        ) : error ? (
          <div className="p-5 rounded-2xl glass border border-red-500/20 bg-red-500/5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 text-sm">{error}</p>
              <button onClick={loadRecommendations}
                className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition underline">
                Try again
              </button>
            </div>
          </div>
        ) : recommendations ? (
          <div className="glass rounded-2xl p-6 sm:p-8 border border-amber-500/10">
            <div className="space-y-1">
              {recommendations.split('\n').map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-2" />
                // Render bold monastery names
                if (line.startsWith('**') || line.match(/^\d+\./)) {
                  return (
                    <p key={i} className="font-semibold text-amber-300 text-sm mt-4 mb-1"
                      dangerouslySetInnerHTML={{
                        __html: line.replace(/\*\*(.*?)\*\*/g, '<span class="text-amber-300">$1</span>')
                      }} />
                  )
                }
                return (
                  <p key={i} className="text-amber-100/75 text-sm leading-relaxed pl-2"
                    dangerouslySetInnerHTML={{
                      __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300">$1</strong>')
                    }} />
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

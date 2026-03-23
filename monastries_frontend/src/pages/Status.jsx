import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { api, getErrorMessage } from '../api'
import { ErrorState, OfflineBanner } from '../components/States'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { SkeletonList } from '../components/SkeletonCard'
import { Activity, Server, Clock } from 'lucide-react'

export default function Status() {
  const online = useOnlineStatus()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [health, setHealth] = useState(null)

  const fetchHealth = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get('/health')
      setHealth(data)
    } catch (e) {
      setError(getErrorMessage(e))
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  return (
    <Layout>
      {!online && <OfflineBanner onRetry={fetchHealth} />}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-amber-50 flex items-center gap-2">
              <Activity className="w-6 h-6 text-amber-400" /> Status
            </h1>
            <p className="text-stone-400 mt-2">Live health of the API.</p>
          </div>
          <button
            type="button"
            onClick={fetchHealth}
            className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-100 hover:bg-amber-500/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <SkeletonList rows={2} />
        ) : error ? (
          <ErrorState title="API health check failed" message={error} onRetry={fetchHealth} />
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-5 border border-amber-900/30">
              <p className="text-xs text-stone-500">Status</p>
              <p className="mt-2 text-2xl font-heading font-bold text-emerald-300">Operational</p>
            </div>
            <div className="glass rounded-2xl p-5 border border-amber-900/30">
              <p className="text-xs text-stone-500 flex items-center gap-2"><Server className="w-4 h-4 text-amber-400" /> Uptime</p>
              <p className="mt-2 text-lg text-stone-100">{Math.round(health?.uptime || 0)}s</p>
            </div>
            <div className="glass rounded-2xl p-5 border border-amber-900/30">
              <p className="text-xs text-stone-500 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" /> Timestamp</p>
              <p className="mt-2 text-sm text-stone-200">{health?.timestamp || '—'}</p>
            </div>
          </div>
        )}

        <div className="mt-8 glass rounded-2xl p-5 border border-amber-900/30">
          <h2 className="font-heading text-xl font-bold text-amber-50 mb-2">Monitoring tips</h2>
          <ul className="text-sm text-stone-300 space-y-1 list-disc list-inside">
            <li>Use Render Health Checks or Uptime Kuma to ping <code className="text-amber-200">/health</code>.</li>
            <li>Set alerts for non-200 responses or high latency.</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}


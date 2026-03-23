import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { api, getErrorMessage } from '../api'
import { Layout } from '../components/Layout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Send, Clock, Check, X } from 'lucide-react'
import { EmptyState, ErrorState, OfflineBanner } from '../components/States'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { SkeletonList } from '../components/SkeletonCard'

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', className: 'bg-amber-900/50 text-amber-200' },
  approved: { icon: Check, label: 'Approved', className: 'bg-green-900/50 text-green-200' },
  rejected: { icon: X, label: 'Rejected', className: 'bg-rose-900/50 text-rose-200' },
}

export default function MyContributions() {
  const [data, setData] = useState({ data: [], stats: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const online = useOnlineStatus()

  useEffect(() => {
    api.get('/contributions/my')
      .then((res) => {
        setError(null)
        setData({ data: res.data.data || [], stats: res.data.stats || null })
      })
      .catch((err) => {
        const message = getErrorMessage(err)
        setError(message)
        toast.error(message)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <ProtectedRoute>
      <Layout>
        {!online && <OfflineBanner onRetry={() => window.location.reload()} />}
        <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-amber-50 mb-2 flex items-center gap-2"><Send className="w-8 h-8" /> My contributions</h1>
          <p className="text-stone-400 text-sm mb-6">Track the monasteries you’ve submitted and their review status.</p>
          {data.stats && (
            <div className="glass rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div><p className="text-xl font-heading font-bold text-amber-400">{data.stats.total ?? 0}</p><p className="text-xs text-stone-500">Total</p></div>
              <div><p className="text-xl font-heading font-bold text-amber-400">{data.stats.pending ?? 0}</p><p className="text-xs text-stone-500">Pending</p></div>
              <div><p className="text-xl font-heading font-bold text-amber-400">{data.stats.approved ?? 0}</p><p className="text-xs text-stone-500">Approved</p></div>
              <div><p className="text-xl font-heading font-bold text-amber-400">{data.stats.totalPoints ?? 0}</p><p className="text-xs text-stone-500">Points earned</p></div>
            </div>
          )}
          {loading && <SkeletonList rows={3} />}
          {!loading && error && (
            <ErrorState title="Couldn’t load contributions" message={error} onRetry={() => window.location.reload()} />
          )}
          {!loading && !error && data.data.length === 0 && (
            <EmptyState
              title="No contributions yet"
              message="Submit your first monastery and track its approval status here."
              action={<Link to="/contribute" className="mt-5 inline-block text-amber-400 hover:text-amber-300">Contribute a monastery</Link>}
              icon={Send}
            />
          )}
          {!loading && data.data.length > 0 && (
            <ul className="space-y-4">
              {data.data.map((c) => {
                const config = statusConfig[c.status] || statusConfig.pending
                const Icon = config.icon
                return (
                  <li key={c._id} className="glass rounded-xl p-4 border border-amber-900/30">
                    <div className="flex flex-wrap justify-between gap-4">
                      <div>
                        <p className="font-medium text-amber-100">{c.monasteryName}</p>
                        <p className="text-stone-400 text-sm">{c.location} · {c.region}</p>
                        <p className="text-stone-500 text-xs mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${config.className}`}>
                        <Icon className="w-3.5 h-3.5" /> {config.label}
                      </span>
                    </div>
                    {c.reviewNotes && <p className="mt-2 text-stone-400 text-xs">Review: {c.reviewNotes}</p>}
                    {c.pointsAwarded > 0 && <p className="mt-1 text-amber-400 text-xs">+{c.pointsAwarded} points</p>}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

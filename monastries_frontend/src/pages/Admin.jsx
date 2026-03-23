import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { api, getErrorMessage } from '../api'
import { Layout } from '../components/Layout'
import { AdminRoute } from '../components/AdminRoute'
import { Shield, Check, X } from 'lucide-react'

export default function Admin() {
  const [contributions, setContributions] = useState([])
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [reviewingId, setReviewingId] = useState(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [pointsToAward, setPointsToAward] = useState(100)

  const fetchData = () => {
    setLoading(true)
    const endpoint = filter === 'pending' ? '/contributions/pending' : '/contributions/all'
    const params = new URLSearchParams({ page, limit: 10 })
    if (filter !== 'pending') params.set('status', filter)
    api.get(`${endpoint}?${params}`)
      .then(({ data }) => {
        setContributions(data.data || [])
        setPagination(data.pagination || null)
        if (data.stats) setStats(data.stats)
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [filter, page])

  const handleReview = async (contributionId, action) => {
    setReviewingId(contributionId)
    try {
      await api.post(`/contributions/${contributionId}/review`, {
        action,
        reviewNotes: reviewNotes.trim() || undefined,
        pointsToAward: action === 'approve' ? pointsToAward : undefined,
      })
      toast.success(action === 'approve' ? 'Contribution approved.' : 'Contribution rejected.')
      setReviewNotes('')
      setReviewingId(null)
      fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
      setReviewingId(null)
    }
  }

  return (
    <AdminRoute>
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-amber-50 mb-2 flex items-center gap-2"><Shield className="w-8 h-8" /> Admin</h1>
          <p className="text-stone-400 text-sm mb-6">Review and manage community contributions.</p>
          {stats && (
            <div className="glass rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div><p className="text-xl font-heading font-bold text-amber-400">{stats.totalContributions ?? 0}</p><p className="text-xs text-stone-500">Total</p></div>
              <div><p className="text-xl font-heading font-bold text-amber-400">{stats.pending ?? 0}</p><p className="text-xs text-stone-500">Pending</p></div>
              <div><p className="text-xl font-heading font-bold text-amber-400">{stats.approved ?? 0}</p><p className="text-xs text-stone-500">Approved</p></div>
              <div><p className="text-xl font-heading font-bold text-amber-400">{stats.rejected ?? 0}</p><p className="text-xs text-stone-500">Rejected</p></div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-6">
            <button type="button" onClick={() => { setFilter('pending'); setPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === 'pending' ? 'bg-amber-500 text-stone-900' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}>Pending</button>
            <button type="button" onClick={() => { setFilter('all'); setPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === 'all' ? 'bg-amber-500 text-stone-900' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}>All</button>
            <button type="button" onClick={() => { setFilter('approved'); setPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === 'approved' ? 'bg-amber-500 text-stone-900' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}>Approved</button>
            <button type="button" onClick={() => { setFilter('rejected'); setPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === 'rejected' ? 'bg-amber-500 text-stone-900' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}>Rejected</button>
          </div>
          {loading && <p className="text-stone-400">Loading...</p>}
          {!loading && contributions.length === 0 && <p className="text-stone-400">No contributions in this list.</p>}
          {!loading && contributions.length > 0 && (
            <ul className="space-y-4">
              {contributions.map((c) => (
                <li key={c._id} className="glass rounded-xl p-4 border border-amber-900/30">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <p className="font-medium text-amber-100">{c.monasteryName}</p>
                      <p className="text-stone-400 text-sm">{c.location} · {c.region}</p>
                      <p className="text-stone-500 text-xs mt-1">{c.description?.slice(0, 120)}...</p>
                      <p className="text-stone-500 text-xs mt-1">By: {c.contributorName || (c.contributedBy?.firstName + ' ' + c.contributedBy?.lastName)} · {new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${c.status === 'pending' ? 'bg-amber-900/50 text-amber-200' : c.status === 'approved' ? 'bg-green-900/50 text-green-200' : 'bg-rose-900/50 text-rose-200'}`}>{c.status}</span>
                  </div>
                  {c.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-amber-900/30 space-y-2">
                      <input type="number" min={1} value={pointsToAward} onChange={(e) => setPointsToAward(Number(e.target.value))} className="w-24 px-2 py-1 rounded bg-stone-900/80 border border-amber-900/50 text-stone-100 text-sm" placeholder="Points" />
                      <input type="text" value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} className="w-full sm:max-w-xs px-2 py-1 rounded bg-stone-900/80 border border-amber-900/50 text-stone-100 text-sm" placeholder="Review notes (optional)" />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleReview(c._id, 'approve')} disabled={reviewingId === c._id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 disabled:opacity-50">
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button type="button" onClick={() => handleReview(c._id, 'reject')} disabled={reviewingId === c._id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-500 disabled:opacity-50">
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-lg border border-amber-700/50 text-amber-100 disabled:opacity-50">Prev</button>
              <span className="px-4 py-2 text-stone-400">Page {page} of {pagination.pages}</span>
              <button type="button" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-lg border border-amber-700/50 text-amber-100 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </Layout>
    </AdminRoute>
  )
}

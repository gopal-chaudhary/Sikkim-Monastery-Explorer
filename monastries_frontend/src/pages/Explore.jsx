import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { MapPin, Star, ChevronRight } from 'lucide-react'
import { api, getErrorMessage } from '../api'
import { Layout } from '../components/Layout'
import { SkeletonCard } from '../components/SkeletonCard'
import { SmartImage } from '../components/SmartImage'
import { EmptyState, ErrorState, OfflineBanner } from '../components/States'
import { useMonasteries } from '../context/MonasteryContext'

export default function Explore() {
  const [searchParams] = useSearchParams()
  const [monasteries, setMonasteries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '')
  const [region, setRegion] = useState(searchParams.get('region') || 'all')
  const [age, setAge] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const { online } = useMonasteries()

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false
    async function fetchList() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({ page, limit: 12, sortBy })
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim())
        if (region && region !== 'all') params.set('region', region)
        if (age) params.set('age', age)
        const { data } = await api.get(`/monasteries?${params}`)
        if (!cancelled) {
          setMonasteries(data.data || [])
          setPagination(data.pagination || null)
        }
      } catch (err) {
        if (!cancelled) {
          const message = getErrorMessage(err)
          setError(message)
          toast.error(message)
          setMonasteries([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchList()
    return () => { cancelled = true }
  }, [page, region, age, sortBy, debouncedSearch])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch((s) => s)
  }

  return (
    <Layout>
      {!online && <OfflineBanner onRetry={() => window.location.reload()} />}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-amber-50">Explore monasteries</h1>
            <p className="text-stone-400 text-sm mt-1">Filter by region, age, and sort by name, rating or visitors.</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="glass rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row gap-3 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="flex-1 min-w-[180px] px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <select value={region} onChange={(e) => { setRegion(e.target.value); setPage(1); }} className="sm:w-40 px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-200">
            <option value="all">All regions</option>
            <option value="East Sikkim">East Sikkim</option>
            <option value="West Sikkim">West Sikkim</option>
            <option value="North Sikkim">North Sikkim</option>
            <option value="South Sikkim">South Sikkim</option>
          </select>
          <select value={age} onChange={(e) => { setAge(e.target.value); setPage(1); }} className="sm:w-44 px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-200">
            <option value="">Any age</option>
            <option value="< 200 years">&lt; 200 years</option>
            <option value="200-300 years">200-300 years</option>
            <option value="> 300 years">&gt; 300 years</option>
          </select>
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="sm:w-36 px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-200">
            <option value="name">Name</option>
            <option value="rating">Rating</option>
            <option value="visitors">Visitors</option>
            <option value="age">Age</option>
          </select>
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-900 font-medium hover:brightness-110 transition">Apply</button>
        </form>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Couldn’t load monasteries"
            message={error}
            onRetry={() => window.location.reload()}
          />
        ) : monasteries.length === 0 ? (
          <EmptyState
            title="No monasteries match your search"
            message="Try clearing filters, changing region, or searching a different name."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setRegion('all')
                  setAge('')
                  setSortBy('name')
                  setPage(1)
                }}
                className="mt-5 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-100 hover:bg-amber-500/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {monasteries.map((m) => (
                <Link key={m._id} to={`/monastery/${m._id}`} className="card-shine group rounded-2xl overflow-hidden bg-stone-900/60 border border-amber-900/30 hover:border-amber-700/50 transition-all duration-300 block">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SmartImage
                      src={m.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600'}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      optimizeWidth={800}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-stone-900/80 text-amber-400 text-xs font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {m.rating ?? '—'}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="font-heading text-xl font-bold text-amber-50">{m.name}</h4>
                      <p className="text-stone-400 text-xs sm:text-sm flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> 
                        {m.region || (m.location?.district || m.location?.village || m.location)} · Est. {m.established || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-stone-500 text-xs">View guide & book</span>
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                  </div>
                </Link>
              ))}
            </div>
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-lg border border-amber-700/50 text-amber-100 disabled:opacity-50">Prev</button>
                <span className="px-4 py-2 text-stone-400">Page {page} of {pagination.pages}</span>
                <button type="button" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-lg border border-amber-700/50 text-amber-100 disabled:opacity-50">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

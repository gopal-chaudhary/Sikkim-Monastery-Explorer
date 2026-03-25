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
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">Explore monasteries</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Filter by region, age, and sort by name, rating or visitors.</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="glass rounded-2xl p-5 sm:p-6 mb-8 flex flex-col sm:flex-row gap-3 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="input flex-1 min-w-[180px] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <select value={region} onChange={(e) => { setRegion(e.target.value); setPage(1); }} className="input sm:w-40 px-4 py-3 text-[var(--text-primary)] cursor-pointer">
            <option value="all">All regions</option>
            <option value="East Sikkim">East Sikkim</option>
            <option value="West Sikkim">West Sikkim</option>
            <option value="North Sikkim">North Sikkim</option>
            <option value="South Sikkim">South Sikkim</option>
          </select>
          <select value={age} onChange={(e) => { setAge(e.target.value); setPage(1); }} className="input sm:w-44 px-4 py-3 text-[var(--text-primary)] cursor-pointer">
            <option value="">Any age</option>
            <option value="< 200 years">&lt; 200 years</option>
            <option value="200-300 years">200-300 years</option>
            <option value="> 300 years">&gt; 300 years</option>
          </select>
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="input sm:w-36 px-4 py-3 text-[var(--text-primary)] cursor-pointer">
            <option value="name">Name</option>
            <option value="rating">Rating</option>
            <option value="visitors">Visitors</option>
            <option value="age">Age</option>
          </select>
          <button type="submit" className="btn-primary px-5 py-3 font-medium">Apply</button>
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
                className="mt-5 px-4 py-2 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent-primary)] hover:bg-[var(--accent-hover)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/40"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {monasteries.map((m) => (
                <Link key={m._id} to={`/monastery/${m._id}`} className="card group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                    <SmartImage
                      src={m.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600'}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      optimizeWidth={800}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass backdrop-blur-md border-[var(--accent-border)]">
                      <Star className="w-4 h-4 fill-[var(--accent-primary)] text-[var(--accent-primary)]" /> 
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{m.rating ?? '—'}</span>
                    </div>
                    
                    {/* Content Overlay on Hover */}
                    <div className="absolute bottom-4 left-4 right-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <h4 className="font-heading text-xl font-bold text-white mb-1">{m.name}</h4>
                      <p className="text-white/90 text-sm flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> 
                        {m.region || (m.location?.district || m.location?.village || m.location)} · Est. {m.established || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-[var(--bg-card)] rounded-b-2xl border border-[var(--border-primary)] border-t-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading text-lg font-bold text-[var(--text-primary)] mb-1">{m.name}</h4>
                        <p className="text-[var(--text-secondary)] text-sm flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> 
                          {m.region || (m.location?.district || m.location?.village || m.location)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--accent-primary)] group-hover:translate-x-1 transition-transform duration-300">
                        <span className="text-xs font-medium">View details</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-3 mt-8">
                <button 
                  type="button" 
                  disabled={page <= 1} 
                  onClick={() => setPage((p) => p - 1)} 
                  className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-[var(--text-secondary)] font-medium">Page {page} of {pagination.pages}</span>
                <button 
                  type="button" 
                  disabled={page >= pagination.pages} 
                  onClick={() => setPage((p) => p + 1)} 
                  className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

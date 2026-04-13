import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Navigation, Store } from 'lucide-react'
import { Layout } from '../components/Layout'
import { useMonasteries } from '../context/MonasteryContext'
import { locationAPI } from '../api'
import { EmptyState, ErrorState, OfflineBanner } from '../components/States'
import { SmartImage } from '../components/SmartImage'
import { InvalidateMapSize } from '../components/LeafletMapFix'

const DEFAULT_CENTER = [27.533, 88.512]
const SIKKIM_BOUNDS = [
  [26.8, 87.5], // Southwest corner (South, West)
  [28.5, 89.6]  // Northeast corner (North, East)
]

const TYPE_META = {
  Hotel: { symbol: '🏨', color: '#3b82f6', label: 'Hotel' },
  Restaurant: { symbol: '🍽️', color: '#ef4444', label: 'Restaurant' },
  Shop: { symbol: '🛍️', color: '#a855f7', label: 'Shop' },
  'Tourist Attraction': { symbol: '📸', color: '#f59e0b', label: 'Tourist Attraction' },
  'Food Court': { symbol: '🍜', color: '#f97316', label: 'Food Court' },
  Cafe: { symbol: '☕', color: '#14b8a6', label: 'Cafe' },
  Guesthouse: { symbol: '🏠', color: '#22c55e', label: 'Guesthouse' },
  Other: { symbol: '📍', color: '#10b981', label: 'Other' },
}

function getTypeMeta(type) {
  return TYPE_META[type] || TYPE_META.Other
}

function getLocationLabel(monastery) {
  if (typeof monastery.location === 'string') return monastery.location
  if (monastery.location && typeof monastery.location === 'object') {
    const values = Object.values(monastery.location).filter((v) => typeof v === 'string' && v.trim())
    if (values.length) return values.join(', ')
  }
  if (typeof monastery.region === 'string') return monastery.region
  return 'Sikkim, India'
}

export default function MapPage() {
  const { monasteries, loading: monasteryLoading, error: monasteryError, online, refetch } = useMonasteries()
  const [userLocations, setUserLocations] = useState([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [locationsError, setLocationsError] = useState(null)
  const [failedImages, setFailedImages] = useState(new Set())
  const [locationPage, setLocationPage] = useState(1)
  const [locationPagination, setLocationPagination] = useState(null)
  const businessLabel = userLocations.length === 1 ? 'business' : 'businesses'

  useEffect(() => {
    fetchUserLocations()
  }, [])

  const fetchUserLocations = async () => {
    try {
      setLoadingLocations(true)
      setLocationsError(null)
      const response = await locationAPI.getAllActiveLocations(1, 20)
      setUserLocations(response.data.data || [])
      setLocationPagination(response.data.pagination || null)
      setLocationPage(1)
    } catch (error) {
      console.error('Failed to fetch user locations:', error)
      setLocationsError('Could not load nearby businesses right now.')
    } finally {
      setLoadingLocations(false)
    }
  }

  const loadMoreLocations = async () => {
    try {
      setLoadingLocations(true)
      const nextPage = locationPage + 1
      const response = await locationAPI.getAllActiveLocations(nextPage, 20)
      setUserLocations(prev => [...prev, ...(response.data.data || [])])
      setLocationPagination(response.data.pagination || null)
      setLocationPage(nextPage)
    } catch (error) {
      console.error('Failed to load more locations:', error)
      setLocationsError('Could not load more businesses.')
    } finally {
      setLoadingLocations(false)
    }
  }

  const monasteryMarkers = useMemo(() => {
    return (monasteries || []).filter((m) => Number.isFinite(m?.coordinates?.latitude) && Number.isFinite(m?.coordinates?.longitude))
  }, [monasteries])

  const monasteriesWithoutCoordinates = useMemo(() => {
    return (monasteries || []).filter((m) => !Number.isFinite(m?.coordinates?.latitude) || !Number.isFinite(m?.coordinates?.longitude))
  }, [monasteries])

  const mapCenter = useMemo(() => {
    if (!monasteryMarkers.length && !userLocations.length) return DEFAULT_CENTER
    
    let totalLat = 0, totalLng = 0, count = 0
    
    monasteryMarkers.forEach(m => {
      totalLat += m.coordinates.latitude
      totalLng += m.coordinates.longitude
      count++
    })

    userLocations.forEach(loc => {
      if (loc.location && loc.location.coordinates) {
        totalLat += loc.location.coordinates[1]
        totalLng += loc.location.coordinates[0]
        count++
      }
    })

    return count > 0 ? [totalLat / count, totalLng / count] : DEFAULT_CENTER
  }, [monasteryMarkers, userLocations])

  const userLocationTypeCounts = useMemo(() => {
    return userLocations.reduce((acc, loc) => {
      const type = loc?.type || 'Other'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
  }, [userLocations])

  return (
    <Layout>
      {!online && <OfflineBanner onRetry={() => { refetch(); fetchUserLocations(); }} />}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-amber-50">Sikkim Map</h1>
          <p className="text-stone-400 mt-2">
            Explore monasteries and local businesses ({monasteryMarkers.length}/{monasteries.length || 0} monasteries, {userLocations.length} {businessLabel})
          </p>
        </div>

        {monasteryLoading || loadingLocations ? (
          <div className="glass rounded-2xl p-8 text-stone-300">Loading map data...</div>
        ) : monasteryError ? (
          <ErrorState title="Couldn’t load map data" message={monasteryError} onRetry={refetch} />
        ) : monasteryMarkers.length === 0 && userLocations.length === 0 ? (
          <EmptyState
            title="Nothing to show on the map yet"
            message="No monasteries with coordinates or nearby listings are available right now."
            action={
              <button
                type="button"
                onClick={() => { refetch(); fetchUserLocations(); }}
                className="mt-5 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-100 hover:bg-amber-500/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
              >
                Refresh
              </button>
            }
          />
        ) : (
          <div className="rounded-2xl overflow-hidden border border-amber-900/40 relative z-0" style={{ height: '70vh' }}>
            <MapContainer center={mapCenter} zoom={9} scrollWheelZoom maxBounds={SIKKIM_BOUNDS} maxBoundsViscosity={1.0} minZoom={8} maxZoom={14} className="h-full w-full">
              <InvalidateMapSize />
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Monastery Markers */}
              {monasteryMarkers.map((monastery) => {
                const hasValidImage = monastery.imageUrl && !failedImages.has(monastery._id)

                const customIcon = L.divIcon({
                  html: hasValidImage
                    ? `
                      <div class="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-lg cursor-pointer transform hover:scale-110 transition-transform">
                        <img src="${monastery.imageUrl}" alt="${monastery.name}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<div class=&quot;w-full h-full bg-amber-500&quot;></div>'" />
                      </div>
                    `
                    : `
                      <div class="w-12 h-12 rounded-full border-2 border-amber-400 shadow-lg cursor-pointer transform hover:scale-110 transition-transform" style="background-color: #f59e0b;"></div>
                    `,
                  iconSize: [48, 48],
                  className: 'custom-marker-icon',
                })

                return (
                  <Marker
                    key={monastery._id}
                    position={[monastery.coordinates.latitude, monastery.coordinates.longitude]}
                    icon={customIcon}
                  >
                    <Popup>
                      <div className="max-w-[230px] text-stone-900">
                        {monastery.imageUrl && !failedImages.has(monastery._id) && (
                          <SmartImage
                            src={monastery.imageUrl}
                            alt={monastery.name}
                            className="w-full h-32 object-cover rounded-md mb-2"
                            onError={() => setFailedImages(prev => new Set([...prev, monastery._id]))}
                            optimizeWidth={520}
                          />
                        )}
                        <p className="font-semibold text-sm">{monastery.name}</p>
                        <p className="text-xs mt-1">{getLocationLabel(monastery)}</p>
                        <p className="text-xs mt-1">Est. {monastery.established || 'N/A'}</p>
                        <Link to={`/monastery/${monastery._id}`} className="text-xs text-blue-700 underline mt-2 inline-block">
                          View details
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}

              {/* User Location Markers */}
              {userLocations.map((location) => {
                if (!location.location || !location.location.coordinates) return null

                const [lng, lat] = location.location.coordinates
                const typeMeta = getTypeMeta(location.type)

                const customIcon = L.divIcon({
                  html: `
                    <div class="w-10 h-10 rounded-full border-2 shadow-lg cursor-pointer transform hover:scale-110 transition-transform" style="border-color:${typeMeta.color}; background:linear-gradient(135deg, ${typeMeta.color} 0%, ${typeMeta.color}dd 100%); display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow: 0 2px 8px rgba(0,0,0,0.25);">
                      <span style="filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));">${typeMeta.symbol}</span>
                    </div>
                  `,
                  iconSize: [40, 40],
                  className: 'custom-location-icon',
                })

                return (
                  <Marker
                    key={location._id}
                    position={[lat, lng]}
                    icon={customIcon}
                  >
                    <Popup>
                      <div className="max-w-[230px] text-stone-900">
                        {location.imageUrl && !failedImages.has(location._id) && (
                          <SmartImage
                            src={location.imageUrl}
                            alt={location.name}
                            className="w-full h-32 object-cover rounded-md mb-2"
                            onError={() => setFailedImages(prev => new Set([...prev, location._id]))}
                            optimizeWidth={520}
                          />
                        )}
                        <p className="font-semibold text-sm">{location.name}</p>
                        <p className="text-xs font-medium" style={{ color: typeMeta.color }}>{typeMeta.symbol} {location.type || 'Other'}</p>
                        <p className="text-xs mt-1">{location.location.address}</p>
                        {location.phone && (
                          <p className="text-xs mt-1">Ph: {location.phone}</p>
                        )}
                        <Link to={`/location/${location._id}`} className="text-xs text-blue-700 underline mt-2 inline-block">
                          View details
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>
        )}

        <section className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="glass rounded-2xl p-5">
            <h2 className="font-heading text-xl text-amber-50 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Mapped Monasteries
            </h2>
            <p className="text-stone-400 text-sm mb-3">Monasteries with valid coordinates.</p>
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {monasteryMarkers.map((m) => (
                <li key={m._id} className="text-sm text-amber-100/90 flex items-center justify-between gap-3">
                  <span>{m.name}</span>
                  <Link to={`/monastery/${m._id}`} className="text-amber-400 hover:underline text-xs">Open</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="font-heading text-xl text-amber-50 mb-3 flex items-center gap-2">
              <Store className="w-5 h-5" /> Listed Businesses
            </h2>
            <p className="text-stone-400 text-sm mb-3">Active listings with their type.</p>
            {locationsError && (
              <div className="mb-3 text-xs text-rose-200/90 bg-rose-950/30 border border-rose-900/30 rounded-lg px-3 py-2">
                {locationsError}
              </div>
            )}
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {userLocations.length > 0 ? userLocations.map((location) => (
                <li key={location._id} className="text-sm text-emerald-100/90 flex items-center justify-between gap-3">
                  <span className="truncate">{getTypeMeta(location.type).symbol} {location.name}</span>
                  <Link to={`/location/${location._id}`} className="text-emerald-400 hover:underline text-xs flex-shrink-0">Open</Link>
                </li>
              )) : (
                <li className="text-sm text-stone-400">No listings yet.</li>
              )}
            </ul>
            {locationPagination && locationPage < locationPagination.pages && (
              <button
                onClick={loadMoreLocations}
                disabled={loadingLocations}
                className="mt-3 w-full px-4 py-2 bg-emerald-900/30 hover:bg-emerald-900/50 disabled:opacity-50 text-emerald-300 rounded-lg transition text-sm"
              >
                {loadingLocations ? 'Loading...' : `Load more (Page ${locationPage}/${locationPagination.pages})`}
              </button>
            )}
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="font-heading text-xl text-amber-50 mb-3 flex items-center gap-2">
              <Store className="w-5 h-5" /> Type
            </h2>
            <p className="text-stone-400 text-sm mb-3">Navigation legend by business type.</p>
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {Object.keys(userLocationTypeCounts).length > 0 ? Object.entries(userLocationTypeCounts).map(([type, count]) => {
                const meta = getTypeMeta(type)
                return (
                  <li key={type} className="text-sm text-amber-100/90 flex items-center justify-between gap-3">
                    <span>{meta.symbol} {meta.label}</span>
                    <span className="text-xs text-stone-300">{count}</span>
                  </li>
                )
              }) : (
                <li className="text-sm text-stone-400">No types available yet.</li>
              )}
            </ul>
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="font-heading text-xl text-amber-50 mb-3 flex items-center gap-2">
              <Navigation className="w-5 h-5" /> Missing Coordinates
            </h2>
            <p className="text-stone-400 text-sm mb-3">These are shown in list view until coordinates are added.</p>
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {monasteriesWithoutCoordinates.length > 0 ? monasteriesWithoutCoordinates.map((m) => (
                <li key={m._id} className="text-sm text-stone-300 flex items-center justify-between gap-3">
                  <span>{m.name}</span>
                  <Link to={`/monastery/${m._id}`} className="text-amber-400 hover:underline text-xs">Open</Link>
                </li>
              )) : (
                <li className="text-sm text-stone-400">All monasteries have coordinates.</li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  )
}

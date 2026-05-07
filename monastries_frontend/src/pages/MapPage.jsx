import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Navigation } from 'lucide-react'
import { Layout } from '../components/Layout'
import { useMonasteries } from '../context/MonasteryContext'
import { EmptyState, ErrorState, OfflineBanner } from '../components/States'
import { SmartImage } from '../components/SmartImage'
import { InvalidateMapSize } from '../components/LeafletMapFix'

const DEFAULT_CENTER = [27.533, 88.512]
const SIKKIM_BOUNDS = [
  [26.8, 87.5], // Southwest corner (South, West)
  [28.5, 89.6]  // Northeast corner (North, East)
]

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
  const [failedImages, setFailedImages] = useState(new Set())

  const monasteryMarkers = useMemo(() => {
    return (monasteries || []).filter((m) => Number.isFinite(m?.coordinates?.latitude) && Number.isFinite(m?.coordinates?.longitude))
  }, [monasteries])

  const monasteriesWithoutCoordinates = useMemo(() => {
    return (monasteries || []).filter((m) => !Number.isFinite(m?.coordinates?.latitude) || !Number.isFinite(m?.coordinates?.longitude))
  }, [monasteries])

  const mapCenter = useMemo(() => {
    if (!monasteryMarkers.length) return DEFAULT_CENTER
    
    let totalLat = 0, totalLng = 0
    
    monasteryMarkers.forEach(m => {
      totalLat += m.coordinates.latitude
      totalLng += m.coordinates.longitude
    })

    return [totalLat / monasteryMarkers.length, totalLng / monasteryMarkers.length]
  }, [monasteryMarkers])

  return (
    <Layout>
      {!online && <OfflineBanner onRetry={refetch} />}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-amber-50">Sikkim Monasteries Map</h1>
          <p className="text-stone-400 mt-2">
            Explore {monasteryMarkers.length} monasteries across Sikkim
          </p>
        </div>

        {monasteryLoading ? (
          <div className="glass rounded-2xl p-8 text-stone-300">Loading monasteries...</div>
        ) : monasteryError ? (
          <ErrorState title="Couldn't load monasteries" message={monasteryError} onRetry={refetch} />
        ) : monasteryMarkers.length === 0 ? (
          <EmptyState
            title="No monasteries to display"
            message="No monasteries with coordinates are available right now."
            action={
              <button
                type="button"
                onClick={refetch}
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
            </MapContainer>
          </div>
        )}

        <section className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-5">
            <h2 className="font-heading text-xl text-amber-50 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Mapped Monasteries
            </h2>
            <p className="text-stone-400 text-sm mb-3">Monasteries with valid coordinates shown on the map.</p>
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {monasteryMarkers.map((m) => (
                <li key={m._id} className="text-sm text-amber-100/90 flex items-center justify-between gap-3">
                  <span className="truncate">{m.name}</span>
                  <Link to={`/monastery/${m._id}`} className="text-amber-400 hover:underline text-xs flex-shrink-0">View</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="font-heading text-xl text-amber-50 mb-3 flex items-center gap-2">
              <Navigation className="w-5 h-5" /> Missing Coordinates
            </h2>
            <p className="text-stone-400 text-sm mb-3">These monasteries need coordinates to appear on the map.</p>
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {monasteriesWithoutCoordinates.length > 0 ? monasteriesWithoutCoordinates.map((m) => (
                <li key={m._id} className="text-sm text-stone-300 flex items-center justify-between gap-3">
                  <span className="truncate">{m.name}</span>
                  <Link to={`/monastery/${m._id}`} className="text-amber-400 hover:underline text-xs flex-shrink-0">View</Link>
                </li>
              )) : (
                <li className="text-sm text-emerald-400">✓ All monasteries have coordinates!</li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  )
}

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { MapPin, Star, Hotel, Compass, BookOpen, Users, Church, Sparkles, Mountain, Clock, AlertTriangle, UserCircle, Phone, Mail, DollarSign, Award, Briefcase, Languages } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { api, getErrorMessage, locationAPI, guideAPI } from '../api'
import { Layout } from '../components/Layout'
import ReviewSection from '../components/ReviewSection'
import { SkeletonDetail } from '../components/SkeletonCard'
import { SmartImage } from '../components/SmartImage'
import { ErrorState, OfflineBanner } from '../components/States'

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

export default function MonasteryDetail() {
  const { id } = useParams()
  const [monastery, setMonastery] = useState(null)
  const [travelGuide, setTravelGuide] = useState(null)
  const [userLocations, setUserLocations] = useState([])
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [guideLoading, setGuideLoading] = useState(false)
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true

  useEffect(() => {
    let cancelled = false
    async function fetchMonastery() {
      try {
        setError(null)
        const { data } = await api.get(`/monasteries/${id}`)
        if (!cancelled) setMonastery(data.data)
      } catch (err) {
        if (!cancelled) {
          const message = getErrorMessage(err)
          setError(message)
          toast.error(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (id) fetchMonastery()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!monastery) return
    let cancelled = false
    setGuideLoading(true)
    api.get(`/monasteries/${id}/travel-guide`)
      .then(({ data }) => { if (!cancelled) setTravelGuide(data.data) })
      .catch(() => { if (!cancelled) setTravelGuide(null) })
      .finally(() => { if (!cancelled) setGuideLoading(false) })
    return () => { cancelled = true }
  }, [id, monastery])

  useEffect(() => {
    let cancelled = false
    async function fetchUserLocations() {
      try {
        const response = await locationAPI.getAllActiveLocations()
        if (!cancelled) setUserLocations(response.data?.data || response.data || [])
      } catch (error) {
        console.error('Failed to fetch user locations:', error)
      }
    }
    fetchUserLocations()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function fetchGuides() {
      try {
        const response = await guideAPI.getGuidesByMonastery(id)
        if (!cancelled) setGuides(response.data?.data || [])
      } catch (error) {
        console.error('Failed to fetch guides:', error)
      }
    }
    fetchGuides()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <Layout>
        {!online && <OfflineBanner onRetry={() => window.location.reload()} />}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <SkeletonDetail />
        </div>
      </Layout>
    )
  }

  if (!monastery) {
    return (
      <Layout>
        {!online && <OfflineBanner onRetry={() => window.location.reload()} />}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <ErrorState
            title="Monastery not found"
            message={error || 'This monastery may have been removed or the link is incorrect.'}
            onRetry={() => window.location.reload()}
          />
        </div>
      </Layout>
    )
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: monastery.name,
    description: monastery.description,
    image: monastery.imageUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: monastery.location?.district || monastery.location?.village || '',
      addressRegion: monastery.location?.state || monastery.region || 'Sikkim',
      addressCountry: 'IN',
    },
    geo: monastery.coordinates?.latitude && monastery.coordinates?.longitude
      ? {
          '@type': 'GeoCoordinates',
          latitude: monastery.coordinates.latitude,
          longitude: monastery.coordinates.longitude,
        }
      : undefined,
    sameAs: monastery.link || undefined,
    aggregateRating: monastery.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: monastery.rating,
          bestRating: 5,
          ratingCount: monastery.reviewCount || 1,
        }
      : undefined,
  }

  return (
    <Layout>
      {!online && <OfflineBanner onRetry={() => window.location.reload()} />}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-primary)] mb-8">
          <div className="relative aspect-[21/9] sm:aspect-[3/1]">
            <SmartImage
              src={monastery.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200'}
              alt={monastery.name}
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
              optimizeWidth={1400}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[var(--accent-primary)] text-[var(--bg-primary)] text-xs font-semibold">{monastery.region}</span>
              <span className="flex items-center gap-1 text-[var(--accent-primary)] text-sm"><Star className="w-4 h-4 fill-[var(--accent-primary)]" /> {monastery.rating}</span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">{monastery.name}</h1>
            <p className="text-[var(--text-secondary)] mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> 
              {monastery.location?.district || monastery.location?.village || monastery.region || 'Sikkim'}
              {monastery.location?.state && `, ${monastery.location.state}`}
            </p>
            
            {monastery.link && (
              <a href={monastery.link} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:text-[var(--accent-hover)] text-sm mt-1 inline-flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Wikipedia Article
              </a>
            )}
            
            <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">{monastery.description}</p>
            
            {/* Quick Info */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {monastery.established && (
                <div><p className="text-[var(--text-muted)]">Established</p><p className="text-[var(--text-primary)] font-medium">{monastery.established}</p></div>
              )}
              {monastery.foundedBy && (
                <div><p className="text-[var(--text-muted)]">Founded By</p><p className="text-[var(--text-primary)] font-medium">{monastery.foundedBy}</p></div>
              )}
              {monastery.sect && (
                <div><p className="text-[var(--text-muted)]">Sect</p><p className="text-[var(--text-primary)] font-medium">{monastery.sect}</p></div>
              )}
              {monastery.monks && (
                <div><p className="text-[var(--text-muted)] flex items-center gap-1"><Users className="w-3 h-3" /> Monks</p><p className="text-[var(--text-primary)] font-medium">{monastery.monks}</p></div>
              )}
              <div><p className="text-[var(--text-muted)]">Opening</p><p className="text-[var(--text-primary)] font-medium">{monastery.openingHours || '—'}</p></div>
              <div><p className="text-[var(--text-muted)]">Entry</p><p className="text-[var(--text-primary)] font-medium">{monastery.entryFee || 'Free'}</p></div>
              <div><p className="text-[var(--text-muted)]">Best time</p><p className="text-[var(--text-primary)] font-medium">{monastery.bestTimeToVisit || '—'}</p></div>
              {monastery.altitude && (
                <div><p className="text-[var(--text-muted)] flex items-center gap-1"><Mountain className="w-3 h-3" /> Altitude</p><p className="text-[var(--text-primary)] font-medium">{monastery.altitude}m</p></div>
              )}
            </div>
            
            <div className="mt-5">
              <Link
                to={`/monastery/${id}/wiki`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--accent-border)] transition"
              >
                <BookOpen className="w-4 h-4" />
                Explore Wikipedia details & nearby hotels
              </Link>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {(monastery.features || []).map((f, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent-primary)] text-xs border border-[var(--accent-border)]">{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 mb-8">
          
          {/* History Section */}
          {monastery.history && Object.keys(monastery.history).length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" /> History
              </h2>
              <div className="space-y-3 text-[var(--text-secondary)]">
                {Object.entries(monastery.history).map(([key, value]) => (
                  <div key={key}>
                    <h3 className="text-[var(--accent-primary)] font-semibold text-sm capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1').replace(/(\d+)/g, ' $1').trim()}
                    </h3>
                    <p className="text-sm leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Architecture Section */}
          {monastery.architecture && Object.keys(monastery.architecture).length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Church className="w-5 h-5" /> Architecture
              </h2>
              <div className="space-y-3 text-[var(--text-secondary)]">
                {monastery.architectureStyle && (
                  <div>
                    <p className="text-[var(--accent-primary)] font-semibold text-sm mb-1">Style</p>
                    <p className="text-sm">{monastery.architectureStyle}</p>
                  </div>
                )}
                {Object.entries(monastery.architecture).map(([key, value]) => {
                  if (Array.isArray(value)) {
                    return (
                      <div key={key}>
                        <p className="text-[var(--accent-primary)] font-semibold text-sm mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {value.map((item, i) => (
                            <li key={i} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return (
                    <div key={key}>
                      <p className="text-[var(--accent-primary)] font-semibold text-sm mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm leading-relaxed">{value}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Festivals Section */}
          {monastery.festivals && monastery.festivals.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Festivals & Celebrations
              </h2>
              <div className="space-y-4">
                {monastery.festivals.map((festival, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
                    <h3 className="text-[var(--accent-primary)] font-semibold mb-1">{festival.name}</h3>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{festival.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Deities Worshipped */}
          {monastery.deitiesWorshipped && monastery.deitiesWorshipped.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4">Deities Worshipped</h2>
              <div className="flex flex-wrap gap-2">
                {monastery.deitiesWorshipped.map((deity, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-[var(--accent-bg)] text-[var(--accent-primary)] text-sm border border-[var(--accent-border)]">
                    {deity}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Cultural Significance */}
          {monastery.culturalSignificance && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4">Cultural Significance</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">{monastery.culturalSignificance}</p>
            </section>
          )}

          {/* Infrastructure */}
          {monastery.infrastructure && Object.keys(monastery.infrastructure).length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4">Infrastructure & Facilities</h2>
              <div className="space-y-3 text-[var(--text-secondary)]">
                {Object.entries(monastery.infrastructure).map(([key, value]) => {
                  if (Array.isArray(value)) {
                    return (
                      <div key={key}>
                        <p className="text-[var(--accent-primary)] font-semibold text-sm mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {value.map((item, i) => (
                            <li key={i} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return (
                    <div key={key}>
                      <p className="text-[var(--accent-primary)] font-semibold text-sm mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm">{value}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Earthquake Damage / Restoration */}
          {(monastery.earthquakeDamage || monastery.restoration) && (
            <section className="glass rounded-2xl p-6 border-l-4 border-[var(--accent-primary)]">
              <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Conservation & Restoration
              </h2>
              <div className="space-y-3 text-[var(--text-secondary)]">
                {monastery.earthquakeDamage && (
                  <div>
                    <p className="text-[var(--accent-primary)] font-semibold text-sm mb-2">Earthquake Damage</p>
                    {typeof monastery.earthquakeDamage === 'object' ? (
                      Object.entries(monastery.earthquakeDamage).map(([key, value]) => (
                        <p key={key} className="text-sm leading-relaxed mb-2">
                          <span className="font-medium">{key}:</span> {value}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm leading-relaxed">{monastery.earthquakeDamage}</p>
                    )}
                  </div>
                )}
                {monastery.restoration && (
                  <div>
                    <p className="text-[var(--accent-primary)] font-semibold text-sm mb-2">Restoration</p>
                    {typeof monastery.restoration === 'object' && monastery.restoration.info ? (
                      <p className="text-sm leading-relaxed">{monastery.restoration.info}</p>
                    ) : (
                      <p className="text-sm leading-relaxed">{monastery.restoration}</p>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Nearby Attractions */}
          {monastery.nearbyAttractions && monastery.nearbyAttractions.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4">Nearby Attractions</h2>
              <div className="flex flex-wrap gap-2">
                {monastery.nearbyAttractions.map((attraction, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm border border-[var(--border-primary)]">
                    {attraction}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Map Section */}
        {monastery.coordinates?.latitude && monastery.coordinates?.longitude && (
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Location & Nearby Places
            </h2>
            <div className="rounded-2xl overflow-hidden border border-[var(--border-primary)] relative z-0" style={{ height: '50vh', minHeight: '400px' }}>
              <MapContainer 
                center={[monastery.coordinates.latitude, monastery.coordinates.longitude]} 
                zoom={12} 
                scrollWheelZoom 
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* This Monastery Marker */}
                <Marker 
                  position={[monastery.coordinates.latitude, monastery.coordinates.longitude]}
                  icon={L.divIcon({
                    html: `
                      <div class="w-12 h-12 rounded-full border-3 border-[var(--accent-primary)] overflow-hidden shadow-xl cursor-pointer transform hover:scale-110 transition-transform">
                        <img src="${monastery.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=200'}" alt="${monastery.name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'w-full h-full bg-[var(--accent-primary)] flex items-center justify-center text-2xl\\'>🏛️</div>'" />
                      </div>
                    `,
                    iconSize: [48, 48],
                    className: 'monastery-icon',
                  })}
                >
                  <Popup>
                    <div className="text-sm max-w-xs">
                      <p className="font-semibold text-[var(--accent-primary)] mb-1">{monastery.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{monastery.location?.district || monastery.location?.village || 'Sikkim'}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* User Locations (Businesses) */}
                {userLocations.map((location) => {
                  if (!location.location?.coordinates?.[1] || !location.location?.coordinates?.[0]) return null
                  const typeMeta = getTypeMeta(location.type)
                  
                  return (
                    <Marker
                      key={location._id}
                      position={[location.location.coordinates[1], location.location.coordinates[0]]}
                      icon={L.divIcon({
                        html: `
                          <div class="w-10 h-10 rounded-full border-2 shadow-lg cursor-pointer transform hover:scale-110 transition-transform" style="border-color:${typeMeta.color}; background:linear-gradient(135deg, ${typeMeta.color} 0%, ${typeMeta.color}dd 100%); display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow: 0 2px 8px rgba(0,0,0,0.25);">
                            <span style="filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));">${typeMeta.symbol}</span>
                          </div>
                        `,
                        iconSize: [40, 40],
                        className: 'custom-location-icon',
                      })}
                    >
                      <Popup>
                        <div className="text-sm max-w-xs">
                          {location.imageUrl && (
                            <SmartImage
                              src={location.imageUrl}
                              alt={location.name}
                              className="w-full h-24 object-cover rounded mb-2"
                              optimizeWidth={500}
                            />
                          )}
                          <p className="font-semibold text-sm">{location.name}</p>
                          <p className="text-xs font-medium" style={{ color: typeMeta.color }}>{typeMeta.symbol} {location.type || 'Other'}</p>
                          <p className="text-xs mt-1">{location.location.address}</p>
                          {location.phone && (
                            <p className="text-xs mt-1">Ph: {location.phone}</p>
                          )}
                          <Link to={`/location/${location._id}`} className="text-xs text-[var(--accent-primary)] underline mt-2 inline-block">
                            View details
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            </div>
            <p className="text-[var(--text-muted)] text-xs mt-2">
              {userLocations.length} nearby {userLocations.length === 1 ? 'business' : 'businesses'} shown on map
            </p>
          </section>
        )}

        {/* Travel guide */}
        <section className="mb-8">
          <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2"><Compass className="w-5 h-5" /> Travel guide</h2>
          {guideLoading && <p className="text-[var(--text-muted)] text-sm">Loading travel info...</p>}
          {travelGuide && !guideLoading && (
            <div className="glass rounded-2xl p-6 space-y-4">
              {travelGuide.recommendedHotel && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]">
                  <Hotel className="w-5 h-5 text-[var(--accent-primary)] mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Recommended stay: {travelGuide.recommendedHotel.name}</p>
                    <p className="text-[var(--text-muted)] text-sm">{travelGuide.recommendedHotel.reason}</p>
                  </div>
                </div>
              )}
              {travelGuide.hotels && travelGuide.hotels.length > 0 && (
                <div>
                  <p className="text-[var(--text-muted)] text-sm mb-2">Nearby hotels ({travelGuide.hotels.length})</p>
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {travelGuide.hotels.slice(0, 5).map((h, i) => (
                      <li key={i} className="text-sm text-[var(--text-primary)]">{h.name} — {h.distance?.text || '—'} · {h.rating}/5</li>
                    ))}
                  </ul>
                </div>
              )}
              {travelGuide.travelTips && (
                <div>
                  <p className="text-[var(--text-muted)] text-sm mb-1">Tips</p>
                  <p className="text-sm text-[var(--text-primary)]">{travelGuide.travelTips.thingsToCarry?.join(', ')}</p>
                </div>
              )}
            </div>
          )}
          {!travelGuide && !guideLoading && <p className="text-[var(--text-muted)] text-sm">Travel guide not available for this monastery.</p>}
        </section>

        {/* Reviews Section */}
        <div className="mb-8">
          <ReviewSection monasteryId={id} />
        </div>

        {/* Tourist Guides Section */}
        {guides && guides.length > 0 && (
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5" /> Available Tourist Guides
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              Connect with verified local guides who specialize in this monastery and surrounding areas.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guides.map((guide) => (
                <div key={guide._id} className="glass rounded-2xl p-5 border border-[var(--border-primary)] hover:border-[var(--accent-border)] transition">
                  <div className="flex items-start gap-4">
                    {guide.profilePhoto ? (
                      <SmartImage
                        src={guide.profilePhoto}
                        alt={guide.guideName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[var(--accent-primary)]"
                        optimizeWidth={160}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[var(--accent-bg)] flex items-center justify-center border-2 border-[var(--accent-primary)]">
                        <UserCircle className="w-10 h-10 text-[var(--accent-primary)]" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-[var(--text-primary)]">{guide.guideName}</h3>
                        {guide.isVerified && (
                          <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20">
                            <Award className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      
                      {guide.rating?.average > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-[var(--accent-primary)] text-[var(--accent-primary)]" />
                          <span className="text-sm text-[var(--accent-primary)]">{guide.rating.average.toFixed(1)}</span>
                          <span className="text-xs text-[var(--text-muted)]">({guide.rating.count} reviews)</span>
                        </div>
                      )}
                      
                      <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{guide.bio}</p>
                      
                      <div className="space-y-1 text-xs text-[var(--text-muted)] mb-3">
                        <p className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {guide.experience} years experience
                        </p>
                        {guide.languages && guide.languages.length > 0 && (
                          <p className="flex items-center gap-1">
                            <Languages className="w-3 h-3" /> {guide.languages.slice(0, 3).join(', ')}
                          </p>
                        )}
                      </div>
                      
                      {guide.pricing && (
                        <div className="flex items-center gap-2 mb-3 text-xs">
                          <span className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)]">
                            <DollarSign className="w-3 h-3 inline" />₹{guide.pricing.hourlyRate}/hr
                          </span>
                          <span className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)]">
                            ₹{guide.pricing.fullDayRate}/day
                          </span>
                        </div>
                      )}
                      
                      <div className="space-y-1 text-xs">
                        {guide.contactInfo?.phone && (
                          <a
                            href={`tel:${guide.contactInfo.phone}`}
                            className="flex items-center gap-1 text-[var(--accent-primary)] hover:text-[var(--accent-hover)]"
                          >
                            <Phone className="w-3 h-3" /> {guide.contactInfo.phone}
                          </a>
                        )}
                        {guide.contactInfo?.email && (
                          <a
                            href={`mailto:${guide.contactInfo.email}`}
                            className="flex items-center gap-1 text-[var(--accent-primary)] hover:text-[var(--accent-hover)]"
                          >
                            <Mail className="w-3 h-3" /> {guide.contactInfo.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}

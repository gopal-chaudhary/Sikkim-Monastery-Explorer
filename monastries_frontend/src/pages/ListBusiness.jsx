import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { MapPin, Upload, CheckCircle, AlertCircle, Locate, DollarSign, Building2 } from 'lucide-react'
import { Layout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { locationAPI, getErrorMessage } from '../api'
import { MapContainer, TileLayer, Marker, useMapEvent } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function ListBusiness() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Details, 2: Location, 3: Subscription
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Hotel',
    description: '',
    phone: '',
    website: '',
    hours: '',
    address: '',
    imageUrl: ''
  })

  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: ''
  })

  const [imagePreview, setImagePreview] = useState(null)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [mapCenter, setMapCenter] = useState([27.5, 88.5]) // Sikkim center
  const [mapKey, setMapKey] = useState(0) // Force map re-render

  const [subscriptionData, setSubscriptionData] = useState({
    planType: 'monthly',
    autopayDate: new Date().getDate(),
    termsAccepted: false
  })

  // Debounce map update when typing coordinates
  useEffect(() => {
    if (locationData.latitude && locationData.longitude) {
      const lat = parseFloat(locationData.latitude)
      const lng = parseFloat(locationData.longitude)
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        const timer = setTimeout(() => {
          setMapCenter([lat, lng])
          setMapKey(prev => prev + 1) // Force map to update
        }, 800) // 800ms delay after user stops typing
        
        return () => clearTimeout(timer)
      }
    }
  }, [locationData.latitude, locationData.longitude])

  const locationTypes = [
    'Hotel',
    'Restaurant',
    'Shop',
    'Tourist Attraction',
    'Food Court',
    'Cafe',
    'Guesthouse',
    'Other'
  ]

  useEffect(() => {
    if (!user) {
      toast.info('Please log in to list a business')
      navigate('/login')
      return
    }
  }, [user, navigate])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setFormData(prev => ({ ...prev, imageUrl: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported')
      return
    }
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6)
        const lng = position.coords.longitude.toFixed(6)
        setLocationData({ latitude: lat, longitude: lng })
        setMapCenter([lat, lng])
        setDetectingLocation(false)
        toast.success('Location detected!')
      },
      () => {
        setDetectingLocation(false)
        toast.error('Failed to detect location')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const validateStep1 = () => {
    if (!formData.name.trim() || formData.name.length < 3) {
      toast.error('Business name must be at least 3 characters')
      return false
    }
    if (!formData.description.trim() || formData.description.length < 20) {
      toast.error('Description must be at least 20 characters')
      return false
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required')
      return false
    }
    if (!formData.address.trim()) {
      toast.error('Address is required')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!locationData.latitude || !locationData.longitude) {
      toast.error('Please select location on map or detect your location')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!subscriptionData.termsAccepted) {
      toast.error('Please accept the terms and conditions')
      return
    }

    setLoading(true)
    try {
      // Create location
      await locationAPI.createLocation({
        name: formData.name,
        type: formData.type,
        description: formData.description,
        phone: formData.phone,
        website: formData.website,
        hours: formData.hours,
        address: formData.address,
        coordinates: [parseFloat(locationData.longitude), parseFloat(locationData.latitude)],
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        acceptTerms: subscriptionData.termsAccepted,
        planType: subscriptionData.planType
      })
      toast.success('Business listed successfully!')

      // Navigate to my locations
      navigate('/my-locations')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  // Map component for step 2
  function MapPicker() {
    useMapEvent('click', (e) => {
      setLocationData({
        latitude: e.latlng.lat.toFixed(6),
        longitude: e.latlng.lng.toFixed(6)
      })
      setMapCenter([e.latlng.lat, e.latlng.lng])
    })
    return locationData.latitude && locationData.longitude ? (
      <Marker position={[parseFloat(locationData.latitude), parseFloat(locationData.longitude)]} />
    ) : null
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-amber-50 mb-2">
            List Your Business
          </h1>
          <p className="text-stone-400">
            Add your hotel, restaurant, or shop to reach more visitors
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                  step >= s
                    ? 'bg-amber-500 text-stone-900'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 transition ${
                    step > s ? 'bg-amber-500' : 'bg-stone-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Business Details */}
        {step === 1 && (
          <div className="glass rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-amber-50 flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Business Details
            </h2>

            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Business Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Your business name"
              />
            </div>

            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                {locationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Description * (min 20 characters)</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Describe your business..."
              />
              <p className="text-xs text-stone-500 mt-1">{formData.description.length} characters</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-amber-200/90 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-amber-200/90 mb-1">Website (optional)</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Business address"
              />
            </div>

            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Hours (optional)</label>
              <input
                type="text"
                value={formData.hours}
                onChange={(e) => handleInputChange('hours', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="e.g., 9AM - 6PM"
              />
            </div>

            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Business Image (optional)</label>
              <div className="border-2 border-dashed border-amber-900/50 rounded-xl p-6 text-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover mx-auto rounded-lg mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-stone-500 mx-auto mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="text-amber-300 hover:text-amber-200 cursor-pointer text-sm">
                  Click to upload or drag & drop (max 5MB)
                </label>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition"
            >
              Next: Add Location
            </button>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="glass rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-amber-50 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Location on Map
            </h2>
            <p className="text-stone-400 text-sm">
              Click on the map to set your business location or use auto-detect
            </p>

            <button
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-900/50 text-blue-100 border border-blue-700/50 hover:bg-blue-900/70 transition disabled:opacity-50"
            >
              <Locate className="w-4 h-4" />
              {detectingLocation ? 'Detecting...' : 'Auto-Detect Location'}
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-amber-200/90 mb-1">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  value={locationData.latitude}
                  onChange={(e) => {
                    setLocationData(prev => ({ ...prev, latitude: e.target.value }))
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="27.335480"
                />
              </div>
              <div>
                <label className="block text-sm text-amber-200/90 mb-1">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  value={locationData.longitude}
                  onChange={(e) => {
                    setLocationData(prev => ({ ...prev, longitude: e.target.value }))
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="88.613892"
                />
              </div>
            </div>

            {locationData.latitude && locationData.longitude && (
              <div className="p-3 rounded-xl bg-green-900/30 border border-green-700/50">
                <p className="text-green-100 text-sm">
                  ✅ Location selected: {locationData.latitude}, {locationData.longitude}
                </p>
              </div>
            )}

            <div style={{ height: '400px' }} className="rounded-xl overflow-hidden border border-amber-900/40">
              <MapContainer key={mapKey} center={mapCenter} zoom={11} scrollWheelZoom className="h-full w-full">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapPicker />
              </MapContainer>
            </div>

            <p className="text-xs text-stone-400 text-center">
              Click on the map to select your business location
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-300 font-semibold hover:bg-stone-700 transition"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition"
              >
                Next: Subscription
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Subscription */}
        {step === 3 && (
          <div className="glass rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-amber-50 flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Subscription Plan
            </h2>

            <div className="space-y-3">
              {[
                { type: 'monthly', label: 'Monthly', price: '₹99/month' },
                { type: 'quarterly', label: 'Quarterly', price: '₹249/3 months (Save 16%)' },
                { type: 'annual', label: 'Annual', price: '₹999/year (Save 16%)' }
              ].map((plan) => (
                <button
                  key={plan.type}
                  type="button"
                  onClick={() => setSubscriptionData(prev => ({ ...prev, planType: plan.type }))}
                  className={`w-full p-4 rounded-xl border transition text-left ${
                    subscriptionData.planType === plan.type
                      ? 'bg-amber-900/30 border-amber-700/70'
                      : 'bg-stone-900/60 border-stone-700/50 hover:border-amber-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-amber-100">{plan.label}</p>
                      <p className="text-sm text-stone-400">{plan.price}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        subscriptionData.planType === plan.type
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-stone-600'
                      }`}
                    >
                      {subscriptionData.planType === plan.type && (
                        <div className="w-2.5 h-2.5 rounded-full bg-stone-900" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-stone-900/60 border border-amber-900/40 rounded-xl p-4">
              <h3 className="font-semibold text-amber-100 mb-2">What's Included:</h3>
              <ul className="space-y-1 text-sm text-stone-300">
                <li>• Listing on monastery visitor maps</li>
                <li>• Direct contact information display</li>
                <li>• Business analytics & views tracking</li>
                <li>• Priority placement for top-rated businesses</li>
                <li>• Customer reviews and ratings</li>
              </ul>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={subscriptionData.termsAccepted}
                onChange={(e) => setSubscriptionData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                className="mt-1 w-4 h-4 rounded border-amber-900/50 bg-stone-900/80"
              />
              <label htmlFor="terms" className="text-sm text-stone-300">
                I accept the terms and conditions, and agree to pay the subscription fee to maintain my business listing
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-300 font-semibold hover:bg-stone-700 transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !subscriptionData.termsAccepted}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Complete Listing'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

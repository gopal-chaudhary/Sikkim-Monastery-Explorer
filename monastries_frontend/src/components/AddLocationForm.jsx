import { useState } from 'react'
import { MapPin, Upload, AlertCircle, Locate } from 'lucide-react'
import { toast } from 'react-toastify'
import { locationAPI } from '../api'

export default function AddLocationForm({ onSuccess, onClose }) {
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
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)

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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6)
        const lng = position.coords.longitude.toFixed(6)
        setLatitude(lat)
        setLongitude(lng)
        setDetectingLocation(false)
        toast.success('Location detected successfully!')
      },
      (error) => {
        setDetectingLocation(false)
        let message = 'Failed to detect location'
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied. Please enable location access.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information unavailable.'
        }
        toast.error(message)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter location name')
      return
    }

    if (formData.description.length < 20) {
      toast.error('Description must be at least 20 characters')
      return
    }

    if (!formData.phone.trim()) {
      toast.error('Please enter phone number')
      return
    }

    if (!formData.address.trim()) {
      toast.error('Please enter address')
      return
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Please provide valid latitude and longitude')
      return
    }

    if (!formData.imageUrl) {
      toast.error('Please upload an image')
      return
    }

    if (!acceptTerms) {
      toast.error('Please accept subscription terms')
      return
    }

    setLoading(true)
    try {
      const response = await locationAPI.createLocation({
        ...formData,
        coordinates: [lng, lat],
        acceptTerms: true
      })

      toast.success('Location submitted successfully! Pending admin approval.')
      setFormData({
        name: '',
        type: 'Hotel',
        description: '',
        phone: '',
        website: '',
        hours: '',
        address: '',
        imageUrl: ''
      })
      setLatitude('')
      setLongitude('')
      setImagePreview(null)
      setAcceptTerms(false)

      if (onSuccess) {
        onSuccess(response.data)
      }
      if (onClose) {
        setTimeout(onClose, 2000)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create location')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-stone-900 rounded-lg border border-amber-900/30 p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-amber-50 mb-6">List Your Business</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-amber-200 mb-2">Business Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Mountain View Hotel"
              className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-amber-200 mb-2">Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500/50"
              required
            >
              {locationTypes.map(type => (
                <option key={type} value={type} className="bg-stone-800">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-amber-200 mb-2">
            Description * (min 20 characters)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your business, amenities, specialty, etc."
            rows="4"
            className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 placeholder-stone-500 focus:outline-none focus:border-amber-500/50 resize-none"
            required
            minLength="20"
          />
          <p className="text-xs text-stone-400 mt-1">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-amber-200 mb-2">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+91 XXXXX XXXXX"
              className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-amber-200 mb-2">Website (Optional)</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Address and Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-amber-200 mb-2">Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Complete address"
              className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-amber-200 mb-2">Hours (Optional)</label>
            <input
              type="text"
              name="hours"
              value={formData.hours}
              onChange={handleInputChange}
              placeholder="e.g., 9AM - 6PM"
              className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Location Coordinates */}
        <div>
          <label className="block text-sm text-amber-200 mb-2">Location Coordinates *</label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude (e.g., 27.3314)"
                  className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude (e.g., 88.6138)"
                  className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600/20 border border-amber-600/50 rounded-lg text-amber-100 hover:bg-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Locate className="w-5 h-5" />
              {detectingLocation ? 'Detecting...' : 'Use My Current Location'}
            </button>
            <p className="text-xs text-stone-400">
              Click to auto-detect your location or enter coordinates manually
            </p>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm text-amber-200 mb-2">Business Photo *</label>
          <div className="border-2 border-dashed border-amber-900/30 rounded-lg p-6 text-center hover:border-amber-500/50 transition">
            {imagePreview ? (
              <div className="space-y-3">
                <img src={imagePreview} alt="Preview" className="h-40 mx-auto rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => document.getElementById('imageInput').click()}
                  className="text-sm text-amber-400 hover:text-amber-300"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div className="space-y-3 py-6">
                <Upload className="w-10 h-10 mx-auto text-amber-600" />
                <div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('imageInput').click()}
                    className="text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Click to upload
                  </button>
                  <p className="text-xs text-stone-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            )}
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-100">
              <p className="font-semibold mb-2">Monthly Subscription Required</p>
              <p className="text-amber-200/80 mb-3">
                Your location will be listed on our map with automatic monthly renewal.
              </p>
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-amber-400 hover:text-amber-300 underline text-sm"
              >
                Read subscription terms
              </button>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer mt-4">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-5 h-5 rounded border-amber-500/50 accent-amber-500"
            />
            <span className="text-sm text-amber-100">
              I accept the subscription terms and authorize monthly charges
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !acceptTerms}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-rose-600 text-amber-50 rounded-lg font-medium hover:from-amber-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-stone-800 text-amber-100 rounded-lg font-medium hover:bg-stone-700 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-amber-900/30 p-6">
            <h3 className="text-xl font-bold text-amber-50 mb-4">Subscription Terms</h3>
            <div className="text-amber-100/80 space-y-3 text-sm">
              <p>
                <strong>Monthly Charge:</strong> ₹99/month (or equivalent in your currency)
              </p>
              <p>
                <strong>Auto-Renewal:</strong> Your subscription will automatically renew every month on the date of first registration.
              </p>
              <p>
                <strong>Payment Method:</strong> We'll attempt to charge using your preferred payment method.
              </p>
              <p>
                <strong>Failed Payment:</strong> If payment fails after 3 attempts, your listing will be suspended from the map.
              </p>
              <p>
                <strong>Cancellation:</strong> You can cancel anytime from your dashboard. Suspension takes effect immediately.
              </p>
              <p>
                <strong>Admin Approval:</strong> Your location must be approved by our team before appearing on the map.
              </p>
              <p>
                <strong>Content Policy:</strong> All listings must comply with our community guidelines.
              </p>
              <p>
                <strong>Support:</strong> We're here to help. Contact support@monasteryexplorer.com for any issues.
              </p>
            </div>

            <button
              onClick={() => setShowTermsModal(false)}
              className="mt-6 w-full px-4 py-2 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-500 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

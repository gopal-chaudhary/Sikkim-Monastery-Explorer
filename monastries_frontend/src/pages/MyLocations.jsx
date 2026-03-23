import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { MapPin, Clock, CreditCard, Trash2, Edit2, RefreshCw, Plus } from 'lucide-react'
import { toast } from 'react-toastify'
import { locationAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { EmptyState, ErrorState, OfflineBanner } from '../components/States'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { SkeletonList } from '../components/SkeletonCard'
import { SmartImage } from '../components/SmartImage'

export default function MyLocations() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingLocation, setEditingLocation] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    phone: '',
    website: '',
    hours: '',
    address: '',
    latitude: '',
    longitude: '',
    imageUrl: ''
  })
  const [editImagePreview, setEditImagePreview] = useState(null)
  const online = useOnlineStatus()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchLocations()
  }, [user, navigate])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await locationAPI.getMyLocations()
      setLocations(response.data)
    } catch (error) {
      toast.error('Failed to fetch locations')
      console.error(error)
      setError('Could not load your listings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return
    }

    try {
      await locationAPI.deleteLocation(id)
      toast.success('Location deleted successfully')
      setLocations(locations.filter(loc => loc._id !== id))
    } catch {
      toast.error('Failed to delete location')
    }
  }

  const handleRenew = async (id) => {
    try {
      await locationAPI.renewSubscription(id)
      toast.success('Subscription renewed successfully')
      fetchLocations()
    } catch {
      toast.error('Failed to renew subscription')
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this subscription? The location will be removed from the map.')) {
      return
    }

    try {
      await locationAPI.cancelSubscription(id)
      toast.success('Subscription cancelled')
      fetchLocations()
    } catch {
      toast.error('Failed to cancel subscription')
    }
  }

  const openEditModal = (location) => {
    setEditingLocation(location)
    setEditForm({
      name: location.name || '',
      description: location.description || '',
      phone: location.phone || '',
      website: location.website || '',
      hours: location.hours || '',
      address: location.location?.address || '',
      latitude: location.location?.coordinates?.[1] ?? '',
      longitude: location.location?.coordinates?.[0] ?? '',
      imageUrl: location.imageUrl || ''
    })
    setEditImagePreview(location.imageUrl || null)
  }

  const closeEditModal = () => {
    setEditingLocation(null)
    setSavingEdit(false)
    setEditImagePreview(null)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result
      setEditImagePreview(base64)
      setEditForm((prev) => ({ ...prev, imageUrl: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleSaveEdit = async () => {
    if (!editingLocation) return

    if (!editForm.name.trim() || !editForm.description.trim() || !editForm.phone.trim() || !editForm.address.trim()) {
      toast.error('Name, description, phone, and address are required')
      return
    }

    if (editForm.description.trim().length < 20) {
      toast.error('Description must be at least 20 characters')
      return
    }

    const latitude = Number(editForm.latitude)
    const longitude = Number(editForm.longitude)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      toast.error('Please enter valid latitude and longitude')
      return
    }

    try {
      setSavingEdit(true)
      const payload = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        phone: editForm.phone.trim(),
        website: editForm.website.trim(),
        hours: editForm.hours.trim(),
        address: editForm.address.trim(),
        coordinates: [longitude, latitude],
        imageUrl: editForm.imageUrl
      }

      const response = await locationAPI.updateLocation(editingLocation._id, payload)
      const updated = response?.data?.location

      if (updated) {
        setLocations((prev) => prev.map((loc) => (loc._id === updated._id ? { ...loc, ...updated } : loc)))
      } else {
        await fetchLocations()
      }

      toast.success('Listing details updated successfully')
      closeEditModal()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update listing')
    } finally {
      setSavingEdit(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-900/30', border: 'border-green-600/50', text: 'text-green-300', label: 'Active' },
      pending: { bg: 'bg-yellow-900/30', border: 'border-yellow-600/50', text: 'text-yellow-300', label: 'Pending Approval' },
      expired: { bg: 'bg-red-900/30', border: 'border-red-600/50', text: 'text-red-300', label: 'Expired' },
      suspended: { bg: 'bg-orange-900/30', border: 'border-orange-600/50', text: 'text-orange-300', label: 'Suspended' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${config.bg} ${config.border} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Layout>
      {!online && <OfflineBanner onRetry={fetchLocations} />}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-50">My Business Listings</h1>
            <p className="text-stone-400 mt-2">Manage your locations and subscriptions</p>
          </div>
          <Link
            to="/list-business"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-rose-600 text-amber-50 rounded-lg font-medium hover:from-amber-500 hover:to-rose-500 transition"
          >
            <Plus className="w-5 h-5" /> Add New Listing
          </Link>
        </div>

        {loading ? (
          <SkeletonList rows={4} />
        ) : error ? (
          <ErrorState title="Couldn’t load your listings" message={error} onRetry={fetchLocations} />
        ) : locations.length === 0 ? (
          <EmptyState
            title="No listings yet"
            message="Create your first location listing to get started."
            action={
              <Link
                to="/list-business"
                className="inline-block mt-5 px-6 py-3 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
              >
                Add your first location
              </Link>
            }
            icon={MapPin}
          />
        ) : (
          <div className="grid gap-6">
            {locations.map(location => (
              <div
                key={location._id}
                className="bg-stone-900 rounded-lg border border-amber-900/30 overflow-hidden hover:border-amber-900/50 transition"
              >
                <div className="flex flex-col md:flex-row gap-4 p-6">
                  {/* Image */}
                  {location.imageUrl && (
                    <SmartImage
                      src={location.imageUrl}
                      alt={location.name}
                      className="w-full md:w-48 h-40 object-cover rounded-lg flex-shrink-0"
                      optimizeWidth={520}
                    />
                  )}

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-amber-50">{location.name}</h3>
                          <p className="text-sm text-amber-200 mt-1">{location.type}</p>
                        </div>
                        {getStatusBadge(location.subscriptionStatus)}
                      </div>

                      <p className="text-amber-100/70 text-sm mb-3 line-clamp-2">{location.description}</p>

                      <div className="flex flex-wrap gap-3 text-sm text-stone-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {location.location.address}
                        </div>
                        {location.expiresAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Expires: {formatDate(location.expiresAt)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subscription Info */}
                    {location.subscriptionId && (
                      <div className="mt-4 p-3 bg-amber-900/10 border border-amber-900/30 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-amber-200 mb-2">
                          <CreditCard className="w-4 h-4" />
                          <span>Subscription: {
                            location.subscriptionId.planType === 'annual' ? '₹999/year' :
                            location.subscriptionId.planType === 'quarterly' ? '₹249/quarter' :
                            '₹99/month'
                          }</span>
                        </div>
                        <p className="text-xs text-stone-400">
                          Next renewal: {formatDate(location.subscriptionId.nextRenewalDate)}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <Link
                        to={`/location/${location._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-100 rounded-lg transition text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => openEditModal(location)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded-lg transition text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleRenew(location._id)}
                        disabled={location.subscriptionStatus !== 'expired' && location.subscriptionStatus !== 'suspended'}
                        className="flex items-center gap-2 px-4 py-2 bg-green-900/30 hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed text-green-300 rounded-lg transition text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Renew
                      </button>
                      <button
                        onClick={() => handleCancel(location._id)}
                        disabled={location.subscriptionStatus !== 'active'}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-900/30 hover:bg-orange-900/50 disabled:opacity-50 disabled:cursor-not-allowed text-orange-300 rounded-lg transition text-sm"
                      >
                        Cancel Sub
                      </button>
                      <button
                        onClick={() => handleDelete(location._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded-lg transition text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editingLocation && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-stone-900 border border-amber-900/30 rounded-xl p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-amber-50 mb-1">Edit Listing</h2>
              <p className="text-sm text-stone-400 mb-6">Update your details without cancelling subscription.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-amber-200 mb-2">Name *</label>
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-amber-200 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows={4}
                    className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-amber-200 mb-2">Address *</label>
                  <input
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-amber-200 mb-2">Latitude *</label>
                  <input
                    name="latitude"
                    value={editForm.latitude}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-amber-200 mb-2">Longitude *</label>
                  <input
                    name="longitude"
                    value={editForm.longitude}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-amber-200 mb-2">Phone *</label>
                  <input
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-amber-200 mb-2">Website</label>
                  <input
                    name="website"
                    value={editForm.website}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-amber-200 mb-2">Hours</label>
                  <input
                    name="hours"
                    value={editForm.hours}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-stone-800 border border-amber-900/30 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-amber-200 mb-2">Image</label>
                  <div className="flex items-center gap-4">
                    {editImagePreview && (
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border border-amber-900/30"
                      />
                    )}
                    <div>
                      <input
                        id="editImageInput"
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('editImageInput')?.click()}
                        className="px-4 py-2 bg-stone-800 text-amber-100 rounded-lg hover:bg-stone-700"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="px-6 py-2 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-500 disabled:opacity-60"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={closeEditModal}
                  disabled={savingEdit}
                  className="px-6 py-2 bg-stone-800 text-amber-100 rounded-lg hover:bg-stone-700 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3777'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Parse error response (backend may send JSON or text)
export function getErrorMessage(err) {
  const res = err.response
  if (!res) return err.message || 'Network or server error'
  const data = res.data
  if (data && typeof data === 'object' && data.message) return data.message
  if (typeof data === 'string') return data.replace(/^ERROR\s*:\s*/i, '')
  return res.statusText || 'Something went wrong'
}

// ===== Location APIs =====

export const locationAPI = {
  // Create a new location listing
  createLocation: (locationData) =>
    api.post('/location/create', locationData),

  // Get all user's locations with pagination
  getMyLocations: (page = 1, limit = 12) =>
    api.get(`/location/my-locations?page=${page}&limit=${limit}`),

  // Get all active locations (for map) with pagination
  getAllActiveLocations: (page = 1, limit = 20) =>
    api.get(`/location/all-active?page=${page}&limit=${limit}`),

  // Get single location by ID
  getLocationById: (id) =>
    api.get(`/location/${id}`),

  // Track a single view
  trackLocationView: (id) =>
    api.post(`/location/${id}/view`),

  // Update location details
  updateLocation: (id, data) =>
    api.patch(`/location/${id}`, data),

  // Delete location
  deleteLocation: (id) =>
    api.delete(`/location/${id}`),

  // Get subscription details for a location
  getSubscription: (id) =>
    api.get(`/location/${id}/subscription`),

  // Renew subscription
  renewSubscription: (id) =>
    api.post(`/location/${id}/renew-subscription`),

  // Cancel subscription
  cancelSubscription: (id) =>
    api.post(`/location/${id}/cancel-subscription`),

  // Search locations by query
  searchLocations: (query) =>
    api.get(`/location/search/${query}`),

  // Find nearby locations
  findNearby: (coordinates, maxDistance = 5000) =>
    api.post('/location/find-nearby', { coordinates, maxDistance }),
}

// ===== Guide APIs =====

export const guideAPI = {
  // Create a new guide profile
  createGuideProfile: (profileData) =>
    api.post('/guide/create', profileData),

  // Subscribe as a guide
  subscribeAsGuide: (subscriptionData) =>
    api.post('/guide/subscribe', subscriptionData),

  // Get my guide profile
  getMyProfile: () =>
    api.get('/guide/my-profile'),

  // Update guide profile
  updateProfile: (data) =>
    api.patch('/guide/update', data),

  // Get guides for a specific monastery
  getGuidesByMonastery: (monasteryId) =>
    api.get(`/guide/monastery/${monasteryId}`),

  // Get specific guide details
  getGuideById: (id) =>
    api.get(`/guide/${id}`),

  // Add review for a guide
  addReview: (id, reviewData) =>
    api.post(`/guide/${id}/review`, reviewData),

  // Get my subscription details
  getMySubscription: () =>
    api.get('/guide/subscription/details'),

  // Renew subscription
  renewSubscription: () =>
    api.post('/guide/subscription/renew'),

  // Cancel subscription
  cancelSubscription: () =>
    api.post('/guide/subscription/cancel'),

  // Delete guide profile
  deleteProfile: () =>
    api.delete('/guide/delete'),

  // Get all active guides
  getAllGuides: () =>
    api.get('/guide/all'),
}

// ===== Review APIs =====

export const reviewAPI = {
  // Get all reviews for a monastery
  getReviews: (monasteryId) =>
    api.get(`/monasteries/${monasteryId}/reviews`),

  // Add or update own review
  submitReview: (monasteryId, data) =>
    api.post(`/monasteries/${monasteryId}/reviews`, data),

  // Delete own review
  deleteReview: (monasteryId) =>
    api.delete(`/monasteries/${monasteryId}/reviews`),
}


import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { Layout } from '../components/Layout'
import { 
  Heart, 
  MapPin, 
  Star, 
  Calendar,
  ExternalLink,
  Trash2,
  Loader2,
  Grid,
  List
} from 'lucide-react'
import { SmartImage } from '../components/SmartImage'

export default function SavedPlaces() {
  const { user } = useAuth()
  const [savedMonasteries, setSavedMonasteries] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('savedDate')

  const sortOptions = [
    { value: 'savedDate', label: 'Date Saved' },
    { value: 'name', label: 'Name' },
    { value: 'rating', label: 'Rating' },
    { value: 'location', label: 'Location' }
  ]

  // Load saved monasteries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedMonasteries')
    if (saved) {
      const parsed = JSON.parse(saved)
      setSavedMonasteries(parsed)
    }
    setLoading(false)
  }, [])

  const removeSaved = (monasteryId) => {
    const newSaved = savedMonasteries.filter(m => m._id !== monasteryId)
    setSavedMonasteries(newSaved)
    localStorage.setItem('savedMonasteries', JSON.stringify(newSaved))
    toast.success('Removed from saved places')
  }

  const sortedMonasteries = [...savedMonasteries].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'location':
        return (a.location || '').localeCompare(b.location || '')
      case 'savedDate':
      default:
        return 0 // Keep original order (most recent first)
    }
  })

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Please login to view saved places
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Save your favorite monasteries and access them anytime.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login to Continue
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading saved places...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Saved Places
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your personal collection of sacred monasteries and spiritual destinations.
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {savedMonasteries.length} places saved
              </div>
              
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Monasteries */}
          {savedMonasteries.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No saved places yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start exploring and save your favorite monasteries to build your personal collection.
              </p>
              <button
                onClick={() => window.location.href = '/explore'}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Heart className="w-4 h-4 mr-2" />
                Start Exploring
              </button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
            }>
              {sortedMonasteries.map((monastery) => (
                <div
                  key={monastery._id}
                  className={
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 group'
                      : 'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 group'
                  }
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      <div className="relative">
                        <SmartImage
                          src={monastery.imageUrl}
                          alt={monastery.name}
                          className="w-full h-48 object-cover"
                          fallbackType="monastery"
                        />
                        
                        {/* Action Buttons */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => window.location.href = `/monastery/${monastery._id}`}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                            title="View Details"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                          
                          <button
                            onClick={() => removeSaved(monastery._id)}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                        
                        {/* Rating Badge */}
                        {monastery.rating && (
                          <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            <span className="text-xs text-white font-medium">{monastery.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {monastery.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {monastery.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="w-4 h-4 mr-1" />
                            {monastery.location}
                          </div>
                          <button
                            onClick={() => window.location.href = `/monastery/${monastery._id}`}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // List View
                    <div className="flex gap-6">
                      <SmartImage
                        src={monastery.imageUrl}
                        alt={monastery.name}
                        className="w-24 h-24 object-cover rounded-lg"
                        fallbackType="monastery"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {monastery.name}
                          </h3>
                          
                          <div className="flex items-center gap-2">
                            {monastery.rating && (
                              <div className="flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                                <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                                <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">{monastery.rating}</span>
                              </div>
                            )}
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => window.location.href = `/monastery/${monastery._id}`}
                                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                title="View Details"
                              >
                                <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                              </button>
                              
                              <button
                                onClick={() => removeSaved(monastery._id)}
                                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                title="Remove from saved"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {monastery.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="w-4 h-4 mr-1" />
                            {monastery.location}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => window.location.href = `/monastery/${monastery._id}`}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

import { useState } from 'react'
import { Heart, MapPin, Star, ExternalLink, Loader2 } from 'lucide-react'

export default function SavedMonasteries({ 
  monasteries = [], 
  loading = false,
  onRemove,
  onView 
}) {
  const [removingId, setRemovingId] = useState(null)

  const handleRemove = async (id) => {
    setRemovingId(id)
    try {
      await onRemove(id)
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-32"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (monasteries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No saved monasteries yet
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Start exploring and save your favorite monasteries to see them here.
        </p>
        <button
          onClick={() => window.location.href = '/explore'}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Explore Monasteries
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            Saved Monasteries ({monasteries.length})
          </h2>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monasteries.map((monastery) => (
            <div
              key={monastery._id}
              className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={monastery.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80'}
                  alt={monastery.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Quick actions overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      onClick={() => onView(monastery._id)}
                      className="p-2 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(monastery._id)}
                      disabled={removingId === monastery._id}
                      className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full transition-colors disabled:opacity-50"
                    >
                      {removingId === monastery._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Heart className="w-4 h-4 fill-current" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Rating badge */}
                {monastery.rating && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                    <span className="text-xs font-medium text-gray-800">{monastery.rating}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                  {monastery.name}
                </h3>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <MapPin className="w-3 h-3 mr-1" />
                  {monastery.location?.district || monastery.location || 'Location unknown'}
                </div>

                {monastery.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {monastery.description}
                  </p>
                )}

                {/* Tags */}
                {monastery.tags && monastery.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {monastery.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {monastery.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                        +{monastery.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load more */}
        {monasteries.length >= 8 && (
          <div className="mt-6 text-center">
            <button className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
              View all saved monasteries
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

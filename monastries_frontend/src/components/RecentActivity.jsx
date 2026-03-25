import { format } from 'date-fns'
import { 
  Heart, 
  MessageSquare, 
  MapPin, 
  Star, 
  Camera, 
  Edit3,
  Plus,
  Clock
} from 'lucide-react'

export default function RecentActivity({ 
  activities = [], 
  loading = false 
}) {
  const getActivityIcon = (type) => {
    const icons = {
      saved: { icon: Heart, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900' },
      reviewed: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900' },
      visited: { icon: MapPin, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900' },
      rated: { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900' },
      uploaded: { icon: Camera, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900' },
      updated: { icon: Edit3, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' },
      contributed: { icon: Plus, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900' }
    }
    return icons[type] || icons.saved
  }

  const formatActivityDate = (date) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffInDays = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return 'Today'
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else if (diffInDays < 30) {
      return `${Math.floor(diffInDays / 7)} weeks ago`
    } else {
      return format(activityDate, 'MMM d, yyyy')
    }
  }

  const getActivityMessage = (activity) => {
    const messages = {
      saved: `saved ${activity.targetName} to favorites`,
      reviewed: `reviewed ${activity.targetName}`,
      visited: `visited ${activity.targetName}`,
      rated: `rated ${activity.targetName}`,
      uploaded: `uploaded photo to ${activity.targetName}`,
      updated: 'updated profile information',
      contributed: `contributed information about ${activity.targetName}`
    }
    return messages[activity.type] || 'performed an activity'
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-40"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No recent activity
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Your activity will appear here as you explore and interact with monasteries.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-500" />
          Recent Activity
        </h2>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const { icon: Icon, color, bg } = getActivityIcon(activity.type)
            
            return (
              <div
                key={activity._id || index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {/* Activity icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bg} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>

                {/* Activity content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">You</span>{' '}
                    <span className="text-gray-600 dark:text-gray-300">
                      {getActivityMessage(activity)}
                    </span>
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatActivityDate(activity.createdAt)}
                    </span>
                    
                    {activity.location && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.location}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Activity details */}
                  {activity.details && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                      {activity.details}
                    </div>
                  )}
                </div>

                {/* Action button */}
                {activity.targetId && (
                  <button
                    onClick={() => {
                      // Navigate to the target
                      if (activity.type === 'saved' || activity.type === 'visited' || activity.type === 'rated') {
                        window.location.href = `/monastery/${activity.targetId}`
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Load more */}
        {activities.length >= 10 && (
          <div className="mt-6 text-center">
            <button className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
              View all activity
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

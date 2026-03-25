import { format } from 'date-fns'
import { Mail, MapPin, Calendar, Shield, Edit3, LogOut } from 'lucide-react'

export default function ProfileCard({ 
  user, 
  onEdit, 
  onLogout,
  loading = false 
}) {
  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200', label: 'Admin' },
      guide: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', label: 'Guide' },
      user: { bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-800 dark:text-gray-200', label: 'Explorer' }
    }
    return badges[role] || badges.user
  }

  const roleBadge = getRoleBadge(user?.role)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with gradient background */}
      <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Profile content */}
      <div className="px-6 pb-6">
        {/* User info */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar would go here - passed as prop or separate component */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleBadge.bg} ${roleBadge.text}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {roleBadge.label}
                </span>
                {user?.isActive && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={onEdit}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
            <button
              onClick={onLogout}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Bio */}
        {user?.about && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {user.about}
            </p>
          </div>
        )}

        {/* Contact info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
          
          <div className="flex items-center text-sm">
            <Mail className="w-4 h-4 text-gray-400 mr-3" />
            <span className="text-gray-600 dark:text-gray-300">{user?.emailId}</span>
          </div>

          {user?.location && (
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-gray-600 dark:text-gray-300">{user.location}</span>
            </div>
          )}

          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 text-gray-400 mr-3" />
            <span className="text-gray-600 dark:text-gray-300">
              Joined {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Recently'}
            </span>
          </div>
        </div>

        {/* Skills */}
        {user?.skills && user.skills.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

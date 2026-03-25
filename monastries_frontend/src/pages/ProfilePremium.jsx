import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { 
  User as UserIcon, 
  MapPin, 
  Calendar, 
  Settings,
  LogOut,
  Loader2,
  Heart,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react'

// Import components
import ProfileAvatar from '../components/ProfileAvatar'
import ProfileCard from '../components/ProfileCard'
import EditProfileModal from '../components/EditProfileModal'
import SavedMonasteries from '../components/SavedMonasteries'
import RecentActivity from '../components/RecentActivity'

export default function ProfilePremium() {
  const [user, setUser] = useState(null)
  const [savedMonasteries, setSavedMonasteries] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile-new', {
        credentials: 'include'
      })
      
      const data = await response.json()
      if (data.success) {
        setUser(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  // Fetch saved monasteries
  const fetchSavedMonasteries = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockSaved = [
        {
          _id: '1',
          name: 'Rumtek Monastery',
          location: { district: 'Gangtok' },
          imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80',
          rating: 4.8,
          description: 'One of the most significant Tibetan Buddhist monasteries in Sikkim.',
          tags: ['Buddhist', 'Historic', 'Scenic']
        },
        {
          _id: '2',
          name: 'Pemayangtse Monastery',
          location: { district: 'West Sikkim' },
          imageUrl: 'https://images.unsplash.com/photo-1558981403-c2f6b5f0d9a1?w=400&q=80',
          rating: 4.6,
          description: 'Ancient monastery with stunning mountain views and rich history.',
          tags: ['Historic', 'Mountain', 'Peaceful']
        }
      ]
      setSavedMonasteries(mockSaved)
    } catch (error) {
      console.error('Error fetching saved monasteries:', error)
    }
  }

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockActivity = [
        {
          _id: '1',
          type: 'saved',
          targetName: 'Rumtek Monastery',
          targetId: '1',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          location: 'Gangtok, Sikkim'
        },
        {
          _id: '2',
          type: 'reviewed',
          targetName: 'Pemayangtse Monastery',
          targetId: '2',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          details: 'Rated 5 stars - Amazing experience with beautiful architecture!'
        },
        {
          _id: '3',
          type: 'uploaded',
          targetName: 'Rumtek Monastery',
          targetId: '1',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          location: 'Gangtok, Sikkim'
        },
        {
          _id: '4',
          type: 'visited',
          targetName: 'Phodong Monastery',
          targetId: '3',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          location: 'North Sikkim'
        },
        {
          _id: '5',
          type: 'updated',
          targetName: 'Profile',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          details: 'Updated profile information and added new skills'
        }
      ]
      setRecentActivity(mockActivity)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    }
  }

  // Handle profile update
  const handleProfileUpdate = async (formData) => {
    try {
      setSaving(true)
      const response = await fetch('/api/profile-new', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        setUser(data.data)
        setShowEditModal(false)
        toast.success('Profile updated successfully!')
      } else {
        throw new Error(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Handle photo upload
  const handlePhotoUpload = async (file) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch('/api/profile-new/upload-photo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setUser(prev => ({ ...prev, photoUrl: data.data.photoUrl }))
        toast.success('Photo uploaded successfully!')
      } else {
        throw new Error(data.message || 'Failed to upload photo')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error(error.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  // Handle photo removal
  const handlePhotoRemove = async () => {
    try {
      const response = await fetch('/api/profile-new/remove-photo', {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()
      if (data.success) {
        setUser(prev => ({ ...prev, photoUrl: '' }))
        toast.success('Photo removed successfully!')
      } else {
        throw new Error(data.message || 'Failed to remove photo')
      }
    } catch (error) {
      console.error('Error removing photo:', error)
      toast.error(error.message || 'Failed to remove photo')
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/logout', {
        method: 'POST',
        credentials: 'include'
      })
      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Failed to logout')
    }
  }

  // Handle remove saved monastery
  const handleRemoveSaved = async (monasteryId) => {
    try {
      // Replace with actual API call
      setSavedMonasteries(prev => prev.filter(m => m._id !== monasteryId))
      toast.success('Removed from saved monasteries')
    } catch (error) {
      console.error('Error removing saved monastery:', error)
      toast.error('Failed to remove from saved')
    }
  }

  // Handle view monastery
  const handleViewMonastery = (monasteryId) => {
    window.location.href = `/monastery/${monasteryId}`
  }

  useEffect(() => {
    fetchProfile()
    fetchSavedMonasteries()
    fetchRecentActivity()
  }, [])

  // Loading skeleton
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-8 w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 w-32 mx-auto"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4 mx-auto"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2 mx-auto"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-64"></div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your profile and track your monastery exploration journey
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <ProfileCard
              user={user}
              onEdit={() => setShowEditModal(true)}
              onLogout={handleLogout}
            />

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Saved Places</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{savedMonasteries.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Reviews</span>
                  <span className="font-semibold text-gray-900 dark:text-white">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Photos</span>
                  <span className="font-semibold text-gray-900 dark:text-white">28</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Points</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">450</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Saved Monasteries */}
            <SavedMonasteries
              monasteries={savedMonasteries}
              loading={loading}
              onRemove={handleRemoveSaved}
              onView={handleViewMonastery}
            />

            {/* Recent Activity */}
            <RecentActivity
              activities={recentActivity}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        user={user}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleProfileUpdate}
        loading={saving}
      />
    </div>
  )
}

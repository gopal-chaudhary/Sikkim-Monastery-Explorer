import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api'
import { validateEditProfile } from '../utils/validation'
import { Layout } from '../components/Layout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import ProfileImageUpload from '../components/ProfileImageUpload'
import { 
  User, 
  Award, 
  Mail, 
  Calendar, 
  UserCircle, 
  Edit3, 
  Save,
  Check,
  Loader2
} from 'lucide-react'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    emailId: '', 
    age: '', 
    gender: '', 
    about: '', 
    photoUrl: '' 
  })
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const originalForm = useRef({})

  useEffect(() => {
    if (user) {
      const initialForm = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        emailId: user.emailId || '',
        age: user.age ?? '',
        gender: user.gender || '',
        about: user.about || '',
        photoUrl: user.photoUrl || '',
      }
      setForm(initialForm)
      originalForm.current = initialForm
    }
  }, [user])

  useEffect(() => {
    const hasFormChanges = JSON.stringify(form) !== JSON.stringify(originalForm.current)
    const hasImageChange = imageFile !== null
    setHasChanges(hasFormChanges || hasImageChange)
  }, [form, imageFile, originalForm.current])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (file) => {
    setImageFile(file)
  }

  const handleImageRemove = () => {
    setImageFile(null)
    setForm(prev => ({ ...prev, photoUrl: '' }))
  }

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('photo', file)
    
    try {
      const response = await fetch('/api/profile-new/upload-photo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      
      // Check if response is OK before parsing JSON
      if (!response.ok) {
        // Try to parse error JSON, but handle case where response is not JSON
        let errorMessage = 'Failed to upload image'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } else {
            errorMessage = `Upload failed: ${response.status} ${response.statusText}`
          }
        } catch (parseError) {
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }
      
      // Parse successful response
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        throw new Error('Invalid response from server')
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Upload failed')
      }
      
      return data.data.photoUrl
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!hasChanges) {
      toast.info('No changes to save')
      return
    }

    setLoading(true)
    setShowSuccess(false)

    try {
      const body = { ...form }
      
      // Handle image upload
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile)
        body.photoUrl = imageUrl
      }
      
      // Handle age
      if (body.age === '') delete body.age
      else body.age = Number(body.age)

      const err = validateEditProfile(body)
      if (err) {
        toast.error(err.message)
        return
      }

      await updateProfile(body)
      
      // Update original form reference
      originalForm.current = { ...body }
      setImageFile(null)
      
      // Show success state
      setShowSuccess(true)
      toast.success('Profile updated successfully!')
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)
      
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return (first + last).toUpperCase() || 'U'
  }

  const getDisplayName = () => {
    if (form.firstName || form.lastName) {
      return `${form.firstName} ${form.lastName}`.trim()
    }
    return form.emailId || 'User'
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-[var(--bg-secondary)] py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
                My Profile
              </h1>
              <p className="text-[var(--text-secondary)]">
                Manage your personal information and preferences
              </p>
            </div>

            {/* Achievement Card */}
            {(user?.contributionPoints != null || (user?.badges?.length)) && (
              <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-primary)] p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-hover)] flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">Achievements</h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                      <span className="font-medium text-[var(--accent-primary)]">{user?.contributionPoints ?? 0}</span> contribution points
                      {user?.badges?.length > 0 && (
                        <span className="ml-2">• Badges: {user.badges.join(', ')}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Header Card */}
              <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-primary)] p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <ProfileImageUpload
                      currentImage={form.photoUrl}
                      firstName={form.firstName}
                      lastName={form.lastName}
                      onImageChange={handleImageChange}
                      onImageRemove={handleImageRemove}
                      size="large"
                    />
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                      {getDisplayName()}
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-sm text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {form.emailId}
                      </div>
                      {form.age && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {form.age} years old
                        </div>
                      )}
                      {form.gender && (
                        <div className="flex items-center gap-2">
                          <UserCircle className="w-4 h-4" />
                          {form.gender}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Card */}
              <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-primary)] p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[var(--accent-primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      First Name
                    </label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-colors duration-200"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Last Name
                    </label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-colors duration-200"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Email Address
                    </label>
                    <input
                      name="emailId"
                      type="email"
                      value={form.emailId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-colors duration-200"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Age
                    </label>
                    <input
                      name="age"
                      type="number"
                      min="1"
                      max="120"
                      value={form.age}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-colors duration-200"
                      placeholder="Your age"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-colors duration-200"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* About Section Card */}
              <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-primary)] p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center">
                    <Edit3 className="w-4 h-4 text-[var(--accent-primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">About Me</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Bio
                  </label>
                  <textarea
                    name="about"
                    value={form.about}
                    onChange={handleChange}
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] resize-none transition-colors duration-200"
                    placeholder="Tell us about yourself, your interests, and what brings you to Sikkim's monasteries..."
                  />
                  <div className="mt-2 text-right">
                    <span className="text-xs text-[var(--text-muted)]">
                      {form.about.length}/500 characters
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-sm text-[var(--text-secondary)]">
                  {hasChanges ? (
                    <span className="flex items-center gap-2 text-[var(--accent-primary)]">
                      <Edit3 className="w-4 h-4" />
                      You have unsaved changes
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      All changes saved
                    </span>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !hasChanges}
                  className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    loading || !hasChanges
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-hover)] text-white hover:shadow-lg hover:shadow-[var(--accent-primary)]/25 transform hover:scale-[1.02]'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : showSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

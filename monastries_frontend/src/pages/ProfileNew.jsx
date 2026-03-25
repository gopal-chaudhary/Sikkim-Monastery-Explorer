import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { 
  User, 
  Award, 
  Mail, 
  Calendar, 
  MapPin, 
  Camera, 
  Upload, 
  X, 
  Edit3, 
  Save,
  Check,
  Loader2,
  Star,
  TrendingUp,
  Badge,
  Shield,
  Clock
} from 'lucide-react'

export default function ProfileNew() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [preview, setPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailId: '',
    age: '',
    gender: '',
    about: '',
    skills: []
  })

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile-new', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.data)
        setFormData({
          firstName: data.data.firstName || '',
          lastName: data.data.lastName || '',
          emailId: data.data.emailId || '',
          age: data.data.age || '',
          gender: data.data.gender || '',
          about: data.data.about || '',
          skills: data.data.skills || []
        })
        setPreview(data.data.photoUrl)
      }
    } catch (error) {
      toast.error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/profile-new/stats', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, skills }))
  }

  const handlePhotoSelect = (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setPhotoFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const uploadPhoto = async () => {
    if (!photoFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('photo', photoFile)

      const response = await fetch('/api/profile-new/upload-photo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Photo uploaded successfully!')
        setPhotoFile(null)
        fetchProfile()
        fetchStats()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = async () => {
    try {
      const response = await fetch('/api/profile-new/remove-photo', {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Photo removed successfully!')
        setPreview(null)
        setPhotoFile(null)
        fetchProfile()
        fetchStats()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to remove photo')
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
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
        toast.success('Profile updated successfully!')
        setProfile(data.data)
        setEditing(false)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return (first + last).toUpperCase() || 'U'
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Gold': return 'text-yellow-500 bg-yellow-50 border-yellow-200'
      case 'Silver': return 'text-gray-500 bg-gray-50 border-gray-200'
      default: return 'text-orange-600 bg-orange-50 border-orange-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
            My Profile
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage your personal information and track your contributions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            {/* Profile Photo Card */}
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-primary)] p-6 mb-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--accent-primary)] shadow-lg">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-hover)] flex items-center justify-center text-white font-bold text-2xl">
                        {getInitials(formData.firstName, formData.lastName)}
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
                  className="hidden"
                />

                <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-1">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-[var(--text-secondary)] text-sm mb-4">{formData.emailId}</p>

                {/* Photo Actions */}
                {photoFile && (
                  <div className="flex gap-2 justify-center mb-4">
                    <button
                      onClick={uploadPhoto}
                      disabled={uploading}
                      className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Photo
                    </button>
                    <button
                      onClick={() => {
                        setPhotoFile(null)
                        setPreview(profile?.photoUrl)
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {preview && !photoFile && (
                  <button
                    onClick={removePhoto}
                    className="text-red-500 hover:text-red-600 text-sm transition-colors"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>

            {/* Stats Card */}
            {stats && (
              <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-primary)] p-6">
                <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[var(--accent-primary)]" />
                  Statistics
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Contribution Points</span>
                    <span className="font-bold text-[var(--accent-primary)]">{stats.contributionPoints}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Contributions</span>
                    <span className="font-bold text-[var(--text-primary)]">{stats.contributionsCount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Rank</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRankColor(stats.rank)}`}>
                      {stats.rank}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Member Since</span>
                    <span className="text-[var(--text-primary)] text-sm">
                      {new Date(stats.memberSince).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {stats.badges.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
                    <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Badges</h4>
                    <div className="flex flex-wrap gap-1">
                      {stats.badges.map((badge, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[var(--accent-bg)] text-[var(--accent-primary)] text-xs rounded-full"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-primary)] p-6 lg:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading text-xl font-bold text-[var(--text-primary)]">
                  Personal Information
                </h3>
                <button
                  onClick={() => {
                    if (editing) {
                      setFormData({
                        firstName: profile?.firstName || '',
                        lastName: profile?.lastName || '',
                        emailId: profile?.emailId || '',
                        age: profile?.age || '',
                        gender: profile?.gender || '',
                        about: profile?.about || '',
                        skills: profile?.skills || []
                      })
                      setPreview(profile?.photoUrl)
                      setPhotoFile(null)
                    }
                    setEditing(!editing)
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    editing 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)]'
                  }`}
                >
                  {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-4 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-4 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      name="emailId"
                      value={formData.emailId}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Email cannot be changed</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      disabled={!editing}
                      min="1"
                      max="120"
                      className="w-full px-4 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-4 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    About
                  </label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    disabled={!editing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Skills
                  </label>
                  <input
                    type="text"
                    value={formData.skills.join(', ')}
                    onChange={handleSkillsChange}
                    disabled={!editing}
                    placeholder="Enter skills separated by commas..."
                    className="w-full px-4 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">Separate multiple skills with commas</p>
                </div>

                {editing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false)
                        setFormData({
                          firstName: profile?.firstName || '',
                          lastName: profile?.lastName || '',
                          emailId: profile?.emailId || '',
                          age: profile?.age || '',
                          gender: profile?.gender || '',
                          about: profile?.about || '',
                          skills: profile?.skills || []
                        })
                        setPreview(profile?.photoUrl)
                        setPhotoFile(null)
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

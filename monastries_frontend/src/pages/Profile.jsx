import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api'
import { validateEditProfile } from '../utils/validation'
import { Layout } from '../components/Layout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { User, Award, Camera, Mail, Shield, Star, Calendar } from 'lucide-react'
import { SmartImage } from '../components/SmartImage'

export default function Profile() {
  const { user, updateProfile, isAdmin } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', emailId: '', age: '', gender: '', about: '', photoUrl: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        emailId: user.emailId || '',
        age: user.age ?? '',
        gender: user.gender || '',
        about: user.about || '',
        photoUrl: user.photoUrl || '',
      })
    }
  }, [user])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const body = { ...form }
    if (body.age === '') delete body.age
    else body.age = Number(body.age)
    
    // We don't usually allow changing email directly in this form without verification,
    // but we'll include it if the backend supports it.
    
    const err = validateEditProfile(body)
    if (err) {
      toast.error(err.message)
      return
    }
    
    setLoading(true)
    try {
      await updateProfile(body)
      toast.success('Profile updated successfully! 🎉')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const userInitials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
          
          {/* Header Section */}
          <div className="relative mb-8 pt-12">
            <div className="absolute inset-0 h-32 rounded-3xl bg-gradient-to-r from-amber-600/20 via-rose-700/20 to-stone-900 border border-amber-500/10 -z-10" />
            
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 px-6 sm:px-10">
              <div className="relative group -mt-12 sm:-mt-16">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[var(--bg)] shadow-xl bg-stone-800">
                  {form.photoUrl ? (
                    <SmartImage 
                      src={form.photoUrl} 
                      alt={user?.firstName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500 to-rose-700 flex items-center justify-center text-3xl font-heading font-bold text-amber-50">
                      {userInitials}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg cursor-pointer hover:bg-stone-800 transition" title="Update photo via URL below">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
              
              <div className="flex-1 text-center sm:text-left pb-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-amber-50 flex items-center justify-center sm:justify-start gap-2">
                  {user?.firstName} {user?.lastName}
                  {isAdmin && (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  )}
                </h1>
                <p className="text-amber-200/60 flex items-center justify-center sm:justify-start gap-1.5 mt-1 text-sm">
                  <Mail className="w-4 h-4" /> {user?.emailId}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar / Stats */}
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6 border border-amber-900/30">
                <h3 className="font-heading font-semibold text-amber-100 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Your Journey
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900/60 border border-amber-900/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Award className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-400">Contribution Points</p>
                        <p className="font-bold text-amber-50">{user?.contributionPoints ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  {user?.badges?.length > 0 && (
                    <div className="p-4 rounded-xl bg-stone-900/60 border border-amber-900/20">
                      <p className="text-xs text-stone-400 mb-2">Earned Badges</p>
                      <div className="flex flex-wrap gap-2">
                        {user.badges.map((badge, i) => (
                          <span key={i} className="px-2 py-1 text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 border border-amber-900/30">
                <h3 className="font-heading text-lg font-semibold text-amber-50 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" /> Personal Details
                </h3>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1.5 ml-1">First Name</label>
                      <input 
                        name="firstName" 
                        value={form.firstName} 
                        onChange={handleChange} 
                        placeholder="Your first name"
                        className="w-full px-4 py-3 rounded-xl bg-stone-900/80 border border-amber-900/40 text-amber-50 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1.5 ml-1">Last Name</label>
                      <input 
                        name="lastName" 
                        value={form.lastName} 
                        onChange={handleChange} 
                        placeholder="Your last name"
                        className="w-full px-4 py-3 rounded-xl bg-stone-900/80 border border-amber-900/40 text-amber-50 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5 ml-1">Email Address</label>
                    <input 
                      name="emailId" 
                      type="email" 
                      value={form.emailId} 
                      disabled // Disabled to prevent accidental email changes without proper verification flow
                      className="w-full px-4 py-3 rounded-xl bg-stone-900/40 border border-stone-800 text-stone-400 cursor-not-allowed" 
                      title="Email address cannot be changed directly."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1.5 ml-1">Age</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                        <input 
                          name="age" 
                          type="number" 
                          min={0} 
                          value={form.age} 
                          onChange={handleChange} 
                          placeholder="e.g. 25"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-900/80 border border-amber-900/40 text-amber-50 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1.5 ml-1">Gender</label>
                      <select 
                        name="gender" 
                        value={form.gender} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 rounded-xl bg-stone-900/80 border border-amber-900/40 text-amber-50 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition appearance-none"
                      >
                        <option value="" className="bg-stone-900 text-stone-400">Select gender...</option>
                        <option value="Male" className="bg-stone-900">Male</option>
                        <option value="female" className="bg-stone-900">Female</option>
                        <option value="other" className="bg-stone-900">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5 ml-1">Profile Photo URL</label>
                    <input 
                      name="photoUrl" 
                      type="url" 
                      value={form.photoUrl} 
                      onChange={handleChange} 
                      placeholder="https://example.com/your-photo.jpg"
                      className="w-full px-4 py-3 rounded-xl bg-stone-900/80 border border-amber-900/40 text-amber-50 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5 ml-1">About Me</label>
                    <textarea 
                      name="about" 
                      value={form.about} 
                      onChange={handleChange} 
                      rows={4} 
                      placeholder="Share a bit about your journey..."
                      className="w-full px-4 py-3 rounded-xl bg-stone-900/80 border border-amber-900/40 text-amber-50 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition resize-none" 
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end border-t border-amber-900/20">
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="px-6 py-3 min-w-[140px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition shadow-lg shadow-amber-900/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

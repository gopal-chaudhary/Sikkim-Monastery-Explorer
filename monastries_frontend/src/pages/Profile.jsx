import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api'
import { validateEditProfile } from '../utils/validation'
import { Layout } from '../components/Layout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { User, Award } from 'lucide-react'

export default function Profile() {
  const { user, updateProfile } = useAuth()
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
    const err = validateEditProfile(body)
    if (err) {
      toast.error(err.message)
      return
    }
    setLoading(true)
    try {
      await updateProfile(body)
      toast.success('Profile updated.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-amber-50 mb-6 flex items-center gap-2"><User className="w-8 h-8" /> Profile</h1>
          {(user?.contributionPoints != null || (user?.badges?.length)) && (
            <div className="glass rounded-xl p-4 mb-6 flex items-center gap-4">
              <Award className="w-6 h-6 text-amber-500" />
              <div>
                <p className="text-amber-100 font-medium">Contribution points: {user?.contributionPoints ?? 0}</p>
                {user?.badges?.length > 0 && <p className="text-stone-400 text-sm">Badges: {user.badges.join(', ')}</p>}
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-amber-200/90 mb-1">First name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>
              <div>
                <label className="block text-sm text-amber-200/90 mb-1">Last name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Email</label>
              <input name="emailId" type="email" value={form.emailId} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-amber-200/90 mb-1">Age</label>
                <input name="age" type="number" min={0} value={form.age} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>
              <div>
                <label className="block text-sm text-amber-200/90 mb-1">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50">
                  <option value="">—</option>
                  <option value="Male">Male</option>
                  <option value="female">female</option>
                  <option value="other">other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-amber-200/90 mb-1">About</label>
              <textarea name="about" value={form.about} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none" />
            </div>
            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Photo URL</label>
              <input name="photoUrl" type="url" value={form.photoUrl} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition disabled:opacity-60">
              {loading ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

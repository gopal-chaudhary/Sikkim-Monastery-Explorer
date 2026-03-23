import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api'
import { validateLogin } from '../utils/validation'
import { Layout } from '../components/Layout'

export default function Login() {
  const [emailId, setEmailId] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateLogin({ emailId, password })
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    try {
      await login(emailId.trim(), password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      const msg = getErrorMessage(err)
      toast.error(msg)
      setErrors({ form: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout noHero>
      <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
        <div className="glass rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-900/40">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-amber-50 mb-2">Login</h2>
          <p className="text-stone-400 text-sm mb-6">Sign in to access your profile and contributions.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-amber-200/90 mb-1">Email</label>
              <input
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="you@example.com"
              />
              {errors.emailId && <p className="mt-1 text-xs text-rose-400">{errors.emailId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-200/90 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
            </div>
            {errors.form && <p className="text-sm text-rose-400">{errors.form}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="mt-4 text-center text-stone-400 text-sm">
            Don&apos;t have an account? <Link to="/signup" className="text-amber-400 hover:text-amber-300">Sign up</Link>
          </p>
        </div>
      </div>
    </Layout>
  )
}

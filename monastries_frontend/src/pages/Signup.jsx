import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api'
import { validateSignup } from '../utils/validation'
import { Layout } from '../components/Layout'

export default function Signup() {
  const [form, setForm] = useState({ firstName: '', lastName: '', emailId: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateSignup(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    try {
      await signup(form)
      toast.success('Account created! Welcome.')
      navigate('/')
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
        <div className="glass rounded-2xl p-6 sm:p-8 shadow-xl border border-[var(--border-primary)]">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">Create account</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">Join to explore monasteries, book visits and contribute.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">First name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="First name"
                />
                {errors.firstName && <p className="mt-1 text-xs text-[var(--rose-primary)]">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Last name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                  placeholder="Last name"
                />
                {errors.lastName && <p className="mt-1 text-xs text-[var(--rose-primary)]">{errors.lastName}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
              <input
                name="emailId"
                type="email"
                value={form.emailId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                placeholder="you@example.com"
              />
              {errors.emailId && <p className="mt-1 text-xs text-[var(--rose-primary)]">{errors.emailId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                placeholder="Min 8 chars, upper, lower, number, symbol"
              />
              {errors.password && <p className="mt-1 text-xs text-[var(--rose-primary)]">{errors.password}</p>}
            </div>
            {errors.form && <p className="text-sm text-[var(--rose-primary)]">{errors.form}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-hover)] text-[var(--bg-primary)] font-semibold hover:brightness-110 transition disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
          <p className="mt-4 text-center text-[var(--text-secondary)] text-sm">
            Already have an account? <Link to="/login" className="text-[var(--accent-primary)] hover:text-[var(--accent-hover)]">Login</Link>
          </p>
        </div>
      </div>
    </Layout>
  )
}

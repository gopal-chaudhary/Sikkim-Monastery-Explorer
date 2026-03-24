/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchUser() {
    try {
      const { data } = await api.get('/profile')
      setUser(data)
      return data
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = async (emailId, password) => {
    await api.post('/login', { emailId, password })
    const profile = await fetchUser()
    return profile
  }

  const signup = async (body) => {
    await api.post('/signup', body)
    const profile = await fetchUser()
    return profile
  }

  const logout = async () => {
    try {
      const { data } = await api.post('/logout')
      setUser(null)
      return data
    } catch (err) {
      setUser(null)
      throw err
    }
  }

  const updateProfile = async (body) => {
    const { data } = await api.patch('/profile/edit', body)
    setUser((u) => (u ? { ...u, ...data.data } : null))
    return data
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    fetchUser,
    updateProfile,
    isAdmin: user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

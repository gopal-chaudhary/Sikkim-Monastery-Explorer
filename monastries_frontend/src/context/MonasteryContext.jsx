import { createContext, useContext, useState, useEffect } from 'react'
import { api, getErrorMessage } from '../api'

const MonasteryContext = createContext(null)

export function MonasteryProvider({ children }) {
  const [monasteries, setMonasteries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchAllMonasteries() {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get('/monasteries/all')
      setMonasteries(data.data || [])
      return data.data
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      setMonasteries([])
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllMonasteries()
  }, [])

  return (
    <MonasteryContext.Provider value={{ monasteries, loading, error, refetch: fetchAllMonasteries }}>
      {children}
    </MonasteryContext.Provider>
  )
}

export function useMonasteries() {
  const context = useContext(MonasteryContext)
  if (!context) {
    throw new Error('useMonasteries must be used within MonasteryProvider')
  }
  return context
}

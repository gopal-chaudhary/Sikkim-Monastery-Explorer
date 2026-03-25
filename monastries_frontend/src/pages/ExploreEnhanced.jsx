import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { Layout } from '../components/Layout'
import { 
  Search, 
  Filter, 
  Heart, 
  MapPin, 
  Star, 
  Clock,
  Camera,
  Loader2,
  Grid,
  List
} from 'lucide-react'
import { SmartImage } from '../components/SmartImage'

export default function Explore() {
  const { user } = useAuth()
  const [monasteries, setMonasteries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [savedMonasteries, setSavedMonasteries] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  const regions = ['All', 'East Sikkim', 'West Sikkim', 'North Sikkim', 'South Sikkim']
  const categories = ['All', 'Buddhist', 'Hindu', 'Christian', 'Historic', 'Scenic', 'Remote']
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'rating', label: 'Rating' },
    { value: 'recent', label: 'Recently Added' },
    { value: 'popular', label: 'Most Popular' }
  ]

  // Load saved monasteries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedMonasteries')
    if (saved) {
      setSavedMonasteries(JSON.parse(saved))
    }
  }, [])

  // Fetch monasteries with filters
  useEffect(() => {
    fetchMonasteries()
  }, [searchTerm, selectedRegion, selectedCategory, sortBy])

  const fetchMonasteries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedRegion && selectedRegion !== 'All') params.append('region', selectedRegion)
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory)
      if (sortBy) params.append('sortBy', sortBy)
      
      const response = await fetch(`/monasteries/all?${params.toString()}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setMonasteries(data.monasteries || [])
      } else {
        throw new Error('Failed to fetch monasteries')
      }
    } catch (error) {
      console.error('Error fetching monasteries:', error)
      toast.error('Failed to load monasteries')
    } finally {
      setLoading(false)
    }
  }

  const toggleSave = (monastery) => {
    const isSaved = savedMonasteries.some(m => m._id === monastery._id)
    let newSaved
    
    if (isSaved) {
      newSaved = savedMonasteries.filter(m => m._id !== monastery._id)
      toast.success('Removed from saved places')
    } else {
      newSaved = [...savedMonasteries, monastery]
      toast.success('Added to saved places')
    }
    
    setSavedMonasteries(newSaved)
    localStorage.setItem('savedMonasteries', JSON.stringify(newSaved))
  }

  const isSaved = (monasteryId) => {
    return savedMonasteries.some(m => m._id === monasteryId)
  }

  const filteredMonasteries = monasteries.filter(monastery => {
    const matchesSearch = !searchTerm || 
      monastery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monastery.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRegion = !selectedRegion || selectedRegion === 'All' || 
      monastery.region === selectedRegion
    
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || 
      monastery.category === selectedCategory
    
    return matchesSearch && matchesRegion && matchesCategory
  })

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading monasteries...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Sacred Monasteries
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover ancient monasteries, sacred sites, and spiritual retreats across the mystical landscapes of Sikkim.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search monasteries by name, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredMonasteries.length} monasteries found
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Monasteries Grid/List */}
          {filteredMonasteries.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No monasteries found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
            }>
              {filteredMonasteries.map((monastery) => (
                <div
                  key={monastery._id}
                  className={
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300'
                      : 'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300'
                  }
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      <div className="relative">
                        <SmartImage
                          src={monastery.imageUrl}
                          alt={monastery.name}
                          className="w-full h-48 object-cover"
                          fallbackType="monastery"
                        />
                        
                        {/* Save Button */}
                        <button
                          onClick={() => toggleSave(monastery)}
                          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                        >
                          <Heart 
                            className={`w-4 h-4 ${isSaved(monastery._id) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`} 
                          />
                        </button>
                        
                        {/* Rating Badge */}
                        {monastery.rating && (
                          <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            <span className="text-xs text-white font-medium">{monastery.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {monastery.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {monastery.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="w-4 h-4 mr-1" />
                            {monastery.location}
                          </div>
                          <button
                            onClick={() => window.location.href = `/monastery/${monastery._id}`}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // List View
                    <div className="flex gap-6">
                      <SmartImage
                        src={monastery.imageUrl}
                        alt={monastery.name}
                        className="w-24 h-24 object-cover rounded-lg"
                        fallbackType="monastery"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {monastery.name}
                          </h3>
                          
                          <div className="flex items-center gap-2">
                            {monastery.rating && (
                              <div className="flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                                <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                                <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">{monastery.rating}</span>
                              </div>
                            )}
                            
                            <button
                              onClick={() => toggleSave(monastery)}
                              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Heart 
                                className={`w-4 h-4 ${isSaved(monastery._id) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`} 
                              />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {monastery.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="w-4 h-4 mr-1" />
                            {monastery.location}
                          </div>
                          <button
                            onClick={() => window.location.href = `/monastery/${monastery._id}`}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

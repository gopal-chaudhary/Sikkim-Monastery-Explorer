import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { UserCircle, Briefcase, Languages, DollarSign, Phone, Mail, MapPin, Award, CheckCircle } from 'lucide-react'
import { Layout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { api, getErrorMessage, guideAPI } from '../api'

export default function BecomeGuide() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [monasteries, setMonasteries] = useState([])
  const [step, setStep] = useState(1) // 1: Profile, 2: Monasteries, 3: Subscription
  
  const [formData, setFormData] = useState({
    guideName: '',
    bio: '',
    experience: '',
    languages: ['English'],
    specialization: [],
    contactInfo: {
      phone: '',
      email: user?.emailId || '',
      whatsapp: ''
    },
    profilePhoto: '',
    certificationImages: [],
    selectedMonasteries: [],
    pricing: {
      hourlyRate: '',
      halfDayRate: '',
      fullDayRate: '',
      currency: 'INR'
    },
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  })

  const [subscriptionData, setSubscriptionData] = useState({
    planType: 'monthly',
    autopayDate: new Date().getDate(),
    termsAccepted: false
  })

  const specializationOptions = [
    'Buddhist Culture',
    'History & Heritage',
    'Architecture',
    'Photography',
    'Trekking',
    'Wildlife',
    'Local Cuisine',
    'Meditation & Spirituality'
  ]

  useEffect(() => {
    if (!user) {
      toast.info('Please log in to become a guide')
      navigate('/login')
      return
    }

    // Fetch all monasteries
    api.get('/monasteries')
      .then(({ data }) => setMonasteries(data.data || []))
      .catch((err) => console.error('Failed to fetch monasteries:', err))
  }, [user, navigate])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }))
  }

  const handleLanguageAdd = (lang) => {
    if (lang && !formData.languages.includes(lang)) {
      setFormData(prev => ({ ...prev, languages: [...prev.languages, lang] }))
    }
  }

  const handleLanguageRemove = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== lang)
    }))
  }

  const handleSpecializationToggle = (spec) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }))
  }

  const handleMonasteryToggle = (monastery) => {
    const isSelected = formData.selectedMonasteries.some(m => m.monasteryId === monastery._id)
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        selectedMonasteries: prev.selectedMonasteries.filter(m => m.monasteryId !== monastery._id)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        selectedMonasteries: [
          ...prev.selectedMonasteries,
          { monasteryId: monastery._id, monasteryName: monastery.name }
        ]
      }))
    }
  }

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }))
  }

  const validateStep1 = () => {
    if (!formData.guideName || formData.guideName.length < 3) {
      toast.error('Guide name must be at least 3 characters')
      return false
    }
    if (!formData.bio || formData.bio.length < 50) {
      toast.error('Bio must be at least 50 characters')
      return false
    }
    if (!formData.experience || formData.experience < 0) {
      toast.error('Please enter your years of experience')
      return false
    }
    if (!formData.contactInfo.phone || !formData.contactInfo.email) {
      toast.error('Phone and email are required')
      return false
    }
    if (!formData.pricing.hourlyRate || !formData.pricing.halfDayRate || !formData.pricing.fullDayRate) {
      toast.error('Please fill all pricing fields')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (formData.selectedMonasteries.length === 0) {
      toast.error('Please select at least one monastery')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!subscriptionData.termsAccepted) {
      toast.error('Please accept terms and conditions')
      return
    }

    setLoading(true)
    try {
      // First create guide profile
      const profileResponse = await guideAPI.createGuideProfile(formData)
      toast.success(profileResponse.data.message)

      // Then create subscription
      const subResponse = await guideAPI.subscribeAsGuide(subscriptionData)
      toast.success(subResponse.data.message)

      // Navigate to guide dashboard
      navigate('/my-guide-profile')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Become a Tourist Guide
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Share your knowledge and help visitors explore Sikkim's sacred monasteries and spiritual heritage
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      step >= s
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 transition-all duration-300 ${
                        step > s ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Profile Information */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
                Profile Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Guide Name *
                  </label>
                  <input
                    type="text"
                    value={formData.guideName}
                    onChange={(e) => handleInputChange('guideName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Your professional name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio * (min 50 characters)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell visitors about yourself, your experience, and what makes you a great guide..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formData.bio.length} characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" /> Experience (years) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" /> Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.contactInfo.phone}
                      onChange={(e) => handleNestedInputChange('contactInfo', 'phone', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" /> Email *
                    </label>
                    <input
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) => handleNestedInputChange('contactInfo', 'email', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      WhatsApp (optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.contactInfo.whatsapp}
                      onChange={(e) => handleNestedInputChange('contactInfo', 'whatsapp', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Languages className="w-4 h-4 text-blue-600" /> Languages
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm border border-blue-200 dark:border-blue-700 flex items-center gap-2"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => handleLanguageRemove(lang)}
                          className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    onChange={(e) => {
                      handleLanguageAdd(e.target.value)
                      e.target.value = ''
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Add a language</option>
                    {['Hindi', 'Nepali', 'Bengali', 'Chinese', 'French', 'German', 'Spanish'].map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" /> Specialization
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {specializationOptions.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => handleSpecializationToggle(spec)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                          formData.specialization.includes(spec)
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 shadow-md'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" /> Pricing (in INR) *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Hourly Rate</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.pricing.hourlyRate}
                        onChange={(e) => handleNestedInputChange('pricing', 'hourlyRate', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Half Day (4hrs)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.pricing.halfDayRate}
                        onChange={(e) => handleNestedInputChange('pricing', 'halfDayRate', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="1500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Full Day (8hrs)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.pricing.fullDayRate}
                        onChange={(e) => handleNestedInputChange('pricing', 'fullDayRate', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="2500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                          formData.availableDays.includes(day)
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Next: Select Monasteries
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Monasteries */}
          {step === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                Select Monasteries
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Choose monasteries where you want to be listed as a guide. Visitors will see your profile when viewing these monasteries.
              </p>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 mb-6">
                {monasteries.map((monastery) => {
                  const isSelected = formData.selectedMonasteries.some(m => m.monasteryId === monastery._id)
                  return (
                    <button
                      key={monastery._id}
                      type="button"
                      onClick={() => handleMonasteryToggle(monastery)}
                      className={`w-full p-4 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-600 shadow-md'
                          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-600'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{monastery.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{monastery.region} • {monastery.location?.district || 'Sikkim'}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Selected: {formData.selectedMonasteries.length} {formData.selectedMonasteries.length === 1 ? 'monastery' : 'monasteries'}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Next: Subscription
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Subscription */}
          {step === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                Subscription Plan
              </h2>

              <div className="space-y-4 mb-6">
                {[
                  { type: 'monthly', label: 'Monthly', price: '₹149/month', savings: '' },
                  { type: 'quarterly', label: 'Quarterly', price: '₹399/3 months', savings: 'Save 11%' },
                  { type: 'annual', label: 'Annual', price: '₹1499/year', savings: 'Save 16%' }
                ].map((plan) => (
                  <button
                    key={plan.type}
                    type="button"
                    onClick={() => setSubscriptionData(prev => ({ ...prev, planType: plan.type }))}
                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                      subscriptionData.planType === plan.type
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-600 shadow-md'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{plan.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{plan.price}</p>
                        {plan.savings && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold">{plan.savings}</p>
                        )}
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          subscriptionData.planType === plan.type
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-600'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {subscriptionData.planType === plan.type && (
                          <div className="w-3 h-3 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What's Included:</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Profile listing on selected monastery pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Customer reviews and ratings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Direct contact information display</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Priority placement for top-rated guides</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Monthly analytics dashboard</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-start gap-3 mb-6">
                <input
                  type="checkbox"
                  id="terms"
                  checked={subscriptionData.termsAccepted}
                  onChange={(e) => setSubscriptionData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                  className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                  I accept the terms and conditions, and agree to pay the monthly subscription fee to maintain my guide profile listing
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !subscriptionData.termsAccepted}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Complete Registration'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

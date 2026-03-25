import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Star,
  Users,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Layout } from '../components/Layout'
import { Marquee } from '../components/Marquee'
import { ScrollReveal } from '../components/ScrollReveal'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { SmartImage } from '../components/SmartImage'
import { useMonasteries } from '../context/MonasteryContext'
import { HERO_IMAGE, QUOTE_IMAGE, EXPERIENCE } from '../constants'

export default function Home() {
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('all')
  const navigate = useNavigate()
  const { monasteries } = useMonasteries()

  const handleExplore = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (region && region !== 'all') params.set('region', region)
    navigate(`/explore${params.toString() ? '?' + params.toString() : ''}`)
  }

  // Get first 6 monasteries for featured section, sorted by rating
  const featured = monasteries.slice(0, 6)

  return (
    <Layout noHero>
    <>
      <header
        className="relative min-h-[85vh] flex flex-col justify-between overflow-hidden"
      >
        <SmartImage
          src={HERO_IMAGE}
          alt="Sikkim monastery landscape"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          optimizeWidth={1800}
        />
        
        {/* Premium overlay system - adaptive for both themes */}
        <div className="absolute inset-0">
          {/* Base gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 dark:from-black/50 dark:via-black/30 dark:to-black/60" />
          
          {/* Light mode specific overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-slate-900/20 dark:hidden" />
          
          {/* Subtle vignette effect for depth */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/20" />
        </div>
        
        {/* Animated gradient orbs for luxury feel */}
        <div className="gradient-orb gradient-orb-1" aria-hidden />
        <div className="gradient-orb gradient-orb-2" aria-hidden />
        
        {/* Hero content with proper contrast */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28 z-10 relative">
          {/* Badge with enhanced contrast */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10 mb-6 max-w-fit">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-200 dark:text-amber-300 text-sm font-medium">
              Buddhist Heritage of the Himalayas
            </span>
          </div>
          
          {/* Main heading with normalized typography */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] max-w-5xl">
            <span className="text-white dark:text-white drop-shadow-2xl">
              Find your next{' '}
            </span>
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 dark:from-amber-400 dark:via-amber-500 dark:to-orange-500 drop-shadow-lg">
                monastery
              </span>
              {/* Subtle glow effect */}
              <span className="absolute inset-0 text-amber-400/50 blur-xl dark:blur-2xl" />
            </span>
            <br />
            <span className="text-white dark:text-white drop-shadow-2xl">
              to disconnect & reflect.
            </span>
          </h1>
          
          {/* Description with normalized text size */}
          <p className="mt-6 sm:mt-8 text-white/95 dark:text-white/90 text-base md:text-lg max-w-2xl leading-relaxed drop-shadow-lg backdrop-blur-sm">
            Curated monasteries across Sikkim — with travel guides, nearby stays, and the calm of ancient paths.
          </p>
          
          {/* Premium search bar with glass morphism */}
          <div className="mt-8 sm:mt-10 max-w-3xl">
            <div className="group relative">
              {/* Glass morphism container with enhanced contrast */}
              <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl group-hover:shadow-3xl transition-all duration-300" />
              
              <form onSubmit={handleExplore} className="relative p-6 sm:p-7">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search input with premium styling */}
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 dark:text-amber-500 z-10" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search monasteries..."
                      className="w-full pl-14 pr-5 py-4 bg-white/90 dark:bg-black/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-2xl border border-white/30 dark:border-white/20 focus:border-amber-400 dark:focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 dark:focus:ring-amber-500/50 backdrop-blur-sm transition-all duration-200 text-base font-medium"
                    />
                  </div>
                  
                  {/* Region selector with enhanced styling */}
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="px-6 py-4 bg-white/90 dark:bg-black/40 text-gray-900 dark:text-white rounded-2xl border border-white/30 dark:border-white/20 focus:border-amber-400 dark:focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 dark:focus:ring-amber-500/50 backdrop-blur-sm transition-all duration-200 font-medium cursor-pointer min-w-[180px]"
                  >
                    <option value="all">All regions</option>
                    <option value="East Sikkim">East Sikkim</option>
                    <option value="West Sikkim">West Sikkim</option>
                    <option value="North Sikkim">North Sikkim</option>
                    <option value="South Sikkim">South Sikkim</option>
                  </select>
                  
                  {/* Premium CTA button */}
                  <button
                    type="submit"
                    className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-600 dark:to-amber-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 min-w-[140px] border border-amber-400/30 dark:border-amber-500/30"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Explore
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </span>
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </header>

      <Marquee />

      <section className="border-y border-[var(--border-primary)] bg-[var(--bg-secondary)] py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
          <ScrollReveal><div><p className="font-heading text-2xl sm:text-3xl font-bold text-[var(--accent-primary)]"><AnimatedCounter end={monasteries.length || 0} suffix="+" /></p><p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Curated monasteries</p></div></ScrollReveal>
          <ScrollReveal delay={0.1}><div><p className="font-heading text-2xl sm:text-3xl font-bold text-[var(--accent-primary)]"><AnimatedCounter end={4} /></p><p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Regions of Sikkim</p></div></ScrollReveal>
          <ScrollReveal delay={0.2}><div><p className="font-heading text-2xl sm:text-3xl font-bold text-[var(--accent-primary)]"><AnimatedCounter end={300} suffix="+" /></p><p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Years of history</p></div></ScrollReveal>
          <ScrollReveal delay={0.3}><div><p className="font-heading text-2xl sm:text-3xl font-bold text-[var(--accent-primary)]"><AnimatedCounter end="∞" /></p><p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Moments of peace</p></div></ScrollReveal>
        </div>
      </section>

      <section id="explore" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <p className="text-[var(--accent-primary)]/90 text-sm uppercase mb-2 font-medium">Curated for you</p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Featured monasteries</h2>
              </div>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featured.length > 0 ? featured.map((m, i) => (
              <ScrollReveal key={m._id} delay={i * 0.08}>
                <Link to={`/monastery/${m._id}`} className="card group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                    <SmartImage
                      src={m.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80'}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      optimizeWidth={800}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass backdrop-blur-md border-[var(--accent-border)]">
                      <Star className="w-4 h-4 fill-[var(--accent-primary)] text-[var(--accent-primary)]" /> 
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{m.rating ?? '—'}</span>
                    </div>
                    
                    {/* Content Overlay on Hover */}
                    <div className="absolute bottom-4 left-4 right-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <h4 className="font-heading text-lg font-bold text-white mb-1">{m.name}</h4>
                      <p className="text-white/90 text-sm flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> 
                        {m.region || (m.location?.district || m.location?.village || m.location)} · Est. {m.established || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-[var(--bg-card)] rounded-b-2xl border border-[var(--border-primary)] border-t-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading text-base font-bold text-[var(--text-primary)] mb-1">{m.name}</h4>
                        <p className="text-[var(--text-secondary)] text-sm flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> 
                          {m.region || (m.location?.district || m.location?.village || m.location)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--accent-primary)] group-hover:translate-x-1 transition-transform duration-300">
                        <span className="text-xs font-medium">View details</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            )) : (
              <div className="col-span-full text-center py-12 text-[var(--text-muted)]">Loading monasteries...</div>
            )}
          </div>
        </div>
      </section>

      <section id="experience" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)] border-y border-[var(--border-primary)]">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <p className="text-[var(--accent-primary)]/90 text-sm uppercase mb-2">Why Sikkim</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">The experience</h2>
            <p className="text-[var(--text-secondary)] max-w-xl mb-12">More than a trip — a chance to slow down, breathe, and connect with centuries of spiritual heritage.</p>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {EXPERIENCE.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <div className="group rounded-2xl overflow-hidden border border-[var(--border-primary)] hover:border-[var(--accent-border)] transition bg-[var(--bg-card)] hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--accent-primary)]/10">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SmartImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    optimizeWidth={800}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-[var(--bg-primary)]"><item.icon className="w-5 h-5" /></div>
                    <span className="font-heading text-lg font-semibold text-[var(--text-primary)]">{item.title}</span>
                  </div>
                </div>
                <p className="p-4 text-[var(--text-secondary)] text-sm leading-relaxed">{item.desc}</p>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative py-24 sm:py-32 px-4 sm:px-6 flex items-center justify-center overflow-hidden"
      >
        <SmartImage
          src={QUOTE_IMAGE}
          alt="Prayer flags in the Himalayas"
          className="absolute inset-0 w-full h-full object-cover"
          optimizeWidth={1800}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)]/95 via-[var(--rose-bg)]/70 to-[var(--bg-primary)]/95" />
        <ScrollReveal>
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles className="w-8 h-8 text-[var(--accent-primary)]/80 mx-auto mb-4" />
          <blockquote className="font-heading text-xl md:text-2xl font-semibold text-[var(--text-primary)] leading-snug italic">
            “In the silence of the mountains, the monasteries keep the flame of wisdom alive. Visit not to escape, but to remember.”
          </blockquote>
          <p className="mt-6 text-[var(--accent-primary)]/80 text-sm">— Sikkim Monastery Explorer</p>
        </div>
        </ScrollReveal>
      </section>

      <section id="contribute" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-8 sm:p-12 border border-[var(--glass-border)] hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--accent-primary)]/10">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--rose-primary)] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--accent-primary)]/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-heading text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-3">Know a monastery we don't?</h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto leading-relaxed">
              Contribute details, photos, or travel tips. Earn badges as a community explorer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contribute" className="btn-primary px-8 py-3.5 font-semibold flex items-center justify-center gap-2 shadow-lg">
                <Users className="w-4 h-4" />
                Contribute a monastery
              </Link>
              <Link to="/leaderboard" className="btn-secondary px-8 py-3.5 font-medium flex items-center justify-center gap-2">
                <Star className="w-4 h-4" />
                View leaderboard
              </Link>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </section>

      <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--rose-primary)] flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/20">
              <span className="font-heading text-lg font-semibold text-white">ॐ</span>
            </div>
            <div>
              <p className="font-heading font-semibold text-[var(--text-primary)]">Sikkim Monastery Explorer</p>
              <p className="text-xs text-[var(--text-muted)]">Monk-robe inspired · Built with care</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
            <Link to="/explore" className="hover:text-[var(--accent-primary)] transition-colors">Explore</Link>
            <Link to="/leaderboard" className="hover:text-[var(--accent-primary)] transition-colors">Leaderboard</Link>
            <Link to="/contribute" className="hover:text-[var(--accent-primary)] transition-colors">Contribute</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[var(--border-primary)] text-center text-xs text-[var(--text-muted)]">
          Tailwind CSS 4.1 (PostCSS) · React · Vite. Palette: saffron, maroon & gold.
        </div>
      </footer>
    </>
    </Layout>
  )
}

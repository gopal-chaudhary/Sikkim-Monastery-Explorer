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
          fetchpriority="high"
          optimizeWidth={1800}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-950/75 to-stone-950" />
        <div className="gradient-orb gradient-orb-1" aria-hidden />
        <div className="gradient-orb gradient-orb-2" aria-hidden />
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28 z-10 relative">
          <p className="text-amber-400/90 text-sm sm:text-base tracking-[0.2em] uppercase mb-3">Buddhist Heritage of the Himalayas</p>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-amber-50 leading-[1.1] max-w-4xl">
            Find your next <span className="gradient-text">monastery</span>
            <br />to disconnect & reflect.
          </h2>
          <p className="mt-4 sm:mt-6 text-amber-100/80 text-base sm:text-lg max-w-xl">
            Curated monasteries across Sikkim — with travel guides, nearby stays, and the calm of ancient paths.
          </p>
          <div className="mt-8 sm:mt-10 max-w-2xl">
            <div className="glass rounded-2xl p-4 sm:p-5 shadow-2xl">
              <form onSubmit={handleExplore} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search monasteries..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="sm:w-44 px-4 py-3 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="all">All regions</option>
                  <option value="East Sikkim">East Sikkim</option>
                  <option value="West Sikkim">West Sikkim</option>
                  <option value="North Sikkim">North Sikkim</option>
                  <option value="South Sikkim">South Sikkim</option>
                </select>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-700 text-stone-900 font-semibold text-sm hover:brightness-110 transition shadow-lg flex items-center justify-center gap-2"
                >
                  Explore <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <Marquee />

      <section className="border-y border-amber-900/40 bg-stone-950/90 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
          <ScrollReveal><div><p className="font-heading text-3xl sm:text-4xl font-bold text-amber-400"><AnimatedCounter end={monasteries.length || 0} suffix="+" /></p><p className="text-xs sm:text-sm text-stone-400 mt-1">Curated monasteries</p></div></ScrollReveal>
          <ScrollReveal delay={0.1}><div><p className="font-heading text-3xl sm:text-4xl font-bold text-amber-400"><AnimatedCounter end={4} /></p><p className="text-xs sm:text-sm text-stone-400 mt-1">Regions of Sikkim</p></div></ScrollReveal>
          <ScrollReveal delay={0.2}><div><p className="font-heading text-3xl sm:text-4xl font-bold text-amber-400"><AnimatedCounter end={300} suffix="+" /></p><p className="text-xs sm:text-sm text-stone-400 mt-1">Years of history</p></div></ScrollReveal>
          <ScrollReveal delay={0.3}><div><p className="font-heading text-3xl sm:text-4xl font-bold text-amber-400"><AnimatedCounter end="∞" /></p><p className="text-xs sm:text-sm text-stone-400 mt-1">Moments of peace</p></div></ScrollReveal>
        </div>
      </section>

      <section id="explore" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <p className="text-amber-500/90 text-sm tracking-[0.15em] uppercase mb-2">Curated for you</p>
                <h3 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-amber-50">Featured monasteries</h3>
              </div>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {featured.length > 0 ? featured.map((m, i) => (
              <ScrollReveal key={m._id} delay={i * 0.08}>
                <Link to={`/monastery/${m._id}`} className="card-shine group rounded-2xl overflow-hidden bg-stone-900/60 border border-amber-900/30 hover:border-amber-700/50 transition-all duration-300 block hover:-translate-y-1">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SmartImage
                      src={m.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80'}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      optimizeWidth={800}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-stone-900/80 text-amber-400 text-xs font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {m.rating ?? '—'}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="font-heading text-xl sm:text-2xl font-bold text-amber-50">{m.name}</h4>
                      <p className="text-stone-400 text-xs sm:text-sm flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> 
                        {m.region || (m.location?.district || m.location?.village || m.location)} · Est. {m.established || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-stone-500 text-xs">View guide & book visit</span>
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                  </div>
                </Link>
              </ScrollReveal>
            )) : (
              <div className="col-span-full text-center py-8 text-stone-400">Loading monasteries...</div>
            )}
          </div>
        </div>
      </section>

      <section id="experience" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-stone-950/50 border-y border-amber-900/30">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <p className="text-amber-500/90 text-sm tracking-[0.15em] uppercase mb-2">Why Sikkim</p>
            <h3 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-amber-50 mb-4">The experience</h3>
            <p className="text-stone-400 max-w-xl mb-12">More than a trip — a chance to slow down, breathe, and connect with centuries of spiritual heritage.</p>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {EXPERIENCE.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <div className="group rounded-2xl overflow-hidden border border-amber-900/30 hover:border-amber-700/40 transition bg-stone-900/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/10">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SmartImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    optimizeWidth={800}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/90 flex items-center justify-center text-stone-900"><item.icon className="w-5 h-5" /></div>
                    <span className="font-heading text-xl font-semibold text-amber-50">{item.title}</span>
                  </div>
                </div>
                <p className="p-4 text-stone-400 text-sm leading-relaxed">{item.desc}</p>
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
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950/95 via-rose-950/70 to-stone-950/95" />
        <ScrollReveal>
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles className="w-8 h-8 text-amber-400/80 mx-auto mb-4" />
          <blockquote className="font-heading text-2xl sm:text-3xl md:text-4xl font-semibold text-amber-50 leading-snug italic">
            “In the silence of the mountains, the monasteries keep the flame of wisdom alive. Visit not to escape, but to remember.”
          </blockquote>
          <p className="mt-6 text-amber-200/80 text-sm">— Sikkim Monastery Explorer</p>
        </div>
        </ScrollReveal>
      </section>

      <section id="contribute" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-8 sm:p-12 border border-amber-900/40 hover:border-amber-700/50 transition-colors">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-700 flex items-center justify-center mx-auto mb-6">
              <Users className="w-7 h-7 text-amber-50" />
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-amber-50 mb-3">Know a monastery we don’t?</h3>
            <p className="text-stone-400 mb-6 max-w-md mx-auto">
              Contribute details, photos, or travel tips. Earn badges as a community explorer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contribute" className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition shadow-lg inline-center">
                Contribute a monastery
              </Link>
              <Link to="/leaderboard" className="px-6 py-3 rounded-xl border border-amber-700/50 text-amber-100 font-medium hover:bg-amber-900/30 transition inline-center">
                View leaderboard
              </Link>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </section>

      <footer className="border-t border-amber-900/40 bg-stone-950 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-700 flex items-center justify-center">
              <span className="font-heading text-lg font-semibold text-amber-50">ॐ</span>
            </div>
            <div>
              <p className="font-heading font-semibold text-amber-50">Sikkim Monastery Explorer</p>
              <p className="text-xs text-stone-500">Monk-robe inspired · Built with care</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-stone-400">
            <Link to="/explore" className="hover:text-amber-400 transition">Explore</Link>
            <Link to="/leaderboard" className="hover:text-amber-400 transition">Leaderboard</Link>
            <Link to="/contribute" className="hover:text-amber-400 transition">Contribute</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-amber-900/30 text-center text-xs text-stone-500">
          Tailwind CSS 4.1 (PostCSS) · React · Vite. Palette: saffron, maroon & gold.
        </div>
      </footer>
    </>
    </Layout>
  )
}

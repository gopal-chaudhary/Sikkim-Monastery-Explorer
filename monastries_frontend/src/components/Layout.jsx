import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LogOut,
  User,
  Shield,
} from 'lucide-react'
import { BackToTop } from './BackToTop'

const HERO_IMAGE = 'https://www.esikkimtourism.in/wp-content/uploads/2018/10/climate-bnnr.jpg'

export function Layout({ children, noHero }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-100">
      <nav className="sticky top-0 z-50 glass border-b border-amber-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-700 flex items-center justify-center shadow-lg shadow-amber-900/40">
              <span className="font-heading text-xl font-semibold text-amber-50">ॐ</span>
            </div>
            <div>
              <p className="font-heading font-bold text-amber-50 leading-tight">Sikkim Monastery Explorer</p>
              <p className="text-[10px] text-amber-200/80 hidden sm:block">Discover · Reflect · Journey</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/explore" className="text-sm text-amber-100/90 hover:text-amber-50 transition hidden sm:inline">Explore</Link>
            <Link to="/map" className="text-sm text-amber-100/90 hover:text-amber-50 transition">Map</Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300">
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-900/30 text-amber-100 text-sm">
                  <User className="w-4 h-4" /> {user.firstName}
                </Link>
                <Link to="/my-locations" className="text-sm text-amber-100/90 hover:text-amber-50 hidden sm:inline">My Listings</Link>
                <Link to="/my-guide-profile" className="text-sm text-amber-100/90 hover:text-amber-50 hidden sm:inline">Guide Profile</Link>
                <Link to="/contribute" className="text-sm text-amber-100/90 hover:text-amber-50 hidden sm:inline">Contribute</Link>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-stone-400 hover:text-rose-400 transition">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-amber-100/90 hover:text-amber-50">Login</Link>
                <Link to="/signup" className="px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-100 text-sm font-medium hover:bg-amber-500/30 transition">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </nav>
        <BackToTop />
        {!noHero && (
        <header
          className="relative h-[42vh] min-h-[280px] flex flex-col justify-end pb-8 px-4 sm:px-6"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(12,10,9,0.85) 100%), url(${HERO_IMAGE}) center/cover no-repeat`,
          }}
        >
          <div className="max-w-6xl mx-auto w-full">
            <p className="text-amber-400/90 text-xs sm:text-sm tracking-widest uppercase">Buddhist Heritage of the Himalayas</p>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-amber-50 mt-1">
              Find your next <span className="gradient-text">monastery</span>
            </h1>
          </div>
        </header>
      )}
      <main>{children}</main>
    </div>
  )
}

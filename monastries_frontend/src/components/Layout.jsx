import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LogOut,
  User,
  Shield,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { BackToTop } from './BackToTop'
import { SmartImage } from './SmartImage'
import { CommandPalette } from './CommandPalette'
import { useTheme } from '../context/ThemeContext'

const HERO_IMAGE = 'https://www.esikkimtourism.in/wp-content/uploads/2018/10/climate-bnnr.jpg'

export function Layout({ children, noHero }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { theme, toggle, mounted } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <CommandPalette isAdmin={isAdmin} />
      
      {/* Enhanced Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-[var(--border-primary)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--rose-primary)] flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/20 group-hover:shadow-[var(--accent-primary)]/30 transition-all duration-300">
                <span className="font-heading text-xl font-semibold text-white">ॐ</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-heading font-bold text-[var(--text-primary)] leading-tight group-hover:text-[var(--accent-primary)] transition-colors">Sikkim Monastery Explorer</p>
                <p className="text-xs text-[var(--text-muted)]">Discover · Reflect · Journey</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/explore" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors font-medium">Explore</Link>
              <Link to="/map" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors font-medium">Map</Link>
              {user && (
                <>
                  <Link to="/my-locations" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors font-medium">My Listings</Link>
                  <Link to="/my-guide-profile" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors font-medium">Guide Profile</Link>
                  <Link to="/contribute" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors font-medium">Contribute</Link>
                </>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggle}
                className="btn-secondary p-2.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-all duration-200"
                aria-label="Toggle light/dark mode"
              >
                {mounted && (
                  theme === 'dark' ? 
                    <Sun className="w-4 h-4 text-[var(--accent-primary)]" /> : 
                    <Moon className="w-4 h-4 text-[var(--accent-primary)]" />
                )}
              </button>

              {/* Search Button */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('cmdk:open'))}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent-border)] transition-all duration-200"
                aria-label="Open search (Command+K)"
              >
                <span className="text-sm text-[var(--text-secondary)]">Search</span>
                <kbd className="text-xs text-[var(--text-muted)] border border-[var(--border-secondary)] rounded px-1.5 py-0.5">⌘K</kbd>
              </button>

              {/* Admin Badge */}
              {isAdmin && (
                <Link to="/admin" className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg bg-[var(--rose-bg)] border border-[var(--rose-border)] text-[var(--rose-primary)] text-sm font-medium hover:bg-[var(--rose-border)] transition-colors">
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}

              {/* User Actions */}
              {user ? (
                <>
                  <Link to="/profile" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent-primary)] text-sm font-medium hover:bg-[var(--accent-border)] transition-colors">
                    <User className="w-4 h-4" /> {user.firstName}
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="hidden sm:flex items-center gap-1 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--rose-primary)] transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] font-medium transition-colors">Login</Link>
                  <Link to="/signup" className="btn-primary text-sm px-4 py-2">Sign up</Link>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-[var(--border-primary)]">
              <div className="flex flex-col space-y-3">
                <Link to="/explore" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors font-medium">Explore</Link>
                <Link to="/map" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors font-medium">Map</Link>
                {user && (
                  <>
                    <Link to="/my-locations" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors font-medium">My Listings</Link>
                    <Link to="/my-guide-profile" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors font-medium">Guide Profile</Link>
                    <Link to="/contribute" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors font-medium">Contribute</Link>
                    <Link to="/profile" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors font-medium">Profile</Link>
                    <button 
                      onClick={handleLogout} 
                      className="text-[var(--text-muted)] hover:text-[var(--rose-primary)] transition-colors text-left"
                    >
                      Logout
                    </button>
                  </>
                )}
                {!user && (
                  <>
                    <Link to="/login" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors font-medium">Login</Link>
                    <Link to="/signup" className="btn-primary text-sm text-center">Sign up</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <BackToTop />
      {!noHero && (
        <header className="relative h-[45vh] min-h-[320px] flex flex-col justify-end pb-12 px-4 sm:px-6 overflow-hidden">
          <SmartImage
            src={HERO_IMAGE}
            alt="Sikkim mountains"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/20 via-[var(--bg-primary)]/60 to-[var(--bg-primary)]/80" />
          <div className="max-w-6xl mx-auto w-full z-10 relative">
            <p className="text-[var(--accent-light)] text-sm sm:text-base tracking-widest uppercase mb-3 font-medium">Buddhist Heritage of the Himalayas</p>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] max-w-4xl">
              Find your next <span className="gradient-text">monastery</span>
            </h1>
          </div>
        </header>
      )}
      
      <main>{children}</main>
    </div>
  )
}

import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { MonasteryProvider } from './context/MonasteryContext'
import './App.css'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Explore = lazy(() => import('./pages/Explore'))
const MapPage = lazy(() => import('./pages/MapPage'))
const MonasteryDetail = lazy(() => import('./pages/MonasteryDetail'))
const MonasteryWiki = lazy(() => import('./pages/MonasteryWiki'))
const Profile = lazy(() => import('./pages/Profile'))
const Contribute = lazy(() => import('./pages/Contribute'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Admin = lazy(() => import('./pages/Admin'))
const MyContributions = lazy(() => import('./pages/MyContributions'))
const MyLocations = lazy(() => import('./pages/MyLocations'))
const LocationDetail = lazy(() => import('./pages/LocationDetail'))
const BecomeGuide = lazy(() => import('./pages/BecomeGuide'))
const MyGuideProfile = lazy(() => import('./pages/MyGuideProfile'))
const ListBusiness = lazy(() => import('./pages/ListBusiness'))
const Status = lazy(() => import('./pages/Status'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RouteLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="h-10 w-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 skeleton mb-4" />
        <div className="h-5 w-2/3 skeleton rounded mb-2" />
        <div className="h-4 w-full skeleton rounded mb-2" />
        <div className="h-4 w-5/6 skeleton rounded" />
      </div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const MotionDiv = motion.div

  return (
    <AnimatePresence mode="wait">
      <MotionDiv
        key={location.pathname}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
      >
        <Suspense fallback={<RouteLoading />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/status" element={<Status />} />
            <Route path="/monastery/:id" element={<MonasteryDetail />} />
            <Route path="/monastery/:id/wiki" element={<MonasteryWiki />} />
            <Route path="/location/:id" element={<LocationDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-contributions" element={<MyContributions />} />
            <Route path="/my-locations" element={<MyLocations />} />
            <Route path="/become-guide" element={<BecomeGuide />} />
            <Route path="/my-guide-profile" element={<MyGuideProfile />} />
            <Route path="/list-business" element={<ListBusiness />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </MotionDiv>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MonasteryProvider>
        <BrowserRouter>
          <AnimatedRoutes />
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastStyle={{ background: '#1c1917', color: '#fafaf9', border: '1px solid rgba(245,158,11,0.3)' }}
          />
        </BrowserRouter>
      </MonasteryProvider>
    </AuthProvider>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { MonasteryProvider } from './context/MonasteryContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Explore from './pages/Explore'
import MapPage from './pages/MapPage'
import MonasteryDetail from './pages/MonasteryDetail'
import MonasteryWiki from './pages/MonasteryWiki'
import Profile from './pages/Profile'
import Contribute from './pages/Contribute'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'
import MyContributions from './pages/MyContributions'
import MyLocations from './pages/MyLocations'
import LocationDetail from './pages/LocationDetail'
import BecomeGuide from './pages/BecomeGuide'
import MyGuideProfile from './pages/MyGuideProfile'
import ListBusiness from './pages/ListBusiness'
import NotFound from './pages/NotFound'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <MonasteryProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/map" element={<MapPage />} />
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

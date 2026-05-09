import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import GoogleAuthSuccess from './pages/GoogleAuthSuccess'
import FileComplaint from './pages/FileComplaint'
import TrackComplaint from './pages/TrackComplaint'
import EWasteRequest from './pages/EWasteRequest'
import MapViewPage from './pages/MapView'
import AwarenessHub from './pages/AwarenessHub'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
    <Route path="/file-complaint" element={<ProtectedRoute><FileComplaint /></ProtectedRoute>} />
    <Route path="/track-complaint" element={<ProtectedRoute><TrackComplaint /></ProtectedRoute>} />
    <Route path="/ewaste" element={<ProtectedRoute><EWasteRequest /></ProtectedRoute>} />
    <Route path="/map" element={<MapViewPage />} />
    <Route path="/awareness" element={<AwarenessHub />} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
)

export default AppRoutes
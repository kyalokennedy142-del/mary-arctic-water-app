import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
// ... other imports

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        } />
        <Route path="/stock" element={
          <ProtectedRoute>
            <Stock />
          </ProtectedRoute>
        } />
        <Route path="/sales" element={
          <ProtectedRoute>
            <Sales />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        
        {/* Redirect root to dashboard if authenticated, else login */}
        <Route path="/" element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}
"use client"

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, authError } = useAuth()
  const location = useLocation()

  // ✅ Show error if auth failed
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="card p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{authError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary-gradient rounded-xl px-6 py-2"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ✅ Loading state - with timeout fallback
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Loading...</p>
          {/* ✅ Fallback: If loading >10s, show retry */}
          <p className="text-xs text-muted-foreground mt-4">
            If this takes too long, <button 
              onClick={() => window.location.reload()}
              className="text-primary underline"
            >
              refresh the page
            </button>
          </p>
        </div>
      </div>
    )
  }

  // ✅ Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // ✅ Render children if authenticated
  return children
}
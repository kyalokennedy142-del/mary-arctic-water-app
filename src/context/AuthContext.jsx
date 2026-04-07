"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('admin')
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line no-unused-vars
  const [authError, setAuthError] = useState(null)

  // ✅ Get user role - with graceful fallback (NO TIMEOUT)
  const getUserRole = async (userId) => {
    try {
      // Simple query - no timeout wrapper that can cause issues
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single()
      
      return profile?.role || 'admin'
    } catch (error) {
      // ✅ Always return safe default - both users are admins anyway
      console.warn('⚠️ Using default role (admin):', error.message)
      return 'admin'
    }
  }

  useEffect(() => {
    let isMounted = true
    let authSubscription = null

    const initializeAuth = async () => {
      try {
        // ✅ Simple session check - NO timeout wrapper
        // Supabase handles its own internal timeouts
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (session?.user) {
          // ✅ Email whitelist check (only Mary & Kennedy)
          const allowedEmails = [
            'nyamburamary89@gmail.com',
            'kyalokennedy142@gmail.com'
          ]
          
          if (!allowedEmails.includes(session.user.email)) {
            console.warn('⚠️ Unauthorized email:', session.user.email)
            await supabase.auth.signOut()
            toast.error('Access denied. Authorized users only.')
            setUser(null)
            setLoading(false)
            return
          }
          
          setUser(session.user)
          
          // ✅ Get role with fallback
          const role = await getUserRole(session.user.id)
          if (isMounted) {
            setUserRole(role)
          }
        } else {
          // No session = not logged in (normal state)
          setUser(null)
        }
        
      } catch (error) {
        // ✅ Handle errors gracefully - don't crash the app
        console.warn('⚠️ Auth init warning (continuing):', error.message)
        
        // Still try to get session as fallback
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const allowedEmails = ['nyamburamary89@gmail.com', 'kyalokennedy142@gmail.com']
            if (allowedEmails.includes(session.user.email)) {
              setUser(session.user)
              const role = await getUserRole(session.user.id)
              if (isMounted) setUserRole(role)
            }
          }
        } catch (fallbackError) {
          console.warn('⚠️ Fallback auth also failed:', fallbackError.message)
        }
      } finally {
        // ✅ ALWAYS resolve loading - critical for app to render
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // ✅ Auth state change listener - handles login/logout/refresh
    authSubscription = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        if (session?.user) {
          const allowedEmails = ['nyamburamary89@gmail.com', 'kyalokennedy142@gmail.com']
          
          if (!allowedEmails.includes(session.user.email)) {
            await supabase.auth.signOut()
            toast.error('Access denied.')
            setUser(null)
            setLoading(false)
            return
          }
          
          setUser(session.user)
          const role = await getUserRole(session.user.id)
          if (isMounted) {
            setUserRole(role)
            setLoading(false)
          }
        } else {
          setUser(null)
          setUserRole('admin')
          setLoading(false)
        }
      }
    )

    // ✅ Cleanup on unmount
    return () => {
      isMounted = false
      if (authSubscription?.unsubscribe) {
        authSubscription.unsubscribe()
      }
    }
  }, [])

  // ✅ Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole, 
      loading, 
      authError,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
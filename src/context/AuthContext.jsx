"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('admin')
  const [loading, setLoading] = useState(true) // Start as loading
  const [authError, setAuthError] = useState(null)

  // ✅ Get user role - with timeout fallback
  const getUserRole = async (userId, timeoutMs = 5000) => {
    try {
      // Timeout promise
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Role fetch timeout')), timeoutMs)
      )
      
      // Race between fetch and timeout
      const { data: profile } = await Promise.race([
        supabase.from('user_profiles').select('role').eq('id', userId).single(),
        timeout
      ])
      
      return profile?.role || 'admin'
    } catch (error) {
      console.warn('⚠️ Could not fetch user role (using default):', error.message)
      return 'admin' // Safe default - both users are admins
    }
  }

  useEffect(() => {
    let isMounted = true
    
    const initializeAuth = async () => {
      try {
        // ✅ Get session with timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 10000)
        )
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise])
        
        if (!isMounted) return
        
        if (session?.user) {
          // ✅ Email whitelist check
          const allowedEmails = [
            'nyamburamary89@gmail.com',
            'kyalokennedy142@gmail.com'
          ]
          
          if (!allowedEmails.includes(session.user.email)) {
            console.warn('⚠️ Unauthorized email:', session.user.email)
            await supabase.auth.signOut()
            toast.error('Access denied. Authorized users only.')
            setUser(null)
            setLoading(false) // ✅ Always resolve loading
            return
          }
          
          setUser(session.user)
          
          // ✅ Get role with fallback
          const role = await getUserRole(session.user.id)
          if (isMounted) {
            setUserRole(role)
          }
        } else {
          // No session = not logged in
          setUser(null)
        }
        
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        setAuthError(error.message)
        // ✅ CRITICAL: Always resolve loading even on error
        setUser(null)
        setUserRole('admin')
      } finally {
        // ✅ CRITICAL: Always set loading to false
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // ✅ Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
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

    // ✅ Cleanup
    return () => {
      isMounted = false
      subscription.unsubscribe()
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
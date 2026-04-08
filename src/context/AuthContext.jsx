"use client"

import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { debugAuth, debugAuthError, debugLock, startTiming, endTiming, addTimingEvent } from '@/lib/debug'
import { toast } from 'sonner'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('admin')
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  
  // ✅ CRITICAL: Prevent concurrent auth operations with mutex
  const authLockRef = useRef(false)
  const roleUpdateInProgressRef = useRef(new Map())

  // ✅ Get user role with debounce to prevent concurrent requests
  const getUserRole = async (userId) => {
    // ✅ PREVENT DUPLICATE ROLE FETCHES: Return cached promise if already in progress
    if (roleUpdateInProgressRef.current.has(userId)) {
      debugLock('🔒 Role fetch already in progress, returning cached promise', { userId })
      return roleUpdateInProgressRef.current.get(userId)
    }

    startTiming(`getRoleRole-${userId}`)
    addTimingEvent(`getRoleRole-${userId}`, 'role-fetch-start')
    
    const rolePromise = (async () => {
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', userId)
          .single()
        
        addTimingEvent(`getRoleRole-${userId}`, 'role-fetch-complete')
        const role = profile?.role || 'admin'
        debugAuth(`✅ User role fetched: ${role}`, { userId })
        return role
      } catch (error) {
        debugAuthError(`⚠️ Role fetch failed: ${error.message}`, { userId })
        return 'admin'
      } finally {
        roleUpdateInProgressRef.current.delete(userId)
        endTiming(`getRoleRole-${userId}`)
      }
    })()

    roleUpdateInProgressRef.current.set(userId, rolePromise)
    return rolePromise
  }

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      // ✅ CRITICAL: Use mutex to prevent concurrent auth operations
      if (authLockRef.current) {
        debugLock('🔒 Auth already initializing, skipping duplicate', { lockActive: true })
        return
      }
      debugLock('🔓 Acquiring auth lock...')
      authLockRef.current = true
      startTiming('initializeAuth')
      addTimingEvent('initializeAuth', 'auth-lock-acquired')

      try {
        // ✅ COMPLETELY NEW APPROACH: Don't call getSession!
        // onAuthStateChange is already listening and will fire immediately for existing sessions
        // This avoids the hanging getSession() call entirely
        
        debugAuth('⏳ Waiting for onAuthStateChange listener to set initial auth state...')
        addTimingEvent('initializeAuth', 'waiting-for-listener')
        
        // Just wait a short moment for listener to fire, then mark loading as false
        // The listener will handle setting user/role
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (!isMounted) {
          debugAuth('⚠️ Component unmounted during auth wait')
          return
        }
        
        // ✅ Set loading to false - listener will handle the rest
        setLoading(false)
        debugAuth('✅ Auth init complete - state will be set by onAuthStateChange listener')
        addTimingEvent('initializeAuth', 'listener-wait-complete')
        
      } catch (error) {
        debugAuthError(`⚠️ Auth init error: ${error.message}`)
        if (isMounted) {
          setLoading(false)
        }
      } finally {
        authLockRef.current = false
        endTiming('initializeAuth')
        debugLock('🔓 Auth lock released')
      }
    }

    initializeAuth()

    // ✅ FIX: Subscribe to changes - this is the SOURCE OF TRUTH for auth state
    // This listener handles all auth state changes reliably without timeouts
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      
      debugAuth(`📢 Auth state change event: ${event}`)
      
      if (event === 'SIGNED_IN' && session?.user) {
        debugAuth(`✅ User signed in: ${session.user.email}`)
        const allowedEmails = ['nyamburamary89@gmail.com', 'kyalokennedy142@gmail.com']
        
        if (!allowedEmails.includes(session.user.email)) {
          debugAuthError(`❌ Signed-in user not in whitelist: ${session.user.email}`)
          await supabase.auth.signOut()
          toast.error('Access denied.')
          setUser(null)
          setLoading(false)
          return
        }
        
        setUser(session.user)
        setAuthError(null)
        const role = await getUserRole(session.user.id)
        if (isMounted) {
          setUserRole(role)
          setLoading(false)  // ✅ NEW: Mark loading as complete
          debugAuth(`✅ Role set for signed-in user: ${role}`)
        }
      } else if (event === 'SIGNED_OUT' || !session?.user) {
        debugAuth('📢 User signed out or session cleared')
        setUser(null)
        setUserRole('admin')
        setAuthError(null)
        setLoading(false)  // ✅ NEW: Mark loading as complete
      }
    })

    // Cleanup
    return () => {
      isMounted = false
      if (subscription?.unsubscribe) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signOut, authError }}>
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
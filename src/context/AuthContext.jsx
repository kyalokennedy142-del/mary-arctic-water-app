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
  const lastAuthEventRef = useRef(null)

  // ✅ Get user role with timeout to prevent blocking UI
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
        // ✅ ADD TIMEOUT: Don't wait more than 3 seconds for role fetch
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        
        try {
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', userId)
            .single()
          
          clearTimeout(timeoutId)
          
          if (error) {
            debugAuthError(`⚠️ Role fetch query failed: ${error.message}`, { userId })
            return 'admin'
          }
          
          addTimingEvent(`getRoleRole-${userId}`, 'role-fetch-complete')
          const role = profile?.role || 'admin'
          debugAuth(`✅ User role fetched: ${role}`, { userId })
          return role
        } catch (queryError) {
          clearTimeout(timeoutId)
          debugAuthError(`⚠️ Role fetch aborted/timeout: ${queryError.message}`, { userId })
          return 'admin'
        }
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
        // ✅ FASTEST APPROACH: Don't wait or call getSession
        // Just open the listener subscription, it handles everything
        // The listener will fire immediately on both initial load and after login
        
        debugAuth('⏳ Setting up onAuthStateChange listener...')
        addTimingEvent('initializeAuth', 'listener-setup')
        
        // Minimal setup - listener will handle loading state
        debugAuth('✅ Auth init complete - listener is active and will restore session')
        addTimingEvent('initializeAuth', 'init-complete')
        
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
      
      // ✅ DEBOUNCE: Prevent duplicate SIGNED_OUT events
      const eventKey = `${event}-${session?.user?.id || 'null'}`
      if (lastAuthEventRef.current === eventKey) {
        debugAuth(`⏭️ Skipping duplicate auth event: ${event}`)
        return
      }
      lastAuthEventRef.current = eventKey
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
        setLoading(false)  // ✅ CRITICAL: Unblock UI immediately
        
        // ✅ Fetch role in BACKGROUND without blocking
        getUserRole(session.user.id).then(role => {
          if (isMounted) {
            setUserRole(role)
            debugAuth(`✅ Role set for signed-in user: ${role}`)
          }
        }).catch(() => {
          if (isMounted) {
            setUserRole('admin')
            debugAuth(`✅ Role defaulted to admin (fetch failed)`)
          }
        })
      } else if (event === 'SIGNED_OUT' || !session?.user) {
        debugAuth('📢 User signed out or session cleared')
        setUser(null)
        setUserRole('admin')
        setAuthError(null)
        setLoading(false)  // ✅ CRITICAL: Mark loading as complete
      } else {
        // ✅ INITIAL AUTH CHECK on first mount (no event needed)
        // When component first mounts, listener fires with current session
        debugAuth('📢 Initial auth state check')
        setLoading(false)  // If no session, stop loading
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
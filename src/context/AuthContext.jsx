"use client"

import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { debugAuth, debugAuthError, debugLock, startTiming, endTiming, addTimingEvent } from '@/lib/debug'
import { toast } from 'sonner'

const AuthContext = createContext(null)

// 🔒 CORE ROLE LOGIC: These emails are the Owners. Everyone else is an Attendant.
const OWNER_EMAILS = ['nyamburamary89@gmail.com', 'kyalokennedy142@gmail.com']

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('attendant') 
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  
  const authLockRef = useRef(false)
  const roleUpdateInProgressRef = useRef(new Map())
  const lastAuthEventRef = useRef(null)

  // ✅ Get user role. Now accepts userEmail as a fallback!
  const getUserRole = async (userId, userEmail) => {
    if (roleUpdateInProgressRef.current.has(userId)) {
      debugLock('🔒 Role fetch already in progress, returning cached promise', { userId })
      return roleUpdateInProgressRef.current.get(userId)
    }

    startTiming(`getRoleRole-${userId}`)
    addTimingEvent(`getRoleRole-${userId}`, 'role-fetch-start')
    
    const rolePromise = (async () => {
      try {
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
            // 🔒 FALLBACK: If DB fails, determine role by email
            return OWNER_EMAILS.includes(userEmail) ? 'owner' : 'attendant'
          }
          
          addTimingEvent(`getRoleRole-${userId}`, 'role-fetch-complete')
          // 🔒 FALLBACK: If profile exists but role is missing, determine by email
          const role = profile?.role || (OWNER_EMAILS.includes(userEmail) ? 'owner' : 'attendant')
          debugAuth(`✅ User role fetched: ${role}`, { userId })
          return role
        } catch (queryError) {
          clearTimeout(timeoutId)
          debugAuthError(`⚠️ Role fetch aborted/timeout: ${queryError.message}`, { userId })
          return OWNER_EMAILS.includes(userEmail) ? 'owner' : 'attendant'
        }
      } catch (error) {
        debugAuthError(`⚠️ Role fetch failed: ${error.message}`, { userId })
        return OWNER_EMAILS.includes(userEmail) ? 'owner' : 'attendant'
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
      if (authLockRef.current) {
        debugLock('🔒 Auth already initializing, skipping duplicate', { lockActive: true })
        return
      }
      debugLock('🔓 Acquiring auth lock...')
      authLockRef.current = true
      startTiming('initializeAuth')
      addTimingEvent('initializeAuth', 'auth-lock-acquired')

      try {
        debugAuth('⏳ Setting up onAuthStateChange listener...')
        addTimingEvent('initializeAuth', 'listener-setup')
        debugAuth('✅ Auth init complete - listener is active and will restore session')
        addTimingEvent('initializeAuth', 'init-complete')
      } catch (error) {
        debugAuthError(`⚠️ Auth init error: ${error.message}`)
        if (isMounted) setLoading(false)
      } finally {
        authLockRef.current = false
        endTiming('initializeAuth')
        debugLock('🔓 Auth lock released')
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      
      const eventKey = `${event}-${session?.user?.id || 'null'}`
      if (lastAuthEventRef.current === eventKey) {
        debugAuth(`⏭️ Skipping duplicate auth event: ${event}`)
        return
      }
      lastAuthEventRef.current = eventKey
      debugAuth(`📢 Auth state change event: ${event}`)
      
      if (event === 'SIGNED_IN' && session?.user) {
        debugAuth(`✅ User signed in: ${session.user.email}`)
        
        // 🔒 REMOVED THE STRICT WHITELIST BLOCK! 
        // Now, ANYONE can log in. The role is determined by the email.
        
        setUser(session.user)
        setAuthError(null)
        setLoading(false)  
        
        // ✅ Fetch role in BACKGROUND, passing the email as a fallback
        getUserRole(session.user.id, session.user.email).then(role => {
          if (isMounted) {
            setUserRole(role)
            debugAuth(`✅ Role set for signed-in user: ${role}`)
          }
        }).catch(() => {
          if (isMounted) {
            setUserRole('attendant') 
            debugAuth(`✅ Role defaulted to attendant (fetch failed)`) 
          }
        })
      } else if (event === 'SIGNED_OUT' || !session?.user) {
        debugAuth('📢 User signed out or session cleared')
        setUser(null)
        setUserRole('attendant') 
        setAuthError(null)
        setLoading(false)  
      } else {
        debugAuth('📢 Initial auth state check')
        setLoading(false)  
      }
    })

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
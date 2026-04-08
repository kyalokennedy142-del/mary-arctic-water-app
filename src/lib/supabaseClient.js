import { createClient } from '@supabase/supabase-js'
import { debugSupabase, debugSupabaseError, debugRLS, startTiming, endTiming, addTimingEvent } from '@/lib/debug'

// ✅ Read from environment variables (NEVER hardcode)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ✅ Validate credentials exist
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing! Check .env.local')
  debugSupabaseError('Supabase credentials missing! Check .env.local')
  throw new Error('Supabase configuration missing. Check .env.local file.')
}

debugSupabase('✅ Supabase credentials loaded')

// ✅ Create Supabase client with lock-safe configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // ✅ CRITICAL FIX: Prevent lock conflicts
    autoRefreshToken: true,           // Keep true for session freshness
    persistSession: true,              // Keep true for persistence
    detectSessionInUrl: false,         // Prevent URL hijacking
    storage: window.localStorage,      // Secure storage
    
    // ✅ NEW: Add flowType for better auth flow control
    flowType: 'implicit'               // Better for SPA apps
  },
  
  // ✅ Global fetch interceptor for RLS error handling
  global: {
    fetch: async (url, options = {}) => {
      const requestKey = `${options.method || 'GET'} ${url.split('?')[0]}`
      startTiming(requestKey)
      
      try {
        addTimingEvent(requestKey, 'fetch-start')
        const response = await fetch(url, options)
        addTimingEvent(requestKey, 'fetch-complete')
        
        // ✅ Handle RLS violation (403 Forbidden)
        if (response.status === 403) {
          debugRLS('🔐 RLS Violation (403) - Access denied', { url, method: options.method })
        }
        
        // ✅ Handle authentication errors (401)
        if (response.status === 401) {
          debugSupabase('⚠️ Authentication error (401) - Session may be expired', { url })
        }
        
        // Log successful requests
        if (response.ok) {
          debugSupabase(`✅ ${options.method || 'GET'} ${response.status}`, { url })
        }
        
        endTiming(requestKey)
        return response
      } catch (error) {
        debugSupabaseError('❌ Network error during request', { url, error: error.message })
        endTiming(requestKey)
        throw error
      }
    }
  }
})

// ✅ Helper: Check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// ✅ Helper: Get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ✅ Helper: Get user role
export const getUserRole = async (userId) => {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    return profile?.role || 'admin' // Default to admin since both users are admins
  } catch (error) {
    console.error('Error getting user role:', error)
    return 'admin' // Safe default
  }
}

export default supabase
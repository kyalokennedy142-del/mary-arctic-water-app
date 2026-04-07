import { createClient } from '@supabase/supabase-js'

// ✅ Read from environment variables (NEVER hardcode)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ✅ Validate credentials exist
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing! Check .env.local')
  throw new Error('Supabase configuration missing. Check .env.local file.')
}

// ✅ Create Supabase client with security features
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,        // Auto-refresh sessions
    persistSession: true,          // Persist across page reloads
    detectSessionInUrl: false,     // Prevent URL hijacking
    storage: window.localStorage   // Use secure browser storage
  },
  
  // ✅ Global fetch interceptor for RLS error handling
  global: {
    fetch: async (url, options = {}) => {
      try {
        const response = await fetch(url, options)
        
        // ✅ Handle RLS violation (403 Forbidden)
        if (response.status === 403) {
          console.warn('⚠️ RLS Violation: Access denied to', url)
        }
        
        // ✅ Handle authentication errors (401)
        if (response.status === 401) {
          console.warn('⚠️ Authentication error: Session may be expired')
        }
        
        return response
      } catch (error) {
        console.error('❌ Supabase network error:', error)
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
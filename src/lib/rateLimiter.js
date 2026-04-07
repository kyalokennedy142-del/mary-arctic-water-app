// Login attempt tracking (in production, use Redis or database)
const loginAttempts = new Map()

// Configuration
const CONFIG = {
  MAX_ATTEMPTS: 5,           // Block after 5 failed attempts
  WINDOW_MS: 15 * 60 * 1000, // 15 minute window
  BLOCK_DURATION_MS: 15 * 60 * 1000 // 15 minute block
}

// ✅ Check if login is allowed
export const checkRateLimit = async (identifier) => {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier) || []
  
  // Remove old attempts (outside the window)
  const recentAttempts = attempts.filter(time => now - time < CONFIG.WINDOW_MS)
  
  // Check if blocked
  if (recentAttempts.length >= CONFIG.MAX_ATTEMPTS) {
    const oldestAttempt = Math.min(...recentAttempts)
    const waitTimeMs = CONFIG.WINDOW_MS - (now - oldestAttempt)
    const waitMinutes = Math.ceil(waitTimeMs / 1000 / 60)
    
    // Log security event
    await logSecurityEvent('BRUTE_FORCE_ATTEMPT', {
      identifier,
      attempts: recentAttempts.length,
      blocked: true,
      waitMinutes
    })
    
    return {
      allowed: false,
      message: `Too many failed attempts. Try again in ${waitMinutes} minutes`,
      waitMinutes
    }
  }
  
  // Record this attempt
  recentAttempts.push(now)
  loginAttempts.set(identifier, recentAttempts)
  
  return { allowed: true }
}

// ✅ Clear attempts after successful login
export const clearLoginAttempts = (identifier) => {
  loginAttempts.delete(identifier)
}

// ✅ Get remaining attempts
export const getRemainingAttempts = (identifier) => {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier) || []
  const recentAttempts = attempts.filter(time => now - time < CONFIG.WINDOW_MS)
  return Math.max(0, CONFIG.MAX_ATTEMPTS - recentAttempts.length)
}

// Helper: Log security event
const logSecurityEvent = async (type, details) => {
  try {
    const { supabase } = await import('@/lib/supabaseClient')
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.from('security_events').insert({
      user_id: user?.id || null,
      user_email: details.identifier || null,
      event_type: type,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.warn('Failed to log security event:', error)
  }
}
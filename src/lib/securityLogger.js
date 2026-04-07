import { supabase } from '@/lib/supabaseClient'

// ✅ Security event types (for consistent logging)
export const SECURITY_EVENTS = {
  // Authentication events
  LOGIN_SUCCESS: 'SUCCESSFUL_LOGIN',
  LOGIN_FAILED: 'FAILED_LOGIN',
  LOGOUT: 'LOGOUT',
  PASSWORD_RESET: 'PASSWORD_RESET',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  
  // Authorization events
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  ROLE_CHANGE: 'ROLE_CHANGE',
  SESSION_TIMEOUT: 'SESSION_TIMEOUT',
  SESSION_STARTED: 'SESSION_STARTED',
  SESSION_ENDED: 'SESSION_ENDED',
  
  // Data events
  DATA_CREATE: 'DATA_CREATE',
  DATA_UPDATE: 'DATA_UPDATE',
  DATA_DELETE: 'DATA_DELETE',
  DATA_EXPORT: 'DATA_EXPORT',
  
  // Security events
  BRUTE_FORCE: 'BRUTE_FORCE',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMITED: 'RATE_LIMITED'
}

// ✅ Main function: Log security event to database
export const logSecurityEvent = async (eventType, details = {}) => {
  try {
    // Get current user (if any)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get IP address (optional, may fail in some environments)
    const ipAddress = await getIPAddress()
    
    // Prepare event data
    const eventData = {
      user_id: user?.id || null,
      user_email: user?.email || null,
      event_type: eventType,
      details: JSON.stringify({
        ...details,
        userAgent: navigator.userAgent,
        path: window.location.pathname,
        timestamp: new Date().toISOString()
      }),
      ip_address: ipAddress,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }
    
    // Insert into security_events table
    const { error } = await supabase
      .from('security_events')
      .insert(eventData)
    
    if (error) {
      console.warn('⚠️ Failed to log security event:', error.message)
      // Don't throw - logging shouldn't break the app
      return false
    }
    
    // Log to console for debugging (remove in production if desired)
    console.log(`🔐 Security Event: ${eventType}`, {
      email: user?.email,
      ...details
    })
    
    return true
  } catch (error) {
    // ✅ Never throw - logging failures shouldn't crash the app
    console.warn('⚠️ Security logging error:', error.message)
    return false
  }
}

// ✅ Helper: Get user IP address
const getIPAddress = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return 'unknown'
  }
}

// ✅ Helper: Log failed login (for brute force detection)
export const logFailedLogin = async (email, reason = 'invalid_credentials') => {
  return await logSecurityEvent(SECURITY_EVENTS.LOGIN_FAILED, {
    email,
    reason,
    timestamp: new Date().toISOString()
  })
}

// ✅ Helper: Log data changes (CRUD operations)
export const logDataChange = async (action, tableName, recordId, changes = {}) => {
  const eventType = 
    action === 'CREATE' ? SECURITY_EVENTS.DATA_CREATE :
    action === 'UPDATE' ? SECURITY_EVENTS.DATA_UPDATE :
    SECURITY_EVENTS.DATA_DELETE
  
  return await logSecurityEvent(eventType, {
    table: tableName,
    recordId,
    action,
    changes,
    timestamp: new Date().toISOString()
  })
}

// ✅ Helper: Check for suspicious activity (brute force detection)
export const checkSuspiciousActivity = async (identifier, windowMs = 15 * 60 * 1000, maxAttempts = 5) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const now = new Date().toISOString()
    const windowStart = new Date(Date.now() - windowMs).toISOString()
    
    // Count failed logins for this identifier in the time window
    const { count, error } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', SECURITY_EVENTS.LOGIN_FAILED)
      .eq('user_email', identifier)
      .gte('timestamp', windowStart)
    
    if (error) {
      console.warn('Failed to check suspicious activity:', error.message)
      return { suspicious: false }
    }
    
    if (count >= maxAttempts) {
      // Log brute force attempt
      await logSecurityEvent(SECURITY_EVENTS.BRUTE_FORCE, {
        identifier,
        attempts: count,
        windowMs,
        maxAttempts,
        timestamp: new Date().toISOString()
      })
      
      return {
        suspicious: true,
        reason: 'brute_force',
        attempts: count,
        message: `Too many failed attempts (${count}/${maxAttempts})`
      }
    }
    
    return { suspicious: false }
  } catch (error) {
    console.warn('Error checking suspicious activity:', error.message)
    return { suspicious: false }
  }
}

// ✅ Helper: Send alert for critical security events (placeholder for email/SMS)
export const sendSecurityAlert = async (eventType, details) => {
  const criticalEvents = [
    SECURITY_EVENTS.BRUTE_FORCE,
    SECURITY_EVENTS.UNAUTHORIZED_ACCESS,
    SECURITY_EVENTS.DATA_EXPORT,
    SECURITY_EVENTS.MASS_DELETE
  ]
  
  if (!criticalEvents.includes(eventType)) {
    return false
  }
  
  try {
    // Log the alert attempt
    await logSecurityEvent('SECURITY_ALERT_SENT', {
      originalEvent: eventType,
      details,
      timestamp: new Date().toISOString()
    })
    
    // In production, integrate with email/SMS service here:
    // Example: await sendEmail('admin@maryarcticwater.com', `🚨 ${eventType}`, details)
    // Example: await sendSMS('+254700000000', `🚨 ${eventType}: ${details.summary}`)
    
    console.log(`🚨 SECURITY ALERT: ${eventType}`, details)
    return true
  } catch (error) {
    console.error('Failed to send security alert:', error.message)
    return false
  }
}

// ✅ Helper: Get recent security events for admin dashboard
export const getRecentSecurityEvents = async (limit = 50, eventType = null) => {
  try {
    let query = supabase
      .from('security_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (eventType) {
      query = query.eq('event_type', eventType)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Failed to fetch security events:', error.message)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching security events:', error.message)
    return []
  }
}

// ✅ Helper: Get security stats for dashboard
export const getSecurityStats = async (days = 7) => {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: events, error } = await supabase
      .from('security_events')
      .select('event_type')
      .gte('timestamp', since)
    
    if (error) {
      console.error('Failed to fetch security stats:', error.message)
      return null
    }
    
    // Count events by type
    const stats = {}
    events?.forEach(event => {
      stats[event.event_type] = (stats[event.event_type] || 0) + 1
    })
    
    return {
      period: `${days} days`,
      totalEvents: events?.length || 0,
      byType: stats,
      generated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error generating security stats:', error.message)
    return null
  }
}
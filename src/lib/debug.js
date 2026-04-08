/* eslint-disable no-unused-vars */
// ✅ Central Debug Utility - Tracks Supabase, Auth, Locks & Requests
// This file logs EVERYTHING to help identify hanging issues

let logLevel = 'INFO' // NONE, ERROR, WARN, INFO, DEBUG, VERBOSE
let logs = []
let maxLogs = 500
let requestTimings = {}

// Define log levels
const LOG_LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  VERBOSE: 5
}

// ✅ Central logging function
export const debugLog = (level, category, message, data = null) => {
  const numLevel = LOG_LEVELS[logLevel] || LOG_LEVELS.INFO
  const messageLevel = LOG_LEVELS[level] || LOG_LEVELS.INFO
  
  if (messageLevel > numLevel) return
  
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    category,
    message,
    data,
    id: logs.length
  }
  
  // Add to in-memory logs
  logs.push(logEntry)
  if (logs.length > maxLogs) logs.shift()
  
  // Console output
  const prefix = `[${level}] [${category}] ${timestamp}`
  if (data) {
    console.log(prefix, message, data)
  } else {
    console.log(prefix, message)
  }
  
  // Store in window for browser access
  window.__DEBUG_LOGS__ = logs
}

// ✅ Track request timings
export const startTiming = (requestKey) => {
  requestTimings[requestKey] = { start: Date.now(), events: [] }
  debugLog('DEBUG', 'TIMING', `⏱️ Started: ${requestKey}`)
}

export const addTimingEvent = (requestKey, eventName) => {
  if (!requestTimings[requestKey]) {
    requestTimings[requestKey] = { start: Date.now(), events: [] }
  }
  const elapsed = Date.now() - requestTimings[requestKey].start
  requestTimings[requestKey].events.push({ event: eventName, elapsed })
  debugLog('DEBUG', 'TIMING', `  ↳ ${eventName} (+${elapsed}ms)`)
}

export const endTiming = (requestKey) => {
  if (!requestTimings[requestKey]) return
  const duration = Date.now() - requestTimings[requestKey].start
  debugLog('INFO', 'TIMING', `✅ Completed: ${requestKey} (${duration}ms)`, requestTimings[requestKey].events)
  delete requestTimings[requestKey]
  return duration
}

export const getSlowRequests = (threshold = 3000) => {
  return Object.entries(requestTimings)
    .filter(([_, data]) => {
      const duration = Date.now() - data.start
      return duration > threshold
    })
    .map(([key, data]) => ({
      request: key,
      duration: `${Date.now() - data.start}ms`,
      events: data.events
    }))
}

// ✅ Specific trackers
export const debugAuth = (message, data = null) => debugLog('INFO', 'AUTH', message, data)
export const debugAuthError = (message, data = null) => debugLog('ERROR', 'AUTH', message, data)

export const debugSupabase = (message, data = null) => debugLog('DEBUG', 'SUPABASE', message, data)
export const debugSupabaseError = (message, data = null) => debugLog('ERROR', 'SUPABASE', message, data)

export const debugRLS = (message, data = null) => debugLog('WARN', 'RLS', message, data)
export const debugRLSError = (error, query = null) => {
  debugLog('ERROR', 'RLS', `RLS Violation: ${error.message}`, { error: error.code, query })
}

export const debugLock = (message, data = null) => debugLog('DEBUG', 'LOCK', message, data)
export const debugRequest = (message, data = null) => debugLog('DEBUG', 'REQUEST', message, data)

// ✅ Get all logs
export const getLogs = () => logs
export const getCategoryLogs = (category) => logs.filter(l => l.category === category)
export const getErrorLogs = () => logs.filter(l => l.level === 'ERROR')

// ✅ Clear logs
export const clearLogs = () => {
  logs = []
  requestTimings = {}
  window.__DEBUG_LOGS__ = []
}

// ✅ Set log level
export const setLogLevel = (level) => {
  if (LOG_LEVELS[level]) {
    logLevel = level
    debugLog('INFO', 'DEBUG', `📊 Log level set to: ${level}`)
  }
}

// ✅ Export current state for debugging dashboard
export const getDebugState = () => ({
  logLevel,
  totalLogs: logs.length,
  totalErrors: logs.filter(l => l.level === 'ERROR').length,
  slowRequests: getSlowRequests(),
  recentLogs: logs.slice(-20),
  authLogs: getCategoryLogs('AUTH'),
  supabaseLogs: getCategoryLogs('SUPABASE'),
  rlsLogs: getCategoryLogs('RLS'),
  lockLogs: getCategoryLogs('LOCK'),
  requestLogs: getCategoryLogs('REQUEST'),
  requestTimings: Object.entries(requestTimings).map(([key, data]) => ({
    request: key,
    duration: `${Date.now() - data.start}ms`,
    events: data.events
  }))
})

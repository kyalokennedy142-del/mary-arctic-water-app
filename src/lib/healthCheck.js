// ✅ Supabase Connection Health Check
// Detects if Supabase is reachable and responding normally

import { supabase } from '@/lib/supabaseClient'
import { debugSupabase, debugSupabaseError, startTiming, endTiming } from '@/lib/debug'

export const checkSupabaseHealth = async () => {
  const healthKey = 'supabase-health-check'
  startTiming(healthKey)
  
  try {
    // ✅ Quick test: Try to query a simple table with 1-second timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase timeout')), 5000)
    )
    
    // Try simple health check - get auth user (doesn't depend on RLS)
    const queryPromise = supabase.auth.getUser()
    
    // eslint-disable-next-line no-unused-vars
    const result = await Promise.race([queryPromise, timeoutPromise])
    
    endTiming(healthKey)
    debugSupabase('✅ Supabase is responsive')
    return { healthy: true, message: 'Supabase responding normally' }
  } catch (error) {
    endTiming(healthKey)
    debugSupabaseError(`❌ Supabase health check failed: ${error.message}`)
    return { 
      healthy: false, 
      message: error.message.includes('timeout') 
        ? 'Supabase is slow or unresponsive (timeout)' 
        : `Supabase error: ${error.message}`
    }
  }
}

// ✅ Test individual table access
export const checkTableHealth = async (tableName) => {
  const healthKey = `table-health-${tableName}`
  startTiming(healthKey)
  
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 5000)
    )
    
    const queryPromise = supabase
      .from(tableName)
      .select('count()')
      .single()
    
    await Promise.race([queryPromise, timeoutPromise])
    
    endTiming(healthKey)
    debugSupabase(`✅ Table ${tableName} is accessible`)
    return { accessible: true }
  } catch (error) {
    endTiming(healthKey)
    const message = error.message || error.code || 'Unknown error'
    debugSupabaseError(`❌ Table ${tableName} error: ${message}`)
    return { 
      accessible: false, 
      error: message,
      isRLS: message.includes('42501') || message.includes('permission'),
      isTimeout: message.includes('timeout')
    }
  }
}

// ✅ Network connectivity check
export const checkNetworkHealth = async () => {
  try {
    // Simple HEAD request to Supabase (doesn't count as API call)
    const url = import.meta.env.VITE_SUPABASE_URL
    if (!url) return { online: false, reason: 'No Supabase URL' }
    
    // eslint-disable-next-line no-unused-vars
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors'
    })
    
    return { online: true }
  } catch (error) {
    return { 
      online: false, 
      reason: error.message 
    }
  }
}

// ✅ Run all health checks
export const runFullHealthCheck = async () => {
  debugSupabase('🏥 Running full Supabase health check...')
  
  const checks = {
    network: await checkNetworkHealth(),
    supabase: await checkSupabaseHealth(),
    tables: {}
  }
  
  // Check each table
  const tables = ['customers', 'stock', 'sales', 'user_profiles']
  for (const table of tables) {
    checks.tables[table] = await checkTableHealth(table)
  }
  
  return checks
}

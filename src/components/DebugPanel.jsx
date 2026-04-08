import { useState, useEffect } from 'react'
import { ChevronDown, RefreshCw, Trash2, Bug, Activity } from 'lucide-react'
import { 
  getDebugState, 
  setLogLevel, 
  clearLogs,
  getErrorLogs,
  // eslint-disable-next-line no-unused-vars
  getSlowRequests 
} from '@/lib/debug'
import { runFullHealthCheck } from '@/lib/healthCheck'

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [debugState, setDebugState] = useState(null)
  const [activeTab, setActiveTab] = useState('status')
  const [healthStatus, setHealthStatus] = useState(null)
  const [checkingHealth, setCheckingHealth] = useState(false)

  // Update debug state every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setDebugState(getDebugState())
    }, 500)
    return () => clearInterval(interval)
  }, [])
  
  // Quick health check function
  const runHealthCheck = async () => {
    setCheckingHealth(true)
    try {
      const health = await runFullHealthCheck()
      setHealthStatus(health)
      setActiveTab('health')
    } finally {
      setCheckingHealth(false)
    }
  }

  if (!debugState) {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg z-50 cursor-pointer"
        title="Open debug panel"
      >
        <Bug size={20} />
      </button>
    )
  }

  const errorCount = debugState.totalErrors
  const slowCount = debugState.slowRequests?.length || 0
  const hasIssues = errorCount > 0 || slowCount > 0

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all ${
          hasIssues 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
        title={hasIssues ? `⚠️ ${errorCount} errors, ${slowCount} slow requests` : 'Debug panel'}
      >
        <Bug size={20} />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl p-4 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-3 pb-2 border-b">
            <h3 className="font-bold text-sm">🐛 Debug Panel</h3>
            <button
              onClick={() => {
                clearLogs()
                setDebugState(null)
              }}
              className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
              title="Clear logs"
            >
              <Trash2 size={14} className="inline mr-1" />
              Clear
            </button>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
            <div className="bg-blue-50 dark:bg-blue-900 p-2 rounded">
              <div className="font-bold">{debugState.totalLogs}</div>
              <div className="text-gray-600 dark:text-gray-400">Logs</div>
            </div>
            <div className={`p-2 rounded ${errorCount > 0 ? 'bg-red-50 dark:bg-red-900' : 'bg-green-50 dark:bg-green-900'}`}>
              <div className="font-bold">{errorCount}</div>
              <div className="text-gray-600 dark:text-gray-400">Errors</div>
            </div>
            <div className={`p-2 rounded ${slowCount > 0 ? 'bg-yellow-50 dark:bg-yellow-900' : 'bg-green-50 dark:bg-green-900'}`}>
              <div className="font-bold">{slowCount}</div>
              <div className="text-gray-600 dark:text-gray-400">Slow</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-2 text-xs border-b">
            {['status', 'health', 'errors', 'timing', 'auth', 'rls'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-1 capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 font-bold'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto text-xs font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
            {activeTab === 'status' && (
              <div className="space-y-1">
                <div><span className="text-blue-500">Level:</span> {debugState.logLevel}</div>
                <div className="flex gap-1 mt-2">
                  {['NONE', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'VERBOSE'].map(level => (
                    <button
                      key={level}
                      onClick={() => setLogLevel(level)}
                      className={`px-1 py-0.5 rounded text-xs ${
                        debugState.logLevel === level
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-gray-600 dark:text-gray-400">
                  Open browser console (F12) to see full logs
                </div>
              </div>
            )}

            {activeTab === 'health' && (
              <div className="space-y-2">
                <button
                  onClick={runHealthCheck}
                  disabled={checkingHealth}
                  className={`w-full px-2 py-1 rounded text-xs font-bold ${
                    checkingHealth
                      ? 'bg-gray-400 text-gray-200 cursor-wait'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {checkingHealth ? '⏳ Checking...' : '🏥 Run Health Check'}
                </button>
                {healthStatus ? (
                  <div className="space-y-1 text-xs">
                    <div className={healthStatus.network?.online ? 'text-green-600' : 'text-red-600'}>
                      {healthStatus.network?.online ? '✅' : '❌'} Network: {healthStatus.network?.online ? 'Online' : healthStatus.network?.reason}
                    </div>
                    <div className={healthStatus.supabase?.healthy ? 'text-green-600' : 'text-red-600'}>
                      {healthStatus.supabase?.healthy ? '✅' : '❌'} Supabase: {healthStatus.supabase?.message}
                    </div>
                    <div className="mt-2 text-gray-600 dark:text-gray-400 font-bold">Tables:</div>
                    {Object.entries(healthStatus.tables || {}).map(([table, status]) => (
                      <div key={table} className={status.accessible ? 'text-green-600' : 'text-red-600'}>
                        {status.accessible ? '✅' : '❌'} {table}: {status.accessible ? 'OK' : (status.isRLS ? '🔐 RLS Error' : status.isTimeout ? '⏱️ Timeout' : status.error)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-600">Click "Run Health Check" to test Supabase connectivity</div>
                )}
              </div>
            )}

            {activeTab === 'errors' && (
              <div className="space-y-1">
                {errorCount === 0 ? (
                  <div className="text-green-600">✅ No errors</div>
                ) : (
                  getErrorLogs().map(log => (
                    <div key={log.id} className="text-red-600">
                      <div className="font-bold">[{log.category}]</div>
                      <div className="ml-2">{log.message}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'timing' && (
              <div className="space-y-2">
                {debugState.requestTimings?.length > 0 ? (
                  debugState.requestTimings.map((req, i) => (
                    <div key={i} className="border-l-2 border-yellow-500 pl-2">
                      <div className="font-bold">{req.request}</div>
                      <div className="text-yellow-600">{req.duration}</div>
                      {req.events?.map((ev, j) => (
                        <div key={j} className="ml-2 text-gray-600 dark:text-gray-400">
                          → {ev.event} (+{ev.elapsed}ms)
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="text-green-600">✅ No slow requests</div>
                )}
              </div>
            )}

            {activeTab === 'auth' && (
              <div className="space-y-1">
                {debugState.authLogs?.length > 0 ? (
                  debugState.authLogs.slice(-10).map(log => (
                    <div key={log.id} className={log.level === 'ERROR' ? 'text-red-600' : ''}>
                      <div>{log.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-600">No auth logs</div>
                )}
              </div>
            )}

            {activeTab === 'rls' && (
              <div className="space-y-1">
                {debugState.rlsLogs?.length > 0 ? (
                  debugState.rlsLogs.slice(-5).map(log => (
                    <div key={log.id} className="text-yellow-600">
                      <div className="font-bold">{log.message}</div>
                      {log.data && <div className="text-xs">{JSON.stringify(log.data).slice(0, 100)}...</div>}
                    </div>
                  ))
                ) : (
                  <div className="text-green-600">✅ No RLS issues</div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from 'react'
import { Mail, Lock, Droplets, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

// ✅ ADD: Rate limiting & security logging
import { checkRateLimit, clearLoginAttempts, getRemainingAttempts } from '@/lib/rateLimiter'
import { logSecurityEvent, SECURITY_EVENTS } from '@/lib/securityLogger'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!form.email || !form.password) {
      toast.error('Please enter both email and password')
      return
    }
    
    // ✅ STEP 1: Check rate limit BEFORE attempting login
    const rateLimit = await checkRateLimit(form.email)
    if (!rateLimit.allowed) {
      toast.error(rateLimit.message)
      
      // Alert on suspicious activity
      if (rateLimit.waitMinutes > 10) {
        await logSecurityEvent(SECURITY_EVENTS.BRUTE_FORCE, {
          email: form.email,
          waitMinutes: rateLimit.waitMinutes,
          timestamp: new Date().toISOString()
        })
      }
      return
    }
    
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      
      if (error) {
        // ✅ STEP 2: Log failed login
        await logSecurityEvent(SECURITY_EVENTS.LOGIN_FAILED, {
          email: form.email,
          error: error.message,
          remainingAttempts: getRemainingAttempts(form.email),
          timestamp: new Date().toISOString()
        })
        
        // Show remaining attempts warning
        const remaining = getRemainingAttempts(form.email)
        const attemptMsg = remaining > 0 
          ? ` (${remaining} attempts remaining)` 
          : ''
        
        toast.error('Incorrect email or password' + attemptMsg)
        return
      }
      
      // ✅ STEP 3: Clear attempts on successful login
      clearLoginAttempts(form.email)
      
      await logSecurityEvent(SECURITY_EVENTS.LOGIN_SUCCESS, {
        email: form.email,
        timestamp: new Date().toISOString()
      })
      
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Login failed: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-cyan-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-200 to-cyan-200 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Droplets className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            AquaBiz
          </h1>
          <p className="text-blue-800/70">Sign in to continue</p>
        </div>

        {/* ✅ Login Card - Beautiful Water Gradient */}
        <div className="rounded-2xl shadow-xl p-8 border border-blue-100/50 backdrop-blur-sm bg-linear-to-br from-white/90 via-blue-50/50 to-cyan-50/50">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-blue-900/80">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-11 h-12 bg-white/80 border-blue-200/50 focus:ring-blue-400/30 focus:border-blue-400"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {/* ✅ Rate limit warning */}
              {form.email && getRemainingAttempts(form.email) <= 2 && !isLoading && (
                <p className="text-xs text-orange-600 flex items-center gap-1">
                  ⚠️ {getRemainingAttempts(form.email)} attempts remaining before temporary lock
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-blue-900/80">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pl-11 pr-11 h-12 bg-white/80 border-blue-200/50 focus:ring-blue-400/30 focus:border-blue-400"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-blue-800/60 mt-4">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Sign up
              </button>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-blue-800/50 mt-6">
          💧 Secure login powered by Supabase
        </p>
      </div>
    </div>
  )
}
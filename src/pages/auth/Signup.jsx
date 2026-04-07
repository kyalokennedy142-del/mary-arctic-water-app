"use client"

import { useState, useEffect } from 'react'
import { Mail, Lock, User, Droplets, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

// ✅ ADD: Security utilities
import { checkRateLimit, clearLoginAttempts } from '@/lib/rateLimiter'
import { logSecurityEvent, SECURITY_EVENTS } from '@/lib/securityLogger'
import { sanitizeInput, validateEmail, validatePassword } from '@/lib/sanitize'

export function Signup() {
  const navigate = useNavigate()
  
  // ✅ Form state with confirmation
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // ✅ Password strength calculator
  useEffect(() => {
    if (form.password) {
      const strength = validatePassword(form.password).strength
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [form.password])

  // ✅ Validate password strength
  const getPasswordStrengthColor = (strength) => {
    if (strength < 50) return 'bg-red-500'
    if (strength < 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthLabel = (strength) => {
    if (strength < 50) return 'Weak'
    if (strength < 75) return 'Medium'
    return 'Strong'
  }

  // ✅ Validate form
  const validateForm = () => {
    const newErrors = {}
    
    // Name validation
    if (!form.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    // Email validation
    if (!form.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // ✅ Email whitelist check (only Mary & Kennedy can signup)
    const allowedEmails = ['nyamburamary89@gmail.com', 'kyalokennedy142@gmail.com']
    if (!allowedEmails.includes(form.email.trim().toLowerCase())) {
      newErrors.email = 'Signup is restricted to authorized users only'
    }
    
    // Password validation
    const passwordCheck = validatePassword(form.password)
    if (!passwordCheck.valid) {
      newErrors.password = passwordCheck.errors.join(', ')
    }
    
    // Confirm password
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    
    // ✅ STEP 1: Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    
    // ✅ STEP 2: Check rate limit (prevent spam signups)
    const rateLimit = await checkRateLimit(`signup:${form.email}`)
    if (!rateLimit.allowed) {
      toast.error(rateLimit.message)
      await logSecurityEvent(SECURITY_EVENTS.BRUTE_FORCE, {
        type: 'signup',
        email: form.email,
        blocked: true
      })
      return
    }
    
    setIsLoading(true)

    try {
      // ✅ STEP 3: Sanitize inputs
      const sanitizedData = {
        name: sanitizeInput(form.name.trim()),
        email: form.email.trim().toLowerCase(),
        password: form.password
      }

      // ✅ STEP 4: Create account
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password: sanitizedData.password,
        options: {
          data: {
            full_name: sanitizedData.name,
            role: 'admin' // Both users are admins
          }
        }
      })

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('User already registered')) {
          setErrors({ email: 'An account with this email already exists' })
          toast.error('This email is already registered')
        } else {
          toast.error('Signup failed: ' + error.message)
        }

        await logSecurityEvent(SECURITY_EVENTS.LOGIN_FAILED, {
          type: 'signup',
          email: sanitizedData.email,
          error: error.message
        })
        return
      }

      // ✅ STEP 5: Log successful signup
      await logSecurityEvent(SECURITY_EVENTS.NEW_USER, {
        email: sanitizedData.email,
        name: sanitizedData.name,
        userId: data?.user?.id
      })

      // ✅ STEP 6: Clear rate limit
      clearLoginAttempts(`signup:${sanitizedData.email}`)

      toast.success('Account created! Please check your email to verify.')

      // Redirect to login after delay
      setTimeout(() => {
        navigate('/login')
      }, 3000)

    } catch (err) {
      console.error('Signup error:', err)
      toast.error('An unexpected error occurred')

      await logSecurityEvent(SECURITY_EVENTS.LOGIN_FAILED, {
        type: 'signup',
        email: form.email,
        error: err.message
      })
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
            Create Account
          </h1>
          <p className="text-blue-800/70">Join AquaBiz — Authorized users only</p>
        </div>

        {/* Signup Card */}
        <div className="rounded-2xl shadow-xl p-8 border border-blue-100/50 backdrop-blur-sm bg-linear-to-br from-white/90 via-blue-50/50 to-cyan-50/50">
          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-blue-900/80">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Mary Nyambura"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: null })
                  }}
                  className={`pl-11 h-12 bg-white/80 border-blue-200/50 focus:ring-blue-400/30 focus:border-blue-400 ${
                    errors.name ? 'border-destructive ring-2 ring-destructive/20' : ''
                  }`}
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

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
                  placeholder="nyamburamary89@gmail.com"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: null })
                  }}
                  className={`pl-11 h-12 bg-white/80 border-blue-200/50 focus:ring-blue-400/30 focus:border-blue-400 ${
                    errors.email ? 'border-destructive ring-2 ring-destructive/20' : ''
                  }`}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
              {/* Email whitelist notice */}
              <p className="text-xs text-blue-700/70">
                ℹ️ Signup is restricted to authorized users only
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-blue-900/80">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value })
                    if (errors.password) setErrors({ ...errors, password: null })
                  }}
                  className={`pl-11 pr-11 h-12 bg-white/80 border-blue-200/50 focus:ring-blue-400/30 focus:border-blue-400 ${
                    errors.password ? 'border-destructive ring-2 ring-destructive/20' : ''
                  }`}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              {form.password && (
                <div className="space-y-1">
                  <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`} 
                      style={{ width: `${passwordStrength}%` }} 
                    />
                  </div>
                  <p className="text-xs text-blue-700/70">
                    Password strength: <span className="font-medium">{getPasswordStrengthLabel(passwordStrength)}</span>
                  </p>
                </div>
              )}
              
              {/* Password Requirements */}
              <ul className="text-xs text-blue-700/70 space-y-0.5 mt-1">
                <li className={`flex items-center gap-1 ${form.password?.length >= 8 ? 'text-green-600' : ''}`}>
                  <CheckCircle2 className={`w-3 h-3 ${form.password?.length >= 8 ? 'text-green-600' : 'text-blue-400'}`} />
                  At least 8 characters
                </li>
                <li className={`flex items-center gap-1 ${/[A-Z]/.test(form.password || '') ? 'text-green-600' : ''}`}>
                  <CheckCircle2 className={`w-3 h-3 ${/[A-Z]/.test(form.password || '') ? 'text-green-600' : 'text-blue-400'}`} />
                  One uppercase letter
                </li>
                <li className={`flex items-center gap-1 ${/[0-9]/.test(form.password || '') ? 'text-green-600' : ''}`}>
                  <CheckCircle2 className={`w-3 h-3 ${/[0-9]/.test(form.password || '') ? 'text-green-600' : 'text-blue-400'}`} />
                  One number
                </li>
                <li className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(form.password || '') ? 'text-green-600' : ''}`}>
                  <CheckCircle2 className={`w-3 h-3 ${/[^A-Za-z0-9]/.test(form.password || '') ? 'text-green-600' : 'text-blue-400'}`} />
                  One special character
                </li>
              </ul>
              
              {errors.password && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-blue-900/80">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value })
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null })
                  }}
                  className={`pl-11 pr-11 h-12 bg-white/80 border-blue-200/50 focus:ring-blue-400/30 focus:border-blue-400 ${
                    errors.confirmPassword ? 'border-destructive ring-2 ring-destructive/20' : ''
                  }`}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Sign Up Button */}
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-blue-800/60 mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Sign in
              </button>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-blue-800/50 mt-6">
          💧 Secure signup powered by Supabase
        </p>
      </div>
    </div>
  )
}
export default Signup
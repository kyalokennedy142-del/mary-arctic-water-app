"use client"

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!form.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Please enter a valid email'
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Incorrect email or password')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email before logging in')
          setErrors({ email: 'Email not verified' })
        } else if (error.message.includes('rate limit')) {
          toast.error('Too many attempts. Please try again in 30 minutes')
        } else {
          toast.error('Login failed: ' + error.message)
        }
        return
      }
      toast.success('Welcome back! Loading your dashboard...', {
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        duration: 2000
      })
      if (rememberMe) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      }
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      console.error('Login error:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Droplets className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">AquaBiz</h1>
          <p className="text-muted-foreground">Mary Arctic Water Management</p>
        </div>
        <div className="card p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: null })
                  }}
                  className={`pl-10 rounded-xl transition-all ${errors.email ? 'border-destructive ring-2 ring-destructive/20' : 'border-border/30'}`}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button type="button" variant="link" size="sm" onClick={() => navigate('/forgot-password')} className="text-xs text-primary hover:text-primary-light h-auto p-0">Forgot password?</Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value })
                    if (errors.password) setErrors({ ...errors, password: null })
                  }}
                  className={`pl-10 pr-10 rounded-xl transition-all ${errors.password ? 'border-destructive ring-2 ring-destructive/20' : 'border-border/30'}`}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent">
                  {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
              {errors.password && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-border/50 text-primary focus:ring-primary/20" disabled={isLoading} />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me for 30 days</Label>
            </div>
            <Button type="submit" disabled={isLoading} className="btn-primary-gradient rounded-xl w-full h-11 font-medium hover-lift-subtle">
              {isLoading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Signing in...</span> : <span className="flex items-center gap-2"><Lock className="w-4 h-4" />Sign In</span>}
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/20" /></div>
              <div className="relative flex justify-center text-xs"><span className="px-2 bg-card text-muted-foreground">or continue with</span></div>
            </div>
            <Button type="button" variant="outline" disabled={isLoading} className="w-full rounded-xl border-border/30 hover-lift-subtle" onClick={() => toast.info('Google login coming soon!')}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-6">Don't have an account?{' '}<Button type="button" variant="link" onClick={() => navigate('/signup')} className="text-primary hover:text-primary-light h-auto p-0 font-medium">Create account</Button></p>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">💧 Secure login powered by Supabase</p>
      </div>
    </div>
  )
}
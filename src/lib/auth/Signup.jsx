"use client"

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 25
    if (/[A-Z]/.test(password)) strength += 15
    if (/[a-z]/.test(password)) strength += 15
    if (/[0-9]/.test(password)) strength += 10
    if (/[^A-Za-z0-9]/.test(password)) strength += 10
    return Math.min(strength, 100)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Please enter a valid email'
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/.test(form.password)) newErrors.password = 'Password must include uppercase, lowercase, and number'
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    setIsLoading(true)
    try {
      // eslint-disable-next-line no-unused-vars
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: { full_name: form.name.trim() },
          emailRedirectTo: `${window.location.origin}/#/dashboard`
        }
      })
      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists')
        } else {
          toast.error('Signup failed: ' + error.message)
        }
        return
      }
      toast.success('Account created! Please check your email to verify.', {
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        duration: 5000
      })
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      console.error('Signup error:', err)
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
          <h1 className="text-3xl font-bold text-gradient mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join Mary Arctic Water Management</p>
        </div>
        <div className="card p-8 shadow-xl">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" type="text" placeholder="John Mwangi" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: null }) }} className={`pl-10 rounded-xl transition-all ${errors.name ? 'border-destructive ring-2 ring-destructive/20' : 'border-border/30'}`} disabled={isLoading} autoComplete="name" />
              </div>
              {errors.name && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="name@company.com" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: null }) }} className={`pl-10 rounded-xl transition-all ${errors.email ? 'border-destructive ring-2 ring-destructive/20' : 'border-border/30'}`} disabled={isLoading} autoComplete="email" />
              </div>
              {errors.email && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" value={form.password} onChange={(e) => { setForm({ ...form, password: e.target.value }); setPasswordStrength(calculatePasswordStrength(e.target.value)); if (errors.password) setErrors({ ...errors, password: null }) }} className={`pl-10 pr-10 rounded-xl transition-all ${errors.password ? 'border-destructive ring-2 ring-destructive/20' : 'border-border/30'}`} disabled={isLoading} autoComplete="new-password" />
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent">{showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}</Button>
              </div>
              {/* Password Strength Meter */}
              {form.password && (
                <div className="space-y-1">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${passwordStrength < 50 ? 'bg-red-500' : passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${passwordStrength}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'} password</p>
                </div>
              )}
              {/* Password Requirements */}
              <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                <li className={`flex items-center gap-1 ${form.password?.length >= 8 ? 'text-green-600' : ''}`}><CheckCircle2 className={`w-3 h-3 ${form.password?.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`} />At least 8 characters</li>
                <li className={`flex items-center gap-1 ${/[A-Z]/.test(form.password || '') ? 'text-green-600' : ''}`}><CheckCircle2 className={`w-3 h-3 ${/[A-Z]/.test(form.password || '') ? 'text-green-600' : 'text-muted-foreground'}`} />One uppercase letter</li>
                <li className={`flex items-center gap-1 ${/[0-9]/.test(form.password || '') ? 'text-green-600' : ''}`}><CheckCircle2 className={`w-3 h-3 ${/[0-9]/.test(form.password || '') ? 'text-green-600' : 'text-muted-foreground'}`} />One number</li>
              </ul>
              {errors.password && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" value={form.confirmPassword} onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null }) }} className={`pl-10 pr-10 rounded-xl transition-all ${errors.confirmPassword ? 'border-destructive ring-2 ring-destructive/20' : 'border-border/30'}`} disabled={isLoading} autoComplete="new-password" />
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent">{showConfirmPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}</Button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="terms" required className="w-4 h-4 rounded border-border/50 text-primary focus:ring-primary/20" disabled={isLoading} />
              <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">I agree to the <Button type="button" variant="link" className="text-primary h-auto p-0">Terms</Button> and <Button type="button" variant="link" className="text-primary h-auto p-0">Privacy Policy</Button></Label>
            </div>
            <Button type="submit" disabled={isLoading} className="btn-primary-gradient rounded-xl w-full h-11 font-medium hover-lift-subtle">
              {isLoading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Creating account...</span> : <span className="flex items-center gap-2"><User className="w-4 h-4" />Create Account</span>}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">Already have an account?{' '}<Button type="button" variant="link" onClick={() => navigate('/login')} className="text-primary hover:text-primary-light h-auto p-0 font-medium">Sign in</Button></p>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">💧 Secure signup powered by Supabase</p>
      </div>
    </div>
  )
}
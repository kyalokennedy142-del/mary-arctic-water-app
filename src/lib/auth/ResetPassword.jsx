"use client"

import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isValidToken, setIsValidToken] = useState(true)

  // Check if reset token is valid on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        setIsValidToken(false)
        toast.error('Reset link expired or invalid. Please request a new one.')
      }
    }
    checkSession()
  }, [])

  const validateForm = () => {
    const newErrors = {}
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/.test(form.password)) newErrors.password = 'Password must include uppercase, lowercase, and number'
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: form.password })
      if (error) throw error
      toast.success('Password updated! You can now login.', {
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        duration: 3000
      })
      // Sign out to invalidate old sessions
      await supabase.auth.signOut()
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      console.error('Reset error:', err)
      toast.error('Failed to reset password: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Link Expired</h1>
          <p className="text-muted-foreground mb-6">This password reset link has expired or is invalid. Please request a new one.</p>
          <Button onClick={() => navigate('/forgot-password')} className="btn-primary-gradient rounded-xl w-full">Request New Link</Button>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gradient mb-2">New Password</h1>
          <p className="text-muted-foreground">Create a strong new password</p>
        </div>
        <div className="card p-8 shadow-xl">
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" value={form.password} onChange={(e) => { setForm({ ...form, password: e.target.value }); if (errors.password) setErrors({ ...errors, password: null }) }} className={`pl-10 pr-10 rounded-xl transition-all ${errors.password ? 'border-destructive ring-2 ring-destructive/20' : 'border-border/30'}`} disabled={isLoading} autoComplete="new-password" />
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent">{showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}</Button>
              </div>
              {errors.password && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li className={`flex items-center gap-1 ${form.password?.length >= 8 ? 'text-green-600' : ''}`}><CheckCircle2 className={`w-3 h-3 ${form.password?.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`} />At least 8 characters</li>
                <li className={`flex items-center gap-1 ${/[A-Z]/.test(form.password || '') ? 'text-green-600' : ''}`}><CheckCircle2 className={`w-3 h-3 ${/[A-Z]/.test(form.password || '') ? 'text-green-600' : 'text-muted-foreground'}`} />One uppercase letter</li>
                <li className={`flex items-center gap-1 ${/[0-9]/.test(form.password || '') ? 'text-green-600' : ''}`}><CheckCircle2 className={`w-3 h-3 ${/[0-9]/.test(form.password || '') ? 'text-green-600' : 'text-muted-foreground'}`} />One number</li>
              </ul>
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
            <Button type="submit" disabled={isLoading} className="btn-primary-gradient rounded-xl w-full h-11 font-medium hover-lift-subtle">
              {isLoading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Updating...</span> : 'Update Password'}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">💧 Secure password update powered by Supabase</p>
      </div>
    </div>
  )
}
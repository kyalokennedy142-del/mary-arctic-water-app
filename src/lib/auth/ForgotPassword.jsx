"use client"

import { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle2, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState('')

  const handleResetRequest = async (e) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/#/reset-password`
      })
      if (error) throw error
      setIsSent(true)
      toast.success('Reset link sent! Check your email.', {
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        duration: 5000
      })
    } catch (err) {
      console.error('Reset request error:', err)
      setError('Failed to send reset link. Please try again.')
      toast.error('Failed to send reset link')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
          <p className="text-muted-foreground mb-6">We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/login')} className="btn-primary-gradient rounded-xl w-full">Back to Login</Button>
            <Button variant="outline" onClick={() => { setIsSent(false); setEmail('') }} className="rounded-xl w-full border-border/30">Try Another Email</Button>
          </div>
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
          <h1 className="text-3xl font-bold text-gradient mb-2">Reset Password</h1>
          <p className="text-muted-foreground">Enter your email to receive a reset link</p>
        </div>
        <div className="card p-8 shadow-xl">
          <form onSubmit={handleResetRequest} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="name@company.com" value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError('') }} className={`pl-10 rounded-xl transition-all ${error ? 'border-destructive ring-2 ring-destructive/20' : 'border-border/30'}`} disabled={isLoading} autoComplete="email" />
              </div>
              {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
              <p className="text-xs text-muted-foreground">We'll send a secure link to reset your password</p>
            </div>
            <Button type="submit" disabled={isLoading} className="btn-primary-gradient rounded-xl w-full h-11 font-medium hover-lift-subtle">
              {isLoading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Sending...</span> : 'Send Reset Link'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/login')} className="w-full text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Login
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">💧 Secure password reset powered by Supabase</p>
      </div>
    </div>
  )
}
"use client"

import { useState } from 'react'
import { Mail, ArrowLeft, Droplets } from 'lucide-react'
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

  const handleResetRequest = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/#/reset-password`
      })
      if (error) throw error
      toast.success('Reset link sent! Check your email.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center mx-auto mb-4">
            <Droplets className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Reset Password</h1>
          <p className="text-muted-foreground">Enter your email to receive a reset link</p>
        </div>
        <div className="card p-8 shadow-xl">
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 rounded-xl" disabled={isLoading} />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="btn-primary-gradient rounded-xl w-full">
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/login')} className="w-full text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
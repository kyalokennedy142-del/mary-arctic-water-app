"use client"

import { useState, useEffect } from 'react'
import { Lock, Droplets, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // 🔒 FIX: Check for valid session from Supabase recovery token
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Supabase automatically processes the token from URL and creates a session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setIsChecking(false)
          setIsValidSession(false)
          return
        }
        
        if (data.session) {
          setIsValidSession(true)
        } else {
          setIsValidSession(false)
        }
      } catch (err) {
        console.error('Session check error:', err)
        setIsValidSession(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkSession()
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      
      toast.success('Password updated! You can now login.')
      await supabase.auth.signOut()
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking session
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Droplets className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    )
  }

  // Show error if no valid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center mx-auto mb-4">
              <Droplets className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Invalid Reset Link</h1>
            <p className="text-muted-foreground mb-6">This reset link is invalid or has expired.</p>
          </div>
          <div className="card p-8 shadow-xl">
            <Button 
              onClick={() => navigate('/forgot-password')} 
              className="btn-primary-gradient rounded-xl w-full"
            >
              Request New Reset Link
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')} 
              className="w-full mt-2 text-muted-foreground"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center mx-auto mb-4">
            <Droplets className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">New Password</h1>
          <p className="text-muted-foreground">Create a new password</p>
        </div>
        <div className="card p-8 shadow-xl">
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="pl-10 pr-10 rounded-xl" 
                  disabled={isLoading} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="pl-10 rounded-xl" 
                  disabled={isLoading} 
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="btn-primary-gradient rounded-xl w-full">
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
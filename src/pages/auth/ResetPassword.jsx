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
  const [isSessionReady, setIsSessionReady] = useState(false)

  // 🔒 FIX: Extract recovery token from URL and create session
  useEffect(() => {
    const processRecoveryToken = async () => {
      try {
        // Supabase v2 uses PKCE (code in URL query params)
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const type = urlParams.get('type')

        // Older Supabase uses implicit flow (token in URL hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (code && type === 'recovery') {
          // Exchange the code for a session
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Exchange code error:', error)
            toast.error('Invalid or expired reset link.')
          } else {
            setIsSessionReady(true)
          }
        } else if (accessToken && refreshToken) {
          // Set the session manually from hash
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          if (error) {
            console.error('Set session error:', error)
            toast.error('Invalid or expired reset link.')
          } else {
            setIsSessionReady(true)
          }
        } else {
          toast.error('No recovery token found in URL.')
        }
      } catch (err) {
        console.error('Token processing error:', err)
        toast.error('Failed to process reset link.')
      }
    }

    processRecoveryToken()
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
      // Now that the session is ready, this will work!
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      
      toast.success('Password updated! Please login.')
      await supabase.auth.signOut()
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while processing the token
  if (!isSessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Droplets className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Validating your reset link...</p>
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
              <Input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="rounded-xl" 
                disabled={isLoading} 
              />
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
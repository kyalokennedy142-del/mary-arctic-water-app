"use client"

// eslint-disable-next-line no-unused-vars
import { useState, useEffect } from 'react'
import { Lock, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
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
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 rounded-xl" disabled={isLoading} />
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
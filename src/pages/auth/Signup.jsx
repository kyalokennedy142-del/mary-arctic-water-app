"use client"

import { useState } from 'react'
import { Mail, Lock, User, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: { full_name: form.name.trim() }
        }
      })
      if (error) throw error
      toast.success('Account created! Please check your email to verify.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      toast.error('Signup failed: ' + err.message)
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
          <h1 className="text-3xl font-bold text-gradient mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join AquaBiz</p>
        </div>
        <div className="card p-8 shadow-xl">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="text" placeholder="John Mwangi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="pl-10 rounded-xl" disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="name@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="pl-10 rounded-xl" disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pl-10 rounded-xl" disabled={isLoading} />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="btn-primary-gradient rounded-xl w-full">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Button type="button" variant="link" onClick={() => navigate('/login')} className="text-primary h-auto p-0">
                Sign in
              </Button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
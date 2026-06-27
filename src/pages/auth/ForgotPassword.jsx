"use client"

import { Mail, ArrowLeft, Droplets, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center mx-auto mb-4">
            <Droplets className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground">Contact the administrator to reset your password</p>
        </div>
        <div className="card p-8 shadow-xl space-y-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Contact Support</h2>
            <p className="text-muted-foreground text-sm">
              Email: <a href="mailto:nyamburamary89@gmail.com" className="text-primary hover:underline">nyamburamary89@gmail.com</a>
            </p>
            <p className="text-muted-foreground text-sm">
              Or contact Kennedy: <a href="mailto:kyalokennedy142@gmail.com" className="text-primary hover:underline">kyalokennedy142@gmail.com</a>
            </p>
          </div>
          <Button 
            onClick={() => navigate('/login')} 
            className="w-full"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Login
          </Button>
        </div>
      </div>
    </div>
  )
}
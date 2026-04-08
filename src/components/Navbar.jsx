/* eslint-disable no-unused-vars */
"use client"

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText,
  Menu, 
  X,
  LogIn,
  LogOut,
  User
} from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // ✅ FIX: Use AuthContext instead of duplicate getSession call
  const { user, loading } = useAuth()
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/stock', label: 'Stock', icon: Package },
    { path: '/sales', label: 'Sales', icon: ShoppingCart },
    { path: '/reports', label: 'Reports', icon: FileText },
  ]

  // ✅ Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (err) {
      toast.error('Failed to logout')
    }
  }

  // ✅ Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U'
    return user.user_metadata.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Navbar Container - Glass effect with subtle border */}
      <div className="bg-white/80 backdrop-blur-md border-b border-border/30 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center shadow-sm hover-lift-subtle">
                <span className="text-lg">💧</span>
              </div>
              <span className="text-xl font-bold text-gradient hidden sm:block">AquaBiz</span>
            </div>
            
            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      relative flex items-center gap-2 px-4 py-2 rounded-xl
                      text-sm font-medium transition-all duration-200
                      hover-lift-subtle
                      ${isActive 
                        ? 'bg-linear-to-r from-primary to-primary-light text-primary-foreground shadow-md shadow-primary/25' 
                        : 'text-foreground/70 hover:text-primary hover:bg-linear-to-r hover:from-primary/10 hover:to-primary-light/10 hover:shadow-sm'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : ''}`} />
                    <span className="hidden lg:inline">{item.label}</span>
                    
                    {/* Active indicator dot */}
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* ✅ Auth Buttons - Desktop (Only shown when not loading) */}
            {!loading && (
              <div className="hidden md:flex items-center gap-2">
                {user ? (
                  // ✅ Logged in: Show user avatar + logout
                  <>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="w-7 h-7 rounded-full bg-linear-to-br from-primary to-primary-light flex items-center justify-center text-xs font-semibold text-primary-foreground">
                        {getUserInitials()}
                      </div>
                      <span className="text-sm text-foreground/80 hidden lg:inline">
                        {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl px-3"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  // ✅ Not logged in: Show Login/Signup buttons
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/login')}
                      className="text-foreground/70 hover:text-primary hover:bg-primary/10 rounded-xl px-3"
                    >
                      <LogIn className="w-4 h-4 mr-1" />
                      Login
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate('/signup')}
                      className="btn-primary-gradient rounded-xl px-4 text-sm"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Mobile Menu Button - Only visible on mobile/tablet */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors hover-lift-subtle touch-target"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Only shown when open */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/30 bg-white/95 backdrop-blur-md animate-fade-in-down">
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-medium transition-all duration-200
                      hover-lift-subtle touch-target
                      ${isActive 
                        ? 'bg-linear-to-r from-primary to-primary-light text-primary-foreground shadow-md' 
                        : 'text-foreground/70 hover:text-primary hover:bg-linear-to-r hover:from-primary/10 hover:to-primary-light/10'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-primary-foreground/20' : 'bg-primary/10'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                    </div>
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </Link>
                )
              })}
              
              {/* ✅ Auth Buttons - Mobile */}
              {!loading && (
                <div className="pt-3 mt-3 border-t border-border/20">
                  {user ? (
                    // ✅ Logged in: Show user + logout
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-primary-light flex items-center justify-center text-sm font-semibold text-primary-foreground">
                          {getUserInitials()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {user.user_metadata?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                        className="w-full justify-start text-destructive hover:bg-destructive/10 rounded-xl mt-2"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    // ✅ Not logged in: Show Login/Signup
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => { navigate('/login'); setMobileMenuOpen(false) }}
                        className="w-full justify-start text-foreground/70 hover:text-primary hover:bg-primary/10 rounded-xl"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => { navigate('/signup'); setMobileMenuOpen(false) }}
                        className="w-full btn-primary-gradient rounded-xl mt-2"
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
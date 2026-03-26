"use client"

import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText,
  Menu, 
  X 
} from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const navItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      path: '/customers', 
      label: 'Customers', 
      icon: Users 
    },
    { 
      path: '/stock', 
      label: 'Stock', 
      icon: Package 
    },
    { 
      path: '/sales', 
      label: 'Sales', 
      icon: ShoppingCart 
    },
    { 
      path: '/reports', 
      label: 'Reports', 
      icon: FileText 
    },
  ]

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
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
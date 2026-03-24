import { Outlet, Link, useLocation } from "react-router-dom"
import { Droplets, Users, Package, ShoppingCart, LayoutDashboard } from "lucide-react"

function Layout() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/customers", icon: Users, label: "Customers" },
    { path: "/stock", icon: Package, label: "Stock" },
    { path: "/sales", icon: ShoppingCart, label: "Sales" },
  ]

  return (
    <div className="min-h-screen">
      {/* Sticky Top Navbar with Glass Effect */}
      <nav className="sticky top-0 z-50 glass shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo & App Name with Gradient */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="icon-container w-10 h-10 group-hover:scale-110 transition-transform duration-300">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gradient hidden sm:inline-block">
                AquaBiz
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.path)
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                      transition-all duration-300
                      ${active 
                        ? 'btn-primary-gradient' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content with Animation */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 AquaBiz. Built with 💧 for water businesses.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
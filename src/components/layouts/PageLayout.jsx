import { ReactNode } from 'react'

export default function PageLayout({ 
  title, 
  subtitle, 
  icon: Icon, 
  children,
  actions 
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center shadow-sm">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gradient">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Page Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}
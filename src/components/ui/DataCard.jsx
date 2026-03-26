import { ReactNode } from 'react'

export default function DataCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  children,
  className = ''
}) {
  return (
    <div className={`card-enhanced p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      {value && (
        <div className="mb-4">
          <div className="text-2xl font-bold text-primary">{value}</div>
        </div>
      )}

      {children}
    </div>
  )
}
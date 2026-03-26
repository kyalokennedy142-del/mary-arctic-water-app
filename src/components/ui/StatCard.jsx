import { ReactNode } from 'react'

export default function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend,
  variant = 'default' // default, success, warning, destructive
}) {
  const variants = {
    default: {
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      valueColor: 'text-primary'
    },
    success: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600'
    },
    warning: {
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      valueColor: 'text-yellow-600'
    },
    destructive: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600'
    }
  }

  const style = variants[variant]

  return (
    <div className="card-enhanced p-6 space-y-4">
      {/* Header with Icon */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${style.iconBg} ${style.iconColor} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className={`text-3xl font-bold ${style.valueColor}`}>
        {value}
      </div>

      {/* Description & Trend */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{description}</p>
        {trend && (
          <div className={`text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </div>
    </div>
  )
}
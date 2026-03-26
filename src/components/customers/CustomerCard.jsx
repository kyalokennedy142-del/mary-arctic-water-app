"use client"

import { Phone, MapPin, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CustomerCard({ 
  customer, 
  onClick, 
  isSelected, 
  onEdit, 
  onDelete,
  salesHistory = [] 
}) {
  // Generate avatar initials from customer name
  const initials = customer?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CU'

  // Calculate customer status based on activity
  const getStatus = () => {
    // eslint-disable-next-line react-hooks/purity
    const createdDate = new Date(customer?.created_at || Date.now())
    // eslint-disable-next-line react-hooks/purity
    const daysSinceCreated = Math.floor((Date.now() - createdDate) / (1000 * 60 * 60 * 24))
    
    const lastSale = salesHistory?.[0]?.date
    const lastSaleDate = lastSale ? new Date(lastSale) : null
    const daysSinceLastSale = lastSaleDate 
      // eslint-disable-next-line react-hooks/purity
      ? Math.floor((Date.now() - lastSaleDate) / (1000 * 60 * 60 * 24))
      : null
    
    const totalSpent = salesHistory?.reduce((sum, s) => sum + (s.total || 0), 0) || 0

    if (totalSpent >= 10000) return { label: 'VIP', class: 'bg-purple-100 text-purple-700 border-purple-200' }
    if (daysSinceCreated <= 7 && !lastSaleDate) return { label: 'New', class: 'bg-blue-100 text-blue-700 border-blue-200' }
    if (lastSaleDate && daysSinceLastSale <= 30) return { label: 'Active', class: 'bg-green-100 text-green-700 border-green-200' }
    if (lastSaleDate && daysSinceLastSale > 90) return { label: 'Inactive', class: 'bg-gray-100 text-gray-700 border-gray-200' }
    return { label: 'New', class: 'bg-blue-100 text-blue-700 border-blue-200' }
  }

  const status = getStatus()
  const totalOrders = salesHistory?.length || 0
  const totalSpent = salesHistory?.reduce((sum, s) => sum + (s.total || 0), 0) || 0

  return (
    <div
      onClick={() => onClick(customer)}
      className={`
        relative group cursor-pointer rounded-2xl border p-5 transition-all duration-300
        ${isSelected 
          ? 'border-transparent ring-2 ring-primary/30 shadow-[0_0_0_2px_hsl(var(--primary)),0_0_20px_hsl(var(--primary)/0.15)]' 
          : 'border-border hover:border-primary/30 hover:shadow-md'
        }
        bg-card
      `}
    >
      {/* Quick Action Buttons (visible on hover) */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7 hover:bg-primary/10"
          onClick={(e) => { e.stopPropagation(); onEdit?.(customer) }}
          aria-label="Edit customer"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7 hover:bg-destructive/10 text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete?.(customer) }}
          aria-label="Delete customer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex items-start gap-4">
        {/* Avatar with initials - gradient background */}
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-sm font-semibold text-primary">{initials}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Name + Status Badge */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground truncate">{customer?.name}</h4>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${status.class}`}>
              {status.label}
            </span>
          </div>
          
          {/* Phone */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span className="truncate">{customer?.phone}</span>
          </div>
          
          {/* Location */}
          {customer?.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="truncate">{customer.location}</span>
            </div>
          )}
          
          {/* Stats */}
          {totalOrders > 0 && (
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span>{totalOrders} order{totalOrders !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span className="text-primary font-medium">KSh {totalSpent.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
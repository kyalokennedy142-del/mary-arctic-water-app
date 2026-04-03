// src/components/sales/SalesTable.jsx
"use client"

import { format } from 'date-fns'
import { Pencil, Archive, RotateCcw, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Format KES currency
const formatKES = (amount) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 0
}).format(amount || 0)

export default function SalesTable({ 
  sales = [], 
  loading = false,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onView
}) {
  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  // Empty state
  if (sales.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No sales to display</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/20">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground table-header">Date</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground table-header">Customer</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground table-header">Product</th>
            <th className="text-right py-3 px-4 font-medium text-muted-foreground table-header">Qty</th>
            <th className="text-right py-3 px-4 font-medium text-muted-foreground table-header">Price</th>
            <th className="text-right py-3 px-4 font-medium text-muted-foreground table-header">Total</th>
            <th className="text-center py-3 px-4 font-medium text-muted-foreground table-header">Status</th>
            <th className="text-right py-3 px-4 font-medium text-muted-foreground table-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => {
            const isArchived = sale.is_archived
            
            return (
              <tr 
                key={sale.id} 
                className={`border-b border-border/10 transition-colors ${
                  isArchived ? 'bg-gray-50/50' : 'hover:bg-primary/5'
                }`}
              >
                {/* Date */}
                <td className="py-3 px-4 table-cell text-muted-foreground">
                  {sale.date ? format(new Date(sale.date), 'MMM d, yyyy') : '—'}
                </td>
                
                {/* Customer */}
                <td className="py-3 px-4 table-cell font-medium">
                  {sale.customer_name || sale.customer?.name || '—'}
                </td>
                
                {/* Product */}
                <td className="py-3 px-4 table-cell">
                  {sale.product_name}
                </td>
                
                {/* Quantity */}
                <td className="py-3 px-4 table-cell-mono text-right">
                  {sale.quantity_sold}
                </td>
                
                {/* Price */}
                <td className="py-3 px-4 table-cell-mono text-right">
                  {formatKES(sale.price)}
                </td>
                
                {/* Total */}
                <td className="py-3 px-4 table-cell-mono text-right font-semibold text-primary">
                  {formatKES(sale.total)}
                </td>
                
                {/* Status Badge */}
                <td className="py-3 px-4 text-center">
                  {isArchived ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 badge-text">
                      🗃️ Archived
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 badge-text">
                      ✅ Active
                    </span>
                  )}
                </td>
                
                {/* Action Buttons */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* View Button */}
                    {onView && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary hover-lift-subtle"
                        onClick={(e) => { e.stopPropagation(); onView(sale) }}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {/* Edit Button - Only for active sales */}
                    {onEdit && !isArchived && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary hover-lift-subtle"
                        onClick={(e) => { e.stopPropagation(); onEdit(sale) }}
                        title="Edit sale"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {/* Archive/Restore Button */}
                    {onArchive && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className={`h-8 w-8 p-0 hover-lift-subtle ${
                          isArchived 
                            ? 'hover:bg-green-100 hover:text-green-700' 
                            : 'hover:bg-yellow-100 hover:text-yellow-700'
                        }`}
                        onClick={(e) => { 
                          e.stopPropagation()
                          isArchived ? onRestore(sale) : onArchive(sale)
                        }}
                        title={isArchived ? 'Restore sale' : 'Archive sale'}
                      >
                        {isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      </Button>
                    )}
                    
                    {/* Delete Button - Only visible when needed */}
                    {onDelete && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive hover-lift-subtle"
                        onClick={(e) => { e.stopPropagation(); onDelete(sale) }}
                        title="Permanently delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
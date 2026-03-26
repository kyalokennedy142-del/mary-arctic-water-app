"use client"

import { ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

const formatKES = (amount) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 0
}).format(amount || 0)

export default function CustomerSales({ customer, sales = [], onClose }) {
  const totalSpent = sales.reduce((sum, s) => sum + (s.total || 0), 0)
  const totalOrders = sales.length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {customer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              Sales History - {customer.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {totalOrders} order{totalOrders !== 1 ? 's' : ''} • {formatKES(totalSpent)} total
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg hover-lift-subtle">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {sales.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No sales recorded for this customer yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Qty</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-border/10 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 font-medium">{sale.product_name}</td>
                  <td className="py-3 px-4 text-right font-mono">{sale.quantity_sold}</td>
                  <td className="py-3 px-4 text-right font-mono">{formatKES(sale.price)}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-primary">{formatKES(sale.total)}</td>
                  <td className="py-3 px-4 text-right text-muted-foreground">
                    {sale.date ? format(new Date(sale.date), 'MMM d, yyyy') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
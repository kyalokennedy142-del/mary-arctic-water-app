"use client"

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Format KES currency
const formatKES = (amount) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 0
}).format(amount || 0)

export default function CustomerSales({ customer, sales, onClose }) {
  if (!customer || !sales) return null

  const totalSpent = sales.reduce((sum, s) => sum + (s.total || 0), 0)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/20">
        <div>
          <h2 className="text-xl font-bold text-gradient flex items-center gap-2">
            📋 Sales History - {customer.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {sales.length} order{sales.length !== 1 ? 's' : ''} • {formatKES(totalSpent)} total
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="hover-lift-subtle">
          <X className="w-4 h-4 mr-2" />
          Close
        </Button>
      </div>

      {/* Sales Table */}
      {sales.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-lg font-medium mb-2">No sales recorded</p>
          <p className="text-sm">This customer hasn't made any purchases yet</p>
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
                  {/* ✅ FIXED: Show product_name with multiple fallbacks */}
                  <td className="py-4 px-4">
                    <div className="font-medium text-foreground">
                      {sale.product_name || sale.product?.product_name || 'Unknown Product'}
                    </div>
                    {sale.notes && (
                      <div className="text-xs text-muted-foreground mt-1">
                        📝 {sale.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-mono font-medium text-foreground">{sale.quantity_sold}</div>
                    <div className="text-xs text-muted-foreground">units</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-mono text-muted-foreground">{formatKES(sale.price)}</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-mono font-semibold text-primary">{formatKES(sale.total)}</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="text-sm text-foreground">
                      {sale.date ? new Date(sale.date).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : '—'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Footer */}
      {sales.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border/20">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Average order value: <span className="font-semibold text-foreground">{formatKES(totalSpent / sales.length)}</span>
            </div>
            <div className="text-lg font-bold text-gradient">
              Total: {formatKES(totalSpent)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
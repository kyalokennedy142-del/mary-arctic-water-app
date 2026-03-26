"use client"

import { useState } from 'react'
import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Printer, Download } from 'lucide-react'
import { formatKES } from '@/lib/utils'

export default function SalesTable({ sales = [], loading = false }) {
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const sortedSales = [...sales].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    } else if (sortBy === 'total') {
      return sortOrder === 'asc' ? a.total - b.total : b.total - a.total
    }
    return 0
  })

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    // Export to CSV
    const headers = ['Date', 'Customer', 'Product', 'Quantity', 'Price', 'Total']
    const rows = sales.map(sale => [
      format(new Date(sale.date), 'yyyy-MM-dd HH:mm'),
      sale.customer_name,
      sale.product_name,
      sale.quantity_sold,
      sale.price,
      sale.total
    ])
    
    const csv = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (sales.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
          <Printer className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium">No sales recorded yet</p>
        <p className="text-sm">Sales will appear here once recorded</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Sales ({sales.length})</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="rounded-xl"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="rounded-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead 
                className="font-semibold cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('date')}
              >
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Product</TableHead>
              <TableHead 
                className="font-semibold text-right cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('quantity')}
              >
                Qty {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="font-semibold text-right">Price</TableHead>
              <TableHead 
                className="font-semibold text-right cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('total')}
              >
                Total {sortBy === 'total' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSales.map((sale) => (
              <TableRow 
                key={sale.id} 
                className="hover:bg-primary/5 transition-colors"
              >
                <TableCell className="text-muted-foreground">
                  {format(new Date(sale.date), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell className="font-medium">{sale.customer_name}</TableCell>
                <TableCell>{sale.product_name}</TableCell>
                <TableCell className="text-right font-mono">{sale.quantity_sold}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatKES(sale.price)}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold text-primary">
                  {formatKES(sale.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
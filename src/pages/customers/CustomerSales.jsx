import { useQuery } from '@tanstack/react-query'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

// Import from your API layer (adjust path as needed)
import { salesApi } from '@/lib/api'

export default function CustomerSales({ customer, onClose }) {
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['customer-sales', customer.id],
    queryFn: () => salesApi.getByCustomerId(customer.id),
    enabled: !!customer.id
  })

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-primary" />
          Sales for {customer.name}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No sales recorded yet.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.product_name}</TableCell>
                  <TableCell className="text-right">{sale.quantity_sold}</TableCell>
                  <TableCell className="text-right">${sale.price?.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">${sale.total?.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {sale.date ? format(new Date(sale.date), 'MMM d, yyyy') : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react"
import { ShoppingCart, Receipt, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useData } from "@/context/DataContext"
import EnhancedSelect from "@/components/ui/EnhancedSelect"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { toast } from "sonner"

const formatKES = (amount) => new Intl.NumberFormat('en-KE', {
  style: 'currency', currency: 'KES', minimumFractionDigits: 0
}).format(amount || 0)

export default function Sales() {
  const [form, setForm] = useState({ customer_id: "", stock_id: "", category: "", quantity: "", price: "" })
  const [error, setError] = useState("")
  const [customers, setCustomers] = useState([])
  const [stock, setStock] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  const { getCustomers, getStock, getSales, createSale } = useData()

  // ✅ Load data function (NOT useCallback)
  const load = async () => {
    try {
      const [c, s, salesData] = await Promise.all([getCustomers(), getStock(), getSales()])
      setCustomers(c || [])
      setStock(s || [])
      setSales(salesData || [])
      console.log('✅ Loaded:', c?.length, 'customers,', s?.length, 'stock items,', salesData?.length, 'sales')
    } catch (e) { 
      console.error('Load error:', e)
      toast.error('Failed to load data')
    }
    finally { setLoading(false) }
  }

  // ✅ Load on mount
  useEffect(() => { load() }, [])

  // ✅ Filter stock by category and quantity
  const available = stock.filter(i => i.quantity > 0 && (!form.category || i.category === form.category))
  
  // ✅ Get unique categories
  const categories = [...new Set(stock.map(i => i.category).filter(Boolean))]
  
  // ✅ Get selected stock item
  const selected = stock.find(i => i.id === form.stock_id)

  // ✅ Auto-fill price when product selected
  useEffect(() => { 
    if (selected) {
      setForm(f => ({ ...f, price: selected.selling_price.toString() }))
      console.log('💰 Auto-filled price:', selected.selling_price)
    }
  }, [selected])

  // ✅ Reset product when category changes
  useEffect(() => { 
    setForm(f => ({ ...f, stock_id: "", price: "" }))
  }, [form.category])

  // ✅ Calculate total
  const total = form.quantity && form.price ? +form.quantity * +form.price : 0

  // ✅ Validate stock quantity
  useEffect(() => {
    if (form.stock_id && form.quantity) {
      const avail = selected?.quantity || 0
      setError(+form.quantity > avail ? `Only ${avail} units available.` : "")
    } else setError("")
  }, [form.quantity, form.stock_id, selected])

  // ✅ Submit sale
  const submit = async (e) => {
    e.preventDefault()
    console.log('📝 Submitting sale:', form)
    
    if (!form.customer_id || !form.stock_id || !form.quantity) {
      return toast.error("Please fill all required fields")
    }
    if (error) {
      return toast.error(error)
    }
    
    const c = customers.find(x => x.id === form.customer_id)
    const s = stock.find(x => x.id === form.stock_id)
    
    try {
      await createSale({
        customer_id: form.customer_id,
        customer_name: c?.name || "Unknown",
        product_id: form.stock_id,
        product_name: s?.product_name || "Unknown",
        quantity_sold: +form.quantity,
        price: +form.price,
        total
      })
      toast.success('Sale recorded successfully!')
      await load()
      setForm({ customer_id: "", stock_id: "", category: "", quantity: "", price: "" })
      setError("")
    } catch (err) { 
      console.error('Sale error:', err)
    }
  }

  const ok = form.customer_id && form.stock_id && form.quantity && !error && !loading

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient">Sales</h1>
          <p className="text-sm text-muted-foreground">Record and track your sales</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="rounded-2xl border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Receipt className="w-5 h-5 text-primary" /> Record a Sale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Customer Select */}
              <EnhancedSelect 
                id="customer_id" 
                label="Customer" 
                value={form.customer_id}
                onChange={v => setForm(f => ({ ...f, customer_id: v }))}
                options={customers.map(c => ({ id: c.id, name: c.name }))}
                placeholder="Select customer" 
                disabled={loading || customers.length === 0} 
              />

              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <select 
                  value={form.category} 
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="input-enhanced rounded-xl w-full px-3 py-2" 
                  disabled={loading}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.replace('-', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Product Select */}
              <EnhancedSelect 
                id="stock_id" 
                label="Product" 
                value={form.stock_id}
                onChange={v => setForm(f => ({ ...f, stock_id: v }))}
                options={available.map(s => ({ 
                  id: s.id, 
                  product_name: s.product_name, 
                  quantity: s.quantity, 
                  category: s.category 
                }))}
                placeholder={available.length === 0 ? "No products in stock" : "Select product"} 
                showQuantity 
                groupBy="category"
                disabled={loading || available.length === 0} 
              />

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quantity</Label>
                <Input 
                  name="quantity" 
                  type="number" 
                  min="1" 
                  placeholder="0" 
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  className="input-enhanced rounded-xl" 
                  disabled={loading || !form.stock_id} 
                />
              </div>
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Price / Unit (KES)</Label>
              <Input 
                name="price" 
                type="number" 
                step="0.01" 
                min="0" 
                placeholder="0.00" 
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="input-enhanced rounded-xl" 
                disabled={loading || !form.stock_id} 
              />
            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive">
                <AlertCircle className="w-5 h-5" /><span className="font-medium">{error}</span>
              </div>
            )}

            {/* Submit Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
              <div className="text-2xl font-bold">Total: <span className="text-primary">{formatKES(total)}</span></div>
              <Button 
                type="submit" 
                disabled={!ok} 
                className="btn-primary-gradient min-w-37.5"
              >
                {loading ? "Loading..." : ok ? "Record Sale" : "Fill All Fields"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="rounded-2xl border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <p>No sales recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="text-right font-semibold">Qty</TableHead>
                    <TableHead className="text-right font-semibold">Price</TableHead>
                    <TableHead className="text-right font-semibold">Total</TableHead>
                    <TableHead className="text-right font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map(sale => (
                    <TableRow key={sale.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium">{sale.customer_name}</TableCell>
                      <TableCell>{sale.product_name}</TableCell>
                      <TableCell className="text-right font-mono">{sale.quantity_sold}</TableCell>
                      <TableCell className="text-right font-mono">{formatKES(sale.price)}</TableCell>
                      <TableCell className="text-right font-mono font-semibold text-primary">{formatKES(sale.total)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{format(new Date(sale.date), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  ) 
}
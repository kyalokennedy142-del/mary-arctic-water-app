import { useState, useEffect } from "react"  // ✅ NO useCallback here
import { Package, PackagePlus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useData } from "@/context/DataContext"
import { toast } from "sonner"

const formatKES = (amount) => new Intl.NumberFormat('en-KE', {
  style: 'currency', currency: 'KES', minimumFractionDigits: 0
}).format(amount || 0)

export default function Stock() {
  const [formData, setFormData] = useState({
    product_name: "",
    quantity: "",
    selling_price: ""
  })
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)

  const { getStock, createStock: addStock } = useData()

  // ✅ Regular async function (NOT useCallback)
  const loadStock = async () => {
    try {
      const data = await getStock()
      setStock(data || [])
    } catch (err) {
      console.error('Load stock error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Load on mount with empty deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadStock() }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.product_name || !formData.quantity || !formData.selling_price) {
      return toast.error("All fields are required")
    }

    try {
      await addStock({
        product_name: formData.product_name,
        quantity: Number(formData.quantity),
        selling_price: Number(formData.selling_price)
      })
      setFormData({ product_name: "", quantity: "", selling_price: "" })
      await loadStock()
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Error handled by DataContext
    }
  }

  const getStatusBadge = (quantity) => {
    if (quantity <= 0) return <span className="badge-destructive">Out of stock</span>
    if (quantity <= 5) return <span className="badge-warning">Low</span>
    return <span className="badge-success">In stock</span>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient">Stock</h1>
          <p className="text-sm text-muted-foreground">Track your inventory</p>
        </div>
      </div>

      {/* Add Stock Form */}
      <Card className="rounded-2xl border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <PackagePlus className="w-5 h-5 text-primary" /> Add Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Product Name</Label>
                <Input name="product_name" placeholder="e.g., 20L Water Bottle" value={formData.product_name}
                  onChange={handleInputChange} className="input-enhanced rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quantity</Label>
                <Input name="quantity" type="number" min="0" placeholder="0" value={formData.quantity}
                  onChange={handleInputChange} className="input-enhanced rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selling Price (KES)</Label>
                <Input name="selling_price" type="number" step="0.01" min="0" placeholder="0.00" value={formData.selling_price}
                  onChange={handleInputChange} className="input-enhanced rounded-xl" />
              </div>
            </div>
            <Button type="submit" className="btn-primary-gradient" disabled={loading}>
              {loading ? "Adding..." : "Add Stock"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card className="rounded-2xl border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div></div>
          ) : stock.length === 0 ? (
            <div className="text-center text-muted-foreground py-12"><p>No stock items yet. Add your first item above.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Product Name</TableHead>
                    <TableHead className="text-right font-semibold">Quantity</TableHead>
                    <TableHead className="text-right font-semibold">Price</TableHead>
                    <TableHead className="text-right font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stock.map((item) => (
                    <TableRow key={item.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                      <TableCell className="text-right font-mono">{formatKES(item.selling_price)}</TableCell>
                      <TableCell className="text-right">{getStatusBadge(item.quantity)}</TableCell>
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
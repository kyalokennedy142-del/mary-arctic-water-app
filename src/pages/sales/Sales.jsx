import { useState, useEffect } from "react"
import { ShoppingCart, Receipt, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useSales,
  useCreateSale,
  useCustomers,
  useStock
} from "@/lib/hooks"
import { format } from "date-fns"
import { toast } from "sonner"

function Sales() {
  const [formData, setFormData] = useState({
    customer_id: "",
    stock_id: "",
    quantity: "",
    price: ""
  })
  const [error, setError] = useState("")

  // Fetch data
  const {  customers = [] } = useCustomers()
  const {  stock = [] } = useStock()
  const {  sales = [], isLoading, error: loadError } = useSales()

  // Create sale mutation
  const createSale = useCreateSale()

  // Filter stock: only show items with quantity > 0
  const availableStock = stock.filter(item => item.quantity > 0)

  // Get selected stock item
  const selectedStockItem = stock.find(item => item.id === formData.stock_id)

  // Auto-fill price when product is selected
  useEffect(() => {
    if (selectedStockItem) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        price: selectedStockItem.selling_price.toString()
      }))
    }
  }, [selectedStockItem])

  // Calculate total
  const total = formData.quantity && formData.price
    ? Number(formData.quantity) * Number(formData.price)
    : 0

  // Validate quantity against available stock
  useEffect(() => {
    if (formData.stock_id && formData.quantity) {
      const available = selectedStockItem?.quantity || 0
      const requested = Number(formData.quantity)

      if (requested > available) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError(`Only ${available} units available in stock.`)
      } else {
        setError("")
      }
    } else {
      setError("")
    }
  }, [formData.quantity, formData.stock_id, selectedStockItem])

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    if (!formData.customer_id || !formData.stock_id || !formData.quantity) {
      toast.error("Please fill in all required fields")
      return
    }

    if (error) {
      toast.error("Cannot record sale: " + error)
      return
    }

    // Get customer name for the sale record
    const customer = customers.find(c => c.id === formData.customer_id)
    const stockItem = stock.find(s => s.id === formData.stock_id)

    // Create sale
    createSale.mutate({
      customer_id: formData.customer_id,
      customer_name: customer?.name || "Unknown",
      stock_id: formData.stock_id,
      product_name: stockItem?.product_name || "Unknown",
      quantity_sold: Number(formData.quantity),
      price: Number(formData.price),
      total: total
    }, {
      onSuccess: () => {
        toast.success("Sale recorded and stock updated.")
        setFormData({
          customer_id: "",
          stock_id: "",
          quantity: "",
          price: ""
        })
        setError("")
      },
      onError: (err) => {
        toast.error("Failed to record sale: " + err.message)
      }
    })
  }

  // Check if form can be submitted
  const canSubmit = 
    formData.customer_id && 
    formData.stock_id && 
    formData.quantity && 
    !error && 
    !createSale.isPending

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="icon-container">
          <ShoppingCart className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales</h1>
          <p className="text-sm text-muted-foreground">Record and track your sales</p>
        </div>
      </div>

      {/* Record Sale Form */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="w-5 h-5 text-primary" />
            Record a Sale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 4-column grid for desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Customer Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="customer_id" className="font-medium">Customer</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => handleSelectChange("customer_id", value)}
                >
                  <SelectTrigger className="input-enhanced">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="stock_id" className="font-medium">Product</Label>
                <Select
                  value={formData.stock_id}
                  onValueChange={(value) => handleSelectChange("stock_id", value)}
                >
                  <SelectTrigger className="input-enhanced">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStock.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.product_name} ({item.quantity} left)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="font-medium">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="input-enhanced"
                />
              </div>

              {/* Price Input */}
              <div className="space-y-2">
                <Label htmlFor="price" className="font-medium">Price / Unit ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input-enhanced"
                />
              </div>
            </div>

            {/* Error Banner with Animation */}
            {error && (
              <div className="flex items-center gap-2.5 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 animate-slide-up">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Total + Submit Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
              <div className="text-2xl font-bold">
                Total: <span className="bg-linear-to-r from-primary to-primary-light bg-clip-text text-transparent">${total.toFixed(2)}</span>
              </div>
              <Button 
                type="submit" 
                disabled={!canSubmit}
                className="btn-primary-gradient min-w-37.5"
              >
                {createSale.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Recording...
                  </span>
                ) : (
                  "Record Sale"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sales History Table */}
      <Card className="card-enhanced">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : loadError ? (
            <div className="text-center text-destructive py-12">
              <div className="icon-container w-12 h-12 mx-auto mb-3 bg-destructive/10 text-destructive">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p>Failed to load sales</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="icon-container w-12 h-12 mx-auto mb-3">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <p>No sales recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-linear-to-r from-secondary/50 to-secondary/30">
                    <TableHead className="font-semibold text-foreground">Customer</TableHead>
                    <TableHead className="font-semibold text-foreground">Product</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Qty</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Price</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Total</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id} className="table-row-hover">
                      <TableCell className="font-medium text-foreground">
                        {sale.customer_name}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {sale.product_name}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {sale.quantity_sold}
                      </TableCell>
                      <TableCell className="text-right font-mono text-foreground">
                        ${parseFloat(sale.price).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-primary">
                        ${parseFloat(sale.total).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {format(new Date(sale.date), "MMM d, yyyy")}
                      </TableCell>
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

export default Sales
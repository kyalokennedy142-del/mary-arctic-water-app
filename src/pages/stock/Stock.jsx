import { useState } from "react"
import { Package, PackagePlus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useStock,
  useCreateStock
} from "@/lib/hooks"
import { toast } from "sonner"

function Stock() {
  const [formData, setFormData] = useState({
    product_name: "",
    quantity: "",
    selling_price: ""
  })

  // Fetch stock
  const {  stock = [], isLoading, error } = useStock()

  // Create stock mutation
  const createStock = useCreateStock()

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.product_name || !formData.quantity || !formData.selling_price) {
      toast.error("All fields are required")
      return
    }

    // Create stock item
    createStock.mutate({
      product_name: formData.product_name,
      quantity: Number(formData.quantity),
      selling_price: Number(formData.selling_price)
    }, {
      onSuccess: () => {
        toast.success("Stock item added successfully!")
        setFormData({ product_name: "", quantity: "", selling_price: "" })
      },
      onError: (err) => {
        toast.error("Failed to add stock: " + err.message)
      }
    })
  }

  // Get status badge based on quantity
  const getStatusBadge = (quantity) => {
    if (quantity <= 0) {
      return <span className="badge-destructive">Out of stock</span>
    } else if (quantity <= 5) {
      return <span className="badge-warning">Low</span>
    } else {
      return <span className="badge-success">In stock</span>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="icon-container">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock</h1>
          <p className="text-sm text-muted-foreground">Track your inventory</p>
        </div>
      </div>

      {/* Add Stock Form */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PackagePlus className="w-5 h-5 text-primary" />
            Add Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Product Name Field */}
              <div className="space-y-2">
                <Label htmlFor="product_name" className="font-medium">Product Name</Label>
                <Input
                  id="product_name"
                  name="product_name"
                  placeholder="e.g., 20L Water Bottle"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  className="input-enhanced"
                />
              </div>

              {/* Quantity Field */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="font-medium">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="input-enhanced"
                />
              </div>

              {/* Selling Price Field */}
              <div className="space-y-2">
                <Label htmlFor="selling_price" className="font-medium">Selling Price ($)</Label>
                <Input
                  id="selling_price"
                  name="selling_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.selling_price}
                  onChange={handleInputChange}
                  className="input-enhanced"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="btn-primary-gradient"
              disabled={createStock.isPending}
            >
              {createStock.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                "Add Stock"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card className="card-enhanced">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-12">
              <div className="icon-container w-12 h-12 mx-auto mb-3 bg-destructive/10 text-destructive">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p>Failed to load stock</p>
            </div>
          ) : stock.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="icon-container w-12 h-12 mx-auto mb-3">
                <Package className="w-6 h-6" />
              </div>
              <p>No stock items yet. Add your first item above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-linear-to-r from-secondary/50 to-secondary/30">
                    <TableHead className="font-semibold text-foreground">Product Name</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Quantity</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Price</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stock.map((item) => (
                    <TableRow key={item.id} className="table-row-hover">
                      <TableCell className="font-medium text-foreground">
                        {item.product_name}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono text-foreground">
                        ${parseFloat(item.selling_price).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(item.quantity)}
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

export default Stock
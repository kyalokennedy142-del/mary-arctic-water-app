// src/components/sales/SalesForm.jsx
"use client"

import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, AlertCircle, RotateCcw, CheckCircle2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

// ✅ Inline formatKES to avoid import issues
const formatKES = (amount) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).format(amount || 0)

export default function SalesForm({ 
  customers = [], 
  stock = [], 
  onSubmit,
  loading = false,
  editingSale = null,  // ✅ ADDED: For edit mode
  onCancel  // ✅ ADDED: Cancel edit callback
}) {
  const [form, setForm] = useState({
    customer_id: '',
    category: '',
    product_id: '',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0],  // ✅ ADDED: Date field
    notes: ''  // ✅ ADDED: Notes field
  })
  
  const [errors, setErrors] = useState({})
  const [selectedStock, setSelectedStock] = useState(null)
  const [showPriceWarning, setShowPriceWarning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ ADDED: Populate form when editing
  useEffect(() => {
    if (editingSale) {
      const product = stock.find(s => s.id === editingSale.product_id)
      setForm({
        customer_id: editingSale.customer_id || '',
        category: product?.category || '',
        product_id: editingSale.product_id || '',
        quantity: editingSale.quantity_sold?.toString() || '',
        price: editingSale.price?.toString() || '',
        date: editingSale.date ? new Date(editingSale.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: editingSale.notes || ''
      })
      setSelectedStock(product || null)
      setShowPriceWarning(false)
    }
  }, [editingSale, stock])

  // Get unique categories from stock
  const categories = [...new Set(stock.map(item => item.category).filter(Boolean))]

  // Get available stock for selected category
  const availableStock = stock.filter(item => 
    item.quantity > 0 && (!form.category || item.category === form.category)
  )

  // Get selected product details
  useEffect(() => {
    if (form.product_id) {
      const product = stock.find(s => s.id === form.product_id)
      setSelectedStock(product)
      
      // Auto-fill price from stock (only if not editing or price is empty)
      if (product && (!editingSale || !form.price)) {
        setForm(prev => ({
          ...prev,
          price: product.selling_price.toString()
        }))
        setShowPriceWarning(false)
      }
    } else {
      setSelectedStock(null)
    }
  }, [form.product_id, stock, editingSale, form.price])

  // Check if price differs from stock price
  useEffect(() => {
    if (selectedStock && form.price && !editingSale) {
      const diff = Math.abs(parseFloat(form.price) - selectedStock.selling_price)
      setShowPriceWarning(diff > 0.01)
    } else {
      setShowPriceWarning(false)
    }
  }, [form.price, selectedStock, editingSale])

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {}
    
    if (!form.customer_id) {
      newErrors.customer_id = 'Please select a customer'
    }
    
    if (!form.product_id) {
      newErrors.product_id = 'Please select a product'
    }
    
    if (!form.quantity || parseInt(form.quantity) < 1) {
      newErrors.quantity = 'Quantity must be at least 1'
    } else if (selectedStock && parseInt(form.quantity) > selectedStock.quantity) {
      newErrors.quantity = `Only ${selectedStock.quantity} units available`
    }
    
    if (!form.price || parseFloat(form.price) <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    
    if (!form.date) {
      newErrors.date = 'Please select a date'  // ✅ ADDED: Date validation
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form, selectedStock])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const customer = customers.find(c => c.id === form.customer_id)
      const product = stock.find(s => s.id === form.product_id)
      
      const saleData = {
        customer_id: form.customer_id,
        customer_name: customer?.name || 'Unknown',
        product_id: form.product_id,
        product_name: product?.product_name || 'Unknown',
        quantity_sold: parseInt(form.quantity),
        price: parseFloat(form.price),
        total: parseInt(form.quantity) * parseFloat(form.price),
        date: new Date(form.date).toISOString(),  // ✅ ADDED: Include date
        notes: form.notes || null  // ✅ ADDED: Include notes
      }
      
      // ✅ ADDED: Include ID if editing
      if (editingSale?.id) {
        saleData.id = editingSale.id
      }
      
      await onSubmit(saleData)
      
      toast.success(editingSale ? 'Sale updated!' : 'Sale recorded!', {
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        duration: 3000
      })
      
      // Reset form only if not editing
      if (!editingSale) {
        handleClearForm()
      }
    } catch (error) {
      console.error('Sale error:', error)
      toast.error('Failed: ' + (error.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clear form
  const handleClearForm = () => {
    setForm({
      customer_id: '',
      category: '',
      product_id: '',
      quantity: '',
      price: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setErrors({})
    setSelectedStock(null)
    setShowPriceWarning(false)
  }

  // ✅ ADDED: Cancel edit handler
  const handleCancel = () => {
    handleClearForm()
    onCancel?.()
  }

  // Calculate total
  const total = form.quantity && form.price 
    ? parseInt(form.quantity) * parseFloat(form.price) 
    : 0

  // Get stock level badge
  const getStockBadge = (quantity) => {
    if (quantity <= 0) {
      return { label: 'Out of Stock', class: 'bg-red-100 text-red-700 border-red-200' }
    } else if (quantity <= 5) {
      return { label: `Low (${quantity})`, class: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
    } else {
      return { label: `${quantity} in stock`, class: 'bg-green-100 text-green-700 border-green-200' }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Category</Label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, category: '', product_id: '' }))}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !form.category
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, category: cat, product_id: '' }))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  form.category === cat
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {cat.replace(/-/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Select - ✅ ADDED WALK-IN OPTION */}
        <div className="space-y-2">
          <Label htmlFor="customer" className="text-sm font-medium">
            Customer <span className="text-destructive">*</span>
          </Label>
          <Select
            value={form.customer_id}
            onValueChange={(value) => {
              // ✅ FIX: Ignore placeholder values
              if (value === 'placeholder-none') return
              setForm(prev => ({ ...prev, customer_id: value }))
            }}
          >
            <SelectTrigger 
              id="customer"
              className={`rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                errors.customer_id ? 'border-destructive' : 'border-border'
              }`}
            >
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {/* ✅ ADDED: Walk-in Customer Option */}
              <SelectItem 
                value="walkin" 
                className="hover:bg-primary/5 cursor-pointer border-b border-border/20"
              >
                <span className="font-medium text-orange-600">🚶 Walk-in Customer</span>
              </SelectItem>
              
              {customers.length === 0 ? (
                // ✅ FIX: Use non-empty value for disabled placeholder
                <SelectItem value="placeholder-none" disabled>
                  No customers available
                </SelectItem>
              ) : (
                customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.customer_id && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.customer_id}
            </p>
          )}
        </div>

        {/* Product Select */}
        <div className="space-y-2">
          <Label htmlFor="product" className="text-sm font-medium">
            Product <span className="text-destructive">*</span>
          </Label>
          <Select
            value={form.product_id}
            onValueChange={(value) => {
              // ✅ FIX: Ignore placeholder values
              if (value === 'placeholder-none') return
              setForm(prev => ({ ...prev, product_id: value }))
            }}
          >
            <SelectTrigger 
              id="product"
              className={`rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                errors.product_id ? 'border-destructive' : 'border-border'
              }`}
            >
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-64">
              {availableStock.length === 0 ? (
                // ✅ FIX: Use non-empty value for disabled placeholder
                <SelectItem value="placeholder-none" disabled>
                  {form.category ? 'No products in this category' : 'No products available'}
                </SelectItem>
              ) : (
                availableStock.map(item => {
                  const badge = getStockBadge(item.quantity)
                  return (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="flex-1 truncate">{item.product_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.class}`}>
                          {badge.label}
                        </span>
                      </div>
                    </SelectItem>
                  )
                })
              )}
            </SelectContent>
          </Select>
          {errors.product_id && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.product_id}
            </p>
          )}
        </div>

        {/* Quantity Input */}
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-sm font-medium">
            Quantity <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            placeholder="0"
            value={form.quantity}
            onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
            disabled={!form.product_id}
            className={`rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
              errors.quantity ? 'border-destructive' : 'border-border'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {selectedStock && (
            <p className="text-xs text-muted-foreground">
              Available: {selectedStock.quantity} units
            </p>
          )}
          {errors.quantity && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.quantity}
            </p>
          )}
        </div>

        {/* Price Input */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium">
            Price (KES) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.price}
            onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
            disabled={!form.product_id}
            className={`rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
              errors.price ? 'border-destructive' : 'border-border'
            } disabled:opacity-50 disabled:cursor-not-allowed ${
              showPriceWarning ? 'border-yellow-500 focus:ring-yellow-500/20' : ''
            }`}
          />
          {selectedStock && (
            <p className="text-xs text-muted-foreground">
              Standard: {formatKES(selectedStock.selling_price)}
            </p>
          )}
          {showPriceWarning && (
            <p className="text-xs text-yellow-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Price differs from standard price
            </p>
          )}
          {errors.price && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.price}
            </p>
          )}
        </div>

        {/* ✅ ADDED: Date Input */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium">
            Date <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              className={`pl-10 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                errors.date ? 'border-destructive' : 'border-border'
              }`}
            />
          </div>
          {errors.date && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.date}
            </p>
          )}
        </div>

        {/* ✅ ADDED: Notes Input */}
        <div className="space-y-2 md:col-span-2 lg:col-span-1">
          <Label htmlFor="notes" className="text-sm font-medium">
            Notes <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="notes"
            type="text"
            placeholder="Additional notes..."
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-border"
          />
        </div>
      </div>

      {/* Total & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-3xl font-bold text-gradient">
            {formatKES(total)}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={editingSale ? handleCancel : handleClearForm}  // ✅ ADDED: Cancel for edit mode
            disabled={isSubmitting || loading}
            className="rounded-xl px-6"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {editingSale ? 'Cancel' : 'Clear'}  // ✅ ADDED: Dynamic button text
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting || loading || !form.customer_id || !form.product_id}
            className="btn-primary-gradient rounded-xl px-8 min-w-35"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                {editingSale ? 'Updating...' : 'Recording...'}  // ✅ ADDED: Dynamic loading text
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {editingSale ? 'Update Sale' : 'Record Sale'}  // ✅ ADDED: Dynamic button text
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
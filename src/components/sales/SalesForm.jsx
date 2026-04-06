"use client"

import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, AlertCircle, RotateCcw, CheckCircle2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

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
  // eslint-disable-next-line no-unused-vars
  loading = false,
  editingSale = null,
  onCancel
}) {
  // ✅ Use key to force re-render when editing
  const [formKey, setFormKey] = useState(0)
  
  const [form, setForm] = useState({
    customer_id: '',
    category: '',
    product_id: '',
    quantity: '1',
    price: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  
  const [errors, setErrors] = useState({})
  const [selectedStock, setSelectedStock] = useState(null)
  const [showPriceWarning, setShowPriceWarning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ INSTANT AUTO-FILL when editingSale changes
  useEffect(() => {
    if (editingSale) {
      console.log('📝 Editing sale:', editingSale)
      
      // Find product to get category
      const product = stock.find(s => s.id === editingSale.product_id)
      console.log('📦 Found product:', product)
      
      // Update form with sale data
      const newForm = {
        customer_id: editingSale.customer_id || '',
        category: product?.category || '',
        product_id: editingSale.product_id || '',
        quantity: editingSale.quantity_sold?.toString() || '1',
        price: editingSale.price?.toString() || '',
        date: editingSale.date ? new Date(editingSale.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: editingSale.notes || ''
      }
      
      console.log('✅ Setting form to:', newForm)
      setForm(newForm)
      setSelectedStock(product || null)
      setShowPriceWarning(false)
      setFormKey(prev => prev + 1) // ✅ Force re-render
    }
  }, [editingSale, stock])

  // Get unique categories
  const categories = [...new Set(stock.map(item => item.category).filter(Boolean))]

  // Get available stock for selected category
  const availableStock = stock.filter(item => 
    item.quantity > 0 && (!form.category || item.category === form.category)
  )

  // Auto-fill price when product changes (only for new sales)
  useEffect(() => {
    if (form.product_id && !editingSale) {
      const product = stock.find(s => s.id === form.product_id)
      if (product) {
        setForm(prev => ({ ...prev, price: product.selling_price.toString() }))
        setSelectedStock(product)
        setShowPriceWarning(false)
      }
    } else if (form.product_id && editingSale) {
      const product = stock.find(s => s.id === form.product_id)
      setSelectedStock(product)
    } else {
      setSelectedStock(null)
    }
  }, [form.product_id, stock, editingSale])

  // Price warning
  useEffect(() => {
    if (selectedStock && form.price && !editingSale) {
      const diff = Math.abs(parseFloat(form.price) - selectedStock.selling_price)
      setShowPriceWarning(diff > 0.01)
    } else {
      setShowPriceWarning(false)
    }
  }, [form.price, selectedStock, editingSale])

  // Validate
  const validateForm = useCallback(() => {
    const newErrors = {}
    if (!form.customer_id) newErrors.customer_id = 'Please select a customer'
    if (!form.product_id) newErrors.product_id = 'Please select a product'
    if (!form.quantity || parseInt(form.quantity) < 1) {
      newErrors.quantity = 'Quantity must be at least 1'
    } else if (selectedStock && parseInt(form.quantity) > selectedStock.quantity) {
      newErrors.quantity = `Only ${selectedStock.quantity} units available`
    }
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = 'Price must be greater than 0'
    if (!form.date) newErrors.date = 'Please select a date'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form, selectedStock])

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Please fix the errors')
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
        date: new Date(form.date).toISOString(),
        notes: form.notes || null
      }
      
      if (editingSale?.id) saleData.id = editingSale.id
      
      await onSubmit(saleData)
      toast.success(editingSale ? 'Sale updated!' : 'Sale recorded!')
      
      if (!editingSale) handleClearForm()
    } catch (error) {
      toast.error('Failed: ' + error.message)
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
      quantity: '1',
      price: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setErrors({})
    setSelectedStock(null)
    setShowPriceWarning(false)
    setFormKey(prev => prev + 1)
  }

  // Cancel
  const handleCancel = () => {
    handleClearForm()
    onCancel?.()
  }

  // Calculate total
  const total = form.quantity && form.price ? parseInt(form.quantity) * parseFloat(form.price) : 0

  // Stock badge
  const getStockBadge = (qty) => {
    if (qty <= 0) return { label: 'Out of Stock', class: 'bg-red-100 text-red-700 border-red-200' }
    if (qty <= 5) return { label: `Low (${qty})`, class: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
    return { label: `${qty} in stock`, class: 'bg-green-100 text-green-700 border-green-200' }
  }

  return (
    <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setForm(prev => ({ ...prev, category: '', product_id: '' }))}
              className={`px-4 py-2 rounded-full text-sm font-medium ${!form.category ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
              All Categories
            </button>
            {categories.map(cat => (
              <button key={cat} type="button" onClick={() => setForm(prev => ({ ...prev, category: cat, product_id: '' }))}
                className={`px-4 py-2 rounded-full text-sm font-medium ${form.category === cat ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                {cat.replace(/-/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer - WITH WALK-IN */}
        <div className="space-y-2">
          <Label>Customer <span className="text-destructive">*</span></Label>
          <Select value={form.customer_id} onValueChange={(value) => setForm(prev => ({ ...prev, customer_id: value }))}>
            <SelectTrigger className={errors.customer_id ? 'border-destructive' : 'border-border'}>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walkin">🚶 Walk-in Customer</SelectItem>
              {customers.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.customer_id && <p className="text-xs text-destructive">{errors.customer_id}</p>}
        </div>

        {/* Product */}
        <div className="space-y-2">
          <Label>Product <span className="text-destructive">*</span></Label>
          <Select value={form.product_id} onValueChange={(value) => setForm(prev => ({ ...prev, product_id: value }))}>
            <SelectTrigger className={errors.product_id ? 'border-destructive' : 'border-border'}>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {availableStock.length === 0 ? (
                <SelectItem disabled>{form.category ? 'No products in category' : 'No products'}</SelectItem>
              ) : (
                availableStock.map(item => {
                  const badge = getStockBadge(item.quantity)
                  return (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex justify-between w-full">
                        <span>{item.product_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.class}`}>{badge.label}</span>
                      </div>
                    </SelectItem>
                  )
                })
              )}
            </SelectContent>
          </Select>
          {errors.product_id && <p className="text-xs text-destructive">{errors.product_id}</p>}
          {selectedStock && <p className="text-xs text-muted-foreground">Available: {selectedStock.quantity} units</p>}
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label>Quantity <span className="text-destructive">*</span></Label>
          <Input type="number" min="1" value={form.quantity} onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
            disabled={!form.product_id} className={errors.quantity ? 'border-destructive' : 'border-border'} />
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label>Price (KES) <span className="text-destructive">*</span></Label>
          <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
            disabled={!form.product_id} className={`${errors.price ? 'border-destructive' : 'border-border'} ${showPriceWarning ? 'border-yellow-500' : ''}`} />
          {selectedStock && <p className="text-xs text-muted-foreground">Standard: {formatKES(selectedStock.selling_price)}</p>}
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label>Date <span className="text-destructive">*</span></Label>
          <Input type="date" value={form.date} onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
            className={errors.date ? 'border-destructive' : 'border-border'} />
          {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
        </div>

        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
          <Input type="text" placeholder="Additional notes..." value={form.notes} onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))} />
        </div>
      </div>

      {/* Total & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
        <div>
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-3xl font-bold text-gradient">{formatKES(total)}</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={editingSale ? handleCancel : handleClearForm} disabled={isSubmitting} className="rounded-xl px-6">
            <RotateCcw className="w-4 h-4 mr-2" />{editingSale ? 'Cancel' : 'Clear'}
          </Button>
          <Button type="submit" disabled={isSubmitting || !form.customer_id || !form.product_id} className="btn-primary-gradient rounded-xl px-8">
            {isSubmitting ? '...' : editingSale ? 'Update Sale' : 'Record Sale'}
          </Button>
        </div>
      </div>
    </form>
  )
}
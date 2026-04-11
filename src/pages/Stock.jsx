"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  Archive,
  RotateCcw,
  Search, 
  AlertTriangle, 
  X,
  ChevronUp,
  ChevronDown,
  Grid3X3
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from "@/context/DataContext"
import { toast } from "sonner"

// ✅ ADD: Security utilities for sanitization
import { useSanitize } from '@/hooks/useSanitize'
import { logSecurityEvent, SECURITY_EVENTS } from '@/lib/securityLogger'

export default function Stock() {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)
  const [addingNew, setAddingNew] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [archiveConfirm, setArchiveConfirm] = useState(null)
  // eslint-disable-next-line no-unused-vars
  const [showArchived, setShowArchived] = useState(false)
  const [showOverview, setShowOverview] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  
  // Sorting
  const [sortColumn, setSortColumn] = useState('product_name')
  const [sortDirection, setSortDirection] = useState('asc')

  const { getStock, createStock, updateStock, deleteStock } = useData()

  // ✅ ADD: Sanitization hook
  // eslint-disable-next-line no-unused-vars
  const { sanitize, sanitizeForm } = useSanitize()

  // Load stock
  const loadStock = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getStock()
      setStock(data || [])
    } catch (err) {
      console.error('Failed to load stock:', err)
      toast.error('Failed to load stock')
      setStock([])
    } finally {
      setLoading(false)
    }
  }, [getStock])

  // Load on mount
  useEffect(() => {
    loadStock()
  }, [loadStock])

  // Get unique categories
  const categories = [...new Set(stock.map(item => item.category).filter(Boolean))]

  // Stock status
  const getStockStatus = (quantity) => {
    if (quantity <= 5) return 'critical'
    if (quantity <= 10) return 'low'
    return 'healthy'
  }

  // ✅ UPDATED: Handle form submission with sanitization
  const handleSubmit = useCallback(async (formData) => {
    // ✅ STEP 1: Sanitize text fields only (keep numbers as numbers)
    const sanitizedData = {
      ...sanitizeForm({
        product_name: formData.product_name,
        category: formData.category,
        description: formData.description,
        supplier: formData.supplier
      }),
      // ✅ Keep numeric fields as numbers (don't sanitize numbers)
      quantity: parseInt(formData.quantity) || 0,
      selling_price: parseFloat(formData.selling_price) || 0,
      cost_price: parseFloat(formData.cost_price) || 0,
      reorder_level: parseInt(formData.reorder_level) || 10,
      is_active: formData.is_active !== false
    }
    
    try {
      if (editingItem) {
        // ✅ Update existing stock with sanitized data
        await updateStock(editingItem.id, sanitizedData)
        
        // ✅ Log security event
        await logSecurityEvent(SECURITY_EVENTS.DATA_UPDATE, {
          table: 'stock',
          recordId: editingItem.id,
          product: sanitizedData.product_name,
          changes: { quantity: sanitizedData.quantity, price: sanitizedData.selling_price }
        })
        
        setEditingItem(null)
        setShowEditModal(false)
        toast.success('Product updated!')
      } else {
        // ✅ Create new stock with sanitized data
        const newStock = await createStock(sanitizedData)
        
        // ✅ Log security event
        await logSecurityEvent(SECURITY_EVENTS.DATA_CREATE, {
          table: 'stock',
          recordId: newStock?.id,
          product: sanitizedData.product_name
        })
        
        setAddingNew(false)
        toast.success('Product added!')
      }
      await loadStock()
      return true
    } catch (err) {
      console.error('Save stock error:', err)
      toast.error('Failed to save product')
      return false
    }
  }, [editingItem, createStock, updateStock, loadStock, sanitizeForm])

  // ✅ UPDATED: Handle delete with security logging
  const handleDelete = useCallback(async (item) => {
    try {
      await deleteStock(item.id)
      
      // ✅ Log security event
      await logSecurityEvent(SECURITY_EVENTS.DATA_DELETE, {
        table: 'stock',
        recordId: item.id,
        product: item.product_name
      })
      
      await loadStock()
      toast.success('Product deleted')
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete stock error:', err)
      toast.error('Failed to delete product')
    }
  }, [deleteStock, loadStock])

  // ✅ NEW: Handle archive with security logging
  const handleArchive = useCallback(async (item) => {
    try {
      await updateStock(item.id, { is_active: false })
      
      // ✅ Log security event
      await logSecurityEvent(SECURITY_EVENTS.DATA_UPDATE, {
        table: 'stock',
        recordId: item.id,
        product: item.product_name,
        action: 'archived'
      })
      
      await loadStock()
      toast.success('Product archived')
      setArchiveConfirm(null)
    } catch (err) {
      console.error('Archive stock error:', err)
      toast.error('Failed to archive product')
    }
  }, [updateStock, loadStock])

  // Handle sort
  const handleSort = useCallback((column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }, [sortColumn, sortDirection])

  // Filter and sort stock
  const filteredStock = useCallback(() => {
    let filtered = stock.filter(item => {
      const matchesSearch = 
        item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (!matchesSearch) return false
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      if (stockFilter !== 'all') {
        const status = getStockStatus(item.quantity)
        if (status !== stockFilter) return false
      }
      return true
    })

    filtered.sort((a, b) => {
      let aVal, bVal
      switch (sortColumn) {
        case 'product_name':
          aVal = a.product_name?.toLowerCase() || ''
          bVal = b.product_name?.toLowerCase() || ''
          break
        case 'category':
          aVal = a.category?.toLowerCase() || ''
          bVal = b.category?.toLowerCase() || ''
          break
        case 'quantity':
          aVal = a.quantity || 0
          bVal = b.quantity || 0
          break
        case 'selling_price':
          aVal = a.selling_price || 0
          bVal = b.selling_price || 0
          break
        default:
          aVal = a.product_name?.toLowerCase() || ''
          bVal = b.product_name?.toLowerCase() || ''
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [stock, searchTerm, categoryFilter, stockFilter, sortColumn, sortDirection])

  // Stock stats
  const stockStats = {
    total: stock.length,
    healthy: stock.filter(item => getStockStatus(item.quantity) === 'healthy').length,
    low: stock.filter(item => getStockStatus(item.quantity) === 'low').length,
    critical: stock.filter(item => getStockStatus(item.quantity) === 'critical').length,
    totalValue: stock.reduce((sum, item) => sum + (item.quantity * item.selling_price), 0)
  }

  // Format KES
  const formatKES = (amount) => new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(amount || 0)

  // Status badge component
  const StockBadge = ({ quantity }) => {
    const status = getStockStatus(quantity)
    const config = {
      healthy: { label: 'In Stock', class: 'bg-green-100 text-green-700 border-green-200', icon: '🟢' },
      low: { label: 'Low Stock', class: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '🟡' },
      critical: { label: 'Critical', class: 'bg-red-100 text-red-700 border-red-200', icon: '🔴' }
    }
    const { label, class: className, icon } = config[status]
    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${className}`}>
        {icon} {label} ({quantity})
      </span>
    )
  }

  // Sort icon component
  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return <ChevronUp className="w-4 h-4 text-muted-foreground/30" />
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-primary" />
      : <ChevronDown className="w-4 h-4 text-primary" />
  }

  // Open edit modal
  const openEditModal = useCallback((item) => {
    setEditingItem(item)
    setAddingNew(false)
    setShowEditModal(true)
  }, [])

  // Close edit modal
  const closeEditModal = useCallback(() => {
    setEditingItem(null)
    setShowEditModal(false)
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center shadow-sm">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Stock Inventory</h1>
            <p className="text-sm text-muted-foreground">Manage your products and inventory levels</p>
          </div>
        </div>
      </div>

      {/* Stock Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card hover-lift-subtle">
          <div className="text-sm text-muted-foreground mb-1">Total Products</div>
          <div className="text-2xl font-bold text-foreground">{stockStats.total}</div>
        </div>
        <div className="card hover-lift-subtle">
          <div className="text-sm text-muted-foreground mb-1">🟢 Healthy</div>
          <div className="text-2xl font-bold text-green-600">{stockStats.healthy}</div>
        </div>
        <div className="card hover-lift-subtle">
          <div className="text-sm text-muted-foreground mb-1">🟡 Low Stock</div>
          <div className="text-2xl font-bold text-yellow-600">{stockStats.low}</div>
        </div>
        <div className="card hover-lift-subtle">
          <div className="text-sm text-muted-foreground mb-1">🔴 Critical</div>
          <div className="text-2xl font-bold text-red-600">{stockStats.critical}</div>
        </div>
        <div className="card hover-lift-subtle">
          <div className="text-sm text-muted-foreground mb-1">Inventory Value</div>
          <div className="text-2xl font-bold text-primary">{formatKES(stockStats.totalValue)}</div>
        </div>
      </div>

      {/* Product Overview Toggle Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowOverview(!showOverview)}
          className="rounded-xl px-6 hover-lift-subtle border-border/30"
        >
          <Grid3X3 className="w-4 h-4 mr-2" />
          {showOverview ? 'Hide' : 'Show'} Product Overview
          <ChevronUp className={`w-4 h-4 ml-2 transition-transform ${showOverview ? '' : 'rotate-180'}`} />
        </Button>
      </div>

      {/* Product Overview Grid */}
      {showOverview && (
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Product Overview
            </h2>
            <span className="text-sm text-muted-foreground">{stock.length} products</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stock.map((item) => {
              const status = getStockStatus(item.quantity)
              const statusConfig = {
                healthy: { class: 'bg-green-100 text-green-700', icon: '🟢' },
                low: { class: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
                critical: { class: 'bg-red-100 text-red-700', icon: '🔴' }
              }
              const { class: statusClass, icon } = statusConfig[status]
              
              return (
                <div key={item.id} className="rounded-xl p-3 border border-border/30 bg-card hover:border-primary/30 transition-all hover-lift-subtle">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.product_name}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.category?.replace(/-/g, ' ')}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass}`}>
                      {icon} {item.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Price:</span>
                    <span className="font-medium text-primary">{formatKES(item.selling_price)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Value:</span>
                    <span className="font-medium">{formatKES(item.quantity * item.selling_price)}</span>
                  </div>
                  
                  {/* Edit Button - Opens Modal */}
                  <div className="flex gap-2 mt-3 pt-2 border-t border-border/20">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 rounded-lg text-xs h-8"
                      onClick={() => openEditModal(item)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
          
          {stock.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No products in inventory</p>
            </div>
          )}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-40 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat.replace(/-/g, ' ').toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-full md:w-40 rounded-xl">
              <SelectValue placeholder="Stock Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="healthy">🟢 Healthy</SelectItem>
              <SelectItem value="low">🟡 Low Stock</SelectItem>
              <SelectItem value="critical">🔴 Critical</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => { setAddingNew(true); setEditingItem(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="btn-primary-gradient rounded-xl hover-lift-subtle"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {stockStats.critical > 0 && (
        <div className="card border-warning/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-semibold">Critical Stock Alert</h2>
            <span className="text-sm text-muted-foreground">({stockStats.critical} items need immediate restock)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stock.filter(item => getStockStatus(item.quantity) === 'critical').slice(0, 6).map(item => (
              <div key={item.id} className="rounded-xl p-3 bg-red-50 border border-red-200 hover-lift-subtle">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{item.product_name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    {item.quantity} left
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{item.category}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Form */}
      {addingNew && !editingItem && (
        <div className="card animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New Product
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setAddingNew(false)}
              className="hover-lift-subtle"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
          <StockForm 
            onSubmit={handleSubmit}
            editingItem={null}
            onCancel={() => setAddingNew(false)}
          />
        </div>
      )}

      {/* ✅ EDIT MODAL - Popup for editing */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-2xl w-full shadow-xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/20">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Pencil className="w-5 h-5 text-primary" />
                Edit Product
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={closeEditModal}
                className="hover-lift-subtle"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <StockForm 
              onSubmit={handleSubmit}
              editingItem={editingItem}
              onCancel={closeEditModal}
            />
          </div>
        </div>
      )}

      {/* Stock Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            All Products ({filteredStock().length})
          </h2>
        </div>
        
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        )}
        
        {!loading && filteredStock().length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">
              {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
                ? 'No products match your filters' 
                : 'No products in inventory'}
            </p>
            <p className="text-sm mb-4">
              {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first product to get started'}
            </p>
            {!searchTerm && categoryFilter === 'all' && stockFilter === 'all' && (
              <Button 
                onClick={() => { setAddingNew(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="btn-primary-gradient rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>
        )}
        
        {!loading && filteredStock().length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors hover-lift-subtle" onClick={() => handleSort('product_name')}>
                    <div className="flex items-center gap-2">Product<SortIcon column="product_name" /></div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors hover-lift-subtle" onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-2">Category<SortIcon column="category" /></div>
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors hover-lift-subtle" onClick={() => handleSort('quantity')}>
                    <div className="flex items-center justify-end gap-2">Quantity<SortIcon column="quantity" /></div>
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors hover-lift-subtle" onClick={() => handleSort('selling_price')}>
                    <div className="flex items-center justify-end gap-2">Price<SortIcon column="selling_price" /></div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock().map((item) => (
                  <tr key={item.id} className="border-b border-border/10 hover:bg-primary/5 transition-colors group">
                    <td className="py-4 px-4"><div className="font-medium text-foreground">{item.product_name}</div></td>
                    <td className="py-4 px-4"><span className="text-sm text-muted-foreground">{item.category?.replace(/-/g, ' ').toUpperCase() || '—'}</span></td>
                    <td className="py-4 px-4 text-right"><div className="font-mono font-medium text-foreground">{item.quantity}</div><div className="text-xs text-muted-foreground">units</div></td>
                    <td className="py-4 px-4 text-right"><div className="font-mono font-semibold text-primary">{formatKES(item.selling_price)}</div></td>
                    <td className="py-4 px-4 text-center"><StockBadge quantity={item.quantity} /></td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary hover-lift-subtle" onClick={() => openEditModal(item)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-warning/10 hover:text-warning hover-lift-subtle" onClick={() => setArchiveConfirm(item)}>
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive hover-lift-subtle" onClick={() => setDeleteConfirm(item)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Archive Confirmation Dialog */}
      {archiveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Archive className="w-5 h-5 text-warning" />
              </div>
              <h3 className="text-lg font-semibold">Archive Product?</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to archive <strong>{archiveConfirm.product_name}</strong>? It will be hidden from inventory but can be restored later.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setArchiveConfirm(null)} className="rounded-xl px-6">Cancel</Button>
              <Button onClick={() => handleArchive(archiveConfirm)} className="rounded-xl px-6 bg-warning text-white hover:bg-warning/90">Archive</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold">Delete Product?</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.product_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-xl px-6">Cancel</Button>
              <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)} className="rounded-xl px-6">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Stock Form Component (unchanged - sanitization handled in parent)
function StockForm({ onSubmit, editingItem, onCancel }) {
  const [form, setForm] = useState({
    product_name: editingItem?.product_name || '',
    category: editingItem?.category || '',
    quantity: editingItem?.quantity?.toString() || '',
    selling_price: editingItem?.selling_price?.toString() || '',
    cost_price: editingItem?.cost_price?.toString() || '',
    reorder_level: editingItem?.reorder_level?.toString() || '10',
    is_active: true
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    'water-bottles-filled',
    'water-refills',
    'empty-bottles',
    'water-pumps',
    'accessories',
    'packages'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.product_name) newErrors.product_name = 'Product name is required'
    if (!form.category) newErrors.category = 'Category is required'
    if (!form.quantity || parseInt(form.quantity) < 0) newErrors.quantity = 'Valid quantity required'
    if (!form.selling_price || parseFloat(form.selling_price) <= 0) newErrors.selling_price = 'Valid price required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit({
        ...form,
        quantity: parseInt(form.quantity),
        selling_price: parseFloat(form.selling_price),
        cost_price: form.cost_price ? parseFloat(form.cost_price) : 0,
        reorder_level: parseInt(form.reorder_level)
      })
      setForm({ product_name: '', category: '', quantity: '', selling_price: '', cost_price: '', reorder_level: '10', is_active: true })
      setErrors({})
    } catch (err) {
      console.error('Form submit error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="product_name">Product Name <span className="text-destructive">*</span></Label>
          <Input id="product_name" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} className={`rounded-xl ${errors.product_name ? 'border-destructive' : ''}`} placeholder="e.g., 20L Water Bottle" />
          {errors.product_name && <p className="text-xs text-destructive">{errors.product_name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
          <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
            <SelectTrigger className={`rounded-xl ${errors.category ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (<SelectItem key={cat} value={cat}>{cat.replace(/-/g, ' ').toUpperCase()}</SelectItem>))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity <span className="text-destructive">*</span></Label>
          <Input id="quantity" type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className={`rounded-xl ${errors.quantity ? 'border-destructive' : ''}`} placeholder="0" />
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="selling_price">Selling Price (KES) <span className="text-destructive">*</span></Label>
          <Input id="selling_price" type="number" step="0.01" min="0" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} className={`rounded-xl ${errors.selling_price ? 'border-destructive' : ''}`} placeholder="0.00" />
          {errors.selling_price && <p className="text-xs text-destructive">{errors.selling_price}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cost_price">Cost Price (KES)</Label>
          <Input id="cost_price" type="number" step="0.01" min="0" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} className="rounded-xl" placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reorder_level">Reorder Level</Label>
          <Input id="reorder_level" type="number" min="0" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} className="rounded-xl" placeholder="10" />
          <p className="text-xs text-muted-foreground">Alert when stock reaches this level</p>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="btn-primary-gradient rounded-xl px-6">
          {isSubmitting ? (<><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Saving...</>) : (editingItem ? 'Update Product' : 'Add Product')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="rounded-xl px-6">Cancel</Button>
      </div>
    </form>
  )
}
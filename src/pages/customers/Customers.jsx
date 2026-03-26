"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  UserPlus, 
  Phone, 
  MapPin, 
  Pencil, 
  Trash2, 
  Search, 
  AlertTriangle,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from "@/context/DataContext"
import { toast } from "sonner"
import CustomerForm from '@/components/customers/CustomerForm'
import CustomerSales from "./CustomerSales"

export default function Customers() {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [customers, setCustomers] = useState([])
  const [allSales, setAllSales] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Sorting
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  
  // Delete confirmation
  const [customerToDelete, setCustomerToDelete] = useState(null)

  const { getCustomers, createCustomer, updateCustomer, deleteCustomer, getSales } = useData()

  // Load customers AND sales
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [customersData, salesData] = await Promise.all([
        getCustomers(),
        getSales()
      ])
      setCustomers(customersData || [])
      setAllSales(salesData || [])
      console.log('✅ Loaded:', customersData?.length, 'customers,', salesData?.length, 'sales')
    } catch (err) {
      console.error('Failed to load data:', err)
      toast.error('Failed to load customers')
      setCustomers([])
      setAllSales([])
    } finally {
      setLoading(false)
    }
  }, [getCustomers, getSales])

  // Load on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Get customer status based on sales
  const getCustomerStatus = useCallback((customer) => {
    const customerSales = allSales.filter(s => s.customer_id === customer.id)
    const lastSale = customerSales.length > 0 
      ? new Date(Math.max(...customerSales.map(s => new Date(s.date))))
      : null
    
    const daysSinceLastSale = lastSale 
      ? Math.floor((Date.now() - lastSale.getTime()) / (1000 * 60 * 60 * 24))
      : null
    
    const createdDate = new Date(customer.created_at || Date.now())
    const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceCreated <= 7 && !lastSale) return 'new'
    if (daysSinceLastSale !== null && daysSinceLastSale <= 30) return 'active'
    if (daysSinceLastSale !== null && daysSinceLastSale <= 60) return 'at-risk'
    return 'dormant'
  }, [allSales])

  // Calculate customer stats
  const getCustomerStats = useCallback((customer) => {
    const customerSales = allSales.filter(s => s.customer_id === customer.id)
    const totalOrders = customerSales.length
    const totalSpent = customerSales.reduce((sum, s) => sum + (s.total || 0), 0)
    const lastPurchase = customerSales.length > 0 
      ? new Date(Math.max(...customerSales.map(s => new Date(s.date))))
      : null
    
    return { totalOrders, totalSpent, lastPurchase }
  }, [allSales])

  // Handle form submission
  const handleSubmit = useCallback(async (formData) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData)
        setEditingCustomer(null)
        toast.success('Customer updated!')
      } else {
        await createCustomer(formData)
        toast.success('Customer added!')
      }
      await loadData()
      return true
    } catch (err) {
      console.error('Save customer error:', err)
      toast.error('Failed to save customer')
      return false
    }
  }, [editingCustomer, createCustomer, updateCustomer, loadData])

  // Handle view customer sales
  const handleViewCustomer = useCallback((customerId) => {
    setSelectedCustomerId(customerId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Handle edit click
  const handleEditClick = useCallback((customer) => {
    setEditingCustomer(customer)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Handle delete click
  const handleDeleteClick = useCallback((customer) => {
    setCustomerToDelete(customer)
  }, [])

  // Confirm delete
  const confirmDelete = useCallback(async () => {
    if (!customerToDelete) return
    
    try {
      await deleteCustomer(customerToDelete.id)
      if (selectedCustomerId === customerToDelete.id) {
        setSelectedCustomerId(null)
      }
      await loadData()
      toast.success('Customer deleted')
    } catch (err) {
      console.error('Delete customer error:', err)
      toast.error('Failed to delete customer')
    } finally {
      setCustomerToDelete(null)
    }
  }, [customerToDelete, deleteCustomer, selectedCustomerId, loadData])

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingCustomer(null)
  }, [])

  // Handle sort
  const handleSort = useCallback((column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }, [sortColumn, sortDirection])

  // Filter and sort customers
  const filteredCustomers = useCallback(() => {
    let filtered = customers.filter(customer => {
      // Search filter
      const matchesSearch = 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.location?.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (!matchesSearch) return false
      
      // Status filter
      if (statusFilter !== 'all') {
        const status = getCustomerStatus(customer)
        if (status !== statusFilter) return false
      }
      
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal
      
      switch (sortColumn) {
        case 'name':
          aVal = a.name?.toLowerCase() || ''
          bVal = b.name?.toLowerCase() || ''
          break
        case 'phone':
          aVal = a.phone || ''
          bVal = b.phone || ''
          break
        case 'location':
          aVal = a.location?.toLowerCase() || ''
          bVal = b.location?.toLowerCase() || ''
          break
        case 'orders':
          aVal = getCustomerStats(a).totalOrders
          bVal = getCustomerStats(b).totalOrders
          break
        default:
          aVal = a.name?.toLowerCase() || ''
          bVal = b.name?.toLowerCase() || ''
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [customers, searchTerm, statusFilter, sortColumn, sortDirection, getCustomerStatus, getCustomerStats])

  // Get selected customer
  const selectedCustomer = customers?.find?.(c => c.id === selectedCustomerId)

  // Get selected customer's sales
  const selectedCustomerSales = allSales.filter(s => s.customer_id === selectedCustomerId)

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      new: { label: 'New', class: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🔵' },
      active: { label: 'Active', class: 'bg-green-100 text-green-700 border-green-200', icon: '🟢' },
      'at-risk': { label: 'At Risk', class: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '🟡' },
      dormant: { label: 'Dormant', class: 'bg-red-100 text-red-700 border-red-200', icon: '🔴' }
    }
    
    const { label, class: className, icon } = config[status] || config.new
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${className}`}>
        {icon} {label}
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

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Customers</h1>
            <p className="text-sm text-muted-foreground">Manage your customer base and view sales</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 rounded-xl">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">🔵 New</SelectItem>
              <SelectItem value="active">🟢 Active</SelectItem>
              <SelectItem value="at-risk">🟡 At Risk</SelectItem>
              <SelectItem value="dormant">🔴 Dormant</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Add Customer Button */}
          <Button 
            onClick={() => { setEditingCustomer({}); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="btn-primary-gradient rounded-xl hover-lift-subtle"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {editingCustomer && (
        <div className="card animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {editingCustomer?.id ? <Pencil className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
              {editingCustomer?.id ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancelEdit}
              className="hover-lift-subtle"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
          <CustomerForm
            onSubmit={handleSubmit}
            editingCustomer={editingCustomer?.id ? editingCustomer : null}
            onCancel={handleCancelEdit}
            loading={loading}
          />
        </div>
      )}

      {/* ✅ Customer Sales Panel - Shows ALL sales for selected customer */}
      {selectedCustomerId && selectedCustomer && (
        <div className="card animate-fade-in-up">
          <CustomerSales 
            customer={selectedCustomer} 
            sales={selectedCustomerSales}
            onClose={() => setSelectedCustomerId(null)} 
          />
        </div>
      )}

      {/* Customers Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            All Customers ({filteredCustomers().length})
          </h2>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!loading && filteredCustomers().length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'No customers match your filters' 
                : 'No customers yet'}
            </p>
            <p className="text-sm mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first customer to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button 
                onClick={() => { setEditingCustomer({}); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="btn-primary-gradient rounded-xl"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            )}
          </div>
        )}
        
        {/* Table */}
        {!loading && filteredCustomers().length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th 
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors hover-lift-subtle"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Customer
                      <SortIcon column="name" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors hover-lift-subtle"
                    onClick={() => handleSort('phone')}
                  >
                    <div className="flex items-center gap-2">
                      Phone
                      <SortIcon column="phone" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors hover-lift-subtle"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center gap-2">
                      Location
                      <SortIcon column="location" />
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th 
                    className="text-right py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors hover-lift-subtle"
                    onClick={() => handleSort('orders')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Orders
                      <SortIcon column="orders" />
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers().map((customer) => {
                  const status = getCustomerStatus(customer)
                  const stats = getCustomerStats(customer)
                  
                  return (
                    <tr 
                      key={customer.id} 
                      className="border-b border-border/10 hover:bg-primary/5 transition-colors cursor-pointer group"
                      onClick={() => handleViewCustomer(customer.id)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {customer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{customer.name}</div>
                            {stats.lastPurchase && (
                              <div className="text-xs text-muted-foreground">
                                Last: {new Date(stats.lastPurchase).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{customer.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{customer.location || '—'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="font-medium text-foreground">{stats.totalOrders}</div>
                        <div className="text-xs text-muted-foreground">
                          {stats.totalSpent > 0 ? `KSh ${stats.totalSpent.toLocaleString()}` : '—'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary hover-lift-subtle"
                            onClick={(e) => { e.stopPropagation(); handleEditClick(customer) }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive hover-lift-subtle"
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(customer) }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold">Delete Customer?</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{customerToDelete.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setCustomerToDelete(null)}
                className="rounded-xl px-6"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDelete}
                className="rounded-xl px-6"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  ShoppingCart, 
  RefreshCw, 
  DollarSign, 
  Users, 
  Package,
  Archive,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useData } from "@/context/DataContext"
import { toast } from "sonner"
import SalesForm from "@/components/sales/SalesForm"
import SalesTable from "@/components/sales/SalesTable"

// Format KES currency
const formatKES = (amount) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 0
}).format(amount || 0)

export default function Sales() {
  const [customers, setCustomers] = useState([])
  const [stock, setStock] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)
  
  // ✅ NEW: State for sale management
  const [editingSale, setEditingSale] = useState(null)
  // eslint-disable-next-line no-unused-vars
  const [viewingSale, setViewingSale] = useState(null)
  const [saleToArchive, setSaleToArchive] = useState(null)
  const [saleToDelete, setSaleToDelete] = useState(null)
  const [showArchived, setShowArchived] = useState(false)

  const { 
    getCustomers, 
    getStock, 
    getSales, 
    createSale,
    updateSale,
    archiveSale,
    restoreSale,
    deleteSale,
    createCustomer  // ✅ Added for walk-in customer creation
  } = useData()

  // ✅ Load all data (Fast & Simple)
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [c, s, salesData] = await Promise.all([
        getCustomers(),
        getStock(),
        getSales(showArchived)
      ])
      setCustomers(c || [])
      setStock(s || [])
      setSales(salesData || [])
      setLastRefresh(new Date())
      console.log('✅ Loaded:', c?.length, 'customers,', s?.length, 'stock,', salesData?.length, 'sales')
    } catch (error) {
      console.error('Load error:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [getCustomers, getStock, getSales, showArchived])

  // Load on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // ✅ Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData()
    }, 60000)
    return () => clearInterval(interval)
  }, [loadData])

  // ✅ CREATE WALK-IN CUSTOMER (Option B: New record each time)
  const createWalkInCustomer = useCallback(async () => {
    try {
      // Count existing walk-in customers to generate unique number
      const walkInCount = customers.filter(c => c.name?.startsWith('Walk-in Customer')).length
      const walkInNumber = String(walkInCount + 1).padStart(3, '0')
      
      const walkInData = {
        name: `Walk-in Customer ${walkInNumber}`,
        phone: '0000000000',
        location: 'Walk-in Sale',
        is_archived: false
      }
      
      const newCustomer = await createCustomer(walkInData)
      console.log('✅ Walk-in customer created:', newCustomer)
      return newCustomer.id
    } catch (err) {
      console.error('❌ Failed to create walk-in customer:', err)
      throw err
    }
  }, [customers, createCustomer])

  // Handle sale submission (create or update) - WITH WALK-IN SUPPORT
  const handleSaleSubmit = async (saleData) => {
    try {
      let finalSaleData = { ...saleData }
      
      // ✅ If walk-in selected, create new walk-in customer first
      if (saleData.customer_id === 'walkin') {
        const walkInCustomerId = await createWalkInCustomer()
        finalSaleData.customer_id = walkInCustomerId
        finalSaleData.customer_name = 'Walk-in Customer'
      }
      
      if (editingSale) {
        // ✅ Update existing sale
        await updateSale(editingSale.id, finalSaleData)
        setEditingSale(null)
        toast.success('Sale updated!')
      } else {
        // ✅ Create new sale
        await createSale(finalSaleData)
        toast.success('Sale recorded!')
      }
      await loadData()
      return true
    } catch (err) {
      console.error('Sale submit error:', err)
      toast.error('Failed: ' + err.message)
      return false
    }
  }

  // ✅ Handle edit sale
  const handleEditSale = useCallback((sale) => {
    console.log('✏️ Edit sale:', sale)
    setEditingSale(sale)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ✅ Handle archive sale
  const handleArchiveSale = useCallback((sale) => {
    console.log('🗃️ Archive sale:', sale)
    setSaleToArchive(sale)
  }, [])

  // ✅ Confirm archive
  const confirmArchive = useCallback(async () => {
    if (!saleToArchive?.id) return
    try {
      await archiveSale(saleToArchive.id, 'User requested via UI')
      await loadData()
      toast.success('Sale archived! Record preserved but excluded from reports.')
    } catch (err) {
      toast.error('Failed to archive: ' + err.message)
    } finally {
      setSaleToArchive(null)
    }
  }, [saleToArchive, archiveSale, loadData])

  // ✅ Handle restore sale
  const handleRestoreSale = useCallback((sale) => {
    console.log('🔄 Restore sale:', sale)
    setSaleToArchive(sale)
  }, [])

  // ✅ Confirm restore
  const confirmRestore = useCallback(async () => {
    if (!saleToArchive?.id) return
    try {
      await restoreSale(saleToArchive.id)
      await loadData()
      toast.success('Sale restored! Now included in reports.')
    } catch (err) {
      toast.error('Failed to restore: ' + err.message)
    } finally {
      setSaleToArchive(null)
    }
  }, [saleToArchive, restoreSale, loadData])

  // ✅ Handle hard delete sale
  const handleDeleteSale = useCallback((sale) => {
    console.log('🗑️ Delete sale:', sale)
    setSaleToDelete(sale)
  }, [])

  // ✅ Confirm hard delete
  const confirmDelete = useCallback(async () => {
    if (!saleToDelete?.id) return
    try {
      await deleteSale(saleToDelete.id)
      await loadData()
      toast.success('Sale permanently deleted!')
    } catch (err) {
      toast.error('Failed to delete: ' + err.message)
    } finally {
      setSaleToDelete(null)
    }
  }, [saleToDelete, deleteSale, loadData])

  // ✅ Handle view sale details
  const handleViewSale = useCallback((sale) => {
    console.log('👁️ View sale:', sale)
    setViewingSale(sale)
  }, [])

  // Manual refresh
  const handleRefresh = async () => {
    await loadData()
    toast.success('Data refreshed!')
  }

  // Calculate today's stats (only active sales)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const activeSales = sales.filter(s => !s.is_archived)
  
  const todaysSales = activeSales.filter(sale => {
    const saleDate = new Date(sale.date)
    saleDate.setHours(0, 0, 0, 0)
    return saleDate.getTime() === today.getTime()
  })

  const todaysRevenue = todaysSales.reduce((sum, s) => sum + (s.total || 0), 0)
  const uniqueCustomersToday = new Set(todaysSales.map(s => s.customer_id)).size

  // Loading skeleton
  const StatSkeleton = () => (
    <div className="rounded-2xl bg-card p-4 shadow-soft animate-pulse">
      <div className="h-4 bg-muted rounded w-1/2 mb-2" />
      <div className="h-6 bg-muted rounded w-3/4" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center shadow-sm">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Sales</h1>
            <p className="text-sm text-muted-foreground">Record and track your sales</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Show Archived Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/30 bg-card/50">
            <Archive className="w-4 h-4 text-muted-foreground" />
            <label className="text-sm text-muted-foreground cursor-pointer select-none">
              Show Archived
            </label>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-4 h-4 rounded border-border/50 text-primary focus:ring-primary/20"
            />
          </div>
          
          {/* Refresh Button */}
          {lastRefresh && (
            <span className="text-xs text-muted-foreground hidden md:block">
              Updated: {lastRefresh.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="rounded-xl hover-lift-subtle"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            {/* Today's Revenue */}
            <div className="card hover-lift cursor-pointer" onClick={handleRefresh}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Today's Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gradient">{formatKES(todaysRevenue)}</div>
              <div className="text-xs text-muted-foreground mt-1">{todaysSales.length} transactions</div>
            </div>

            {/* Sales Count */}
            <div className="card hover-lift cursor-pointer" onClick={handleRefresh}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Sales Today</span>
                <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-success">{todaysSales.length}</div>
              <div className="text-xs text-muted-foreground mt-1">orders recorded</div>
            </div>

            {/* Unique Customers */}
            <div className="card hover-lift cursor-pointer" onClick={handleRefresh}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Customers Served</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">{uniqueCustomersToday}</div>
              <div className="text-xs text-muted-foreground mt-1">unique buyers</div>
            </div>
          </>
        )}
      </div>

      {/* Edit Sale Form */}
      {editingSale && (
        <div className="card p-6 hover-lift animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Edit Sale
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setEditingSale(null)}
              className="hover-lift-subtle"
            >
              Cancel
            </Button>
          </div>
          <SalesForm
            customers={customers}
            stock={stock}
            onSubmit={handleSaleSubmit}
            loading={loading}
            editingSale={editingSale}
          />
        </div>
      )}

      {/* Sales Form (for new sales) */}
      {!editingSale && (
        <div className="card p-6 hover-lift">
          <SalesForm
            customers={customers}
            stock={stock}
            onSubmit={handleSaleSubmit}
            loading={loading}
          />
        </div>
      )}

      {/* Sales Table */}
      <div className="card p-6 hover-lift">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {showArchived ? 'All Sales (Including Archived)' : 'Active Sales'} ({sales.length})
          </h2>
          {showArchived && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              Archived visible
            </span>
          )}
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">
              {showArchived ? 'No sales found' : 'No sales recorded yet'}
            </p>
            <p className="text-sm mb-4">
              {showArchived 
                ? 'Toggle off "Show Archived" to see active sales'
                : 'Record your first sale using the form above'}
            </p>
            {!showArchived && (
              <Button 
                onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary-gradient rounded-xl"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Record Your First Sale
              </Button>
            )}
          </div>
        ) : (
          <SalesTable 
            sales={sales} 
            loading={false}
            onEdit={handleEditSale}
            onArchive={handleArchiveSale}
            onRestore={handleRestoreSale}
            onDelete={handleDeleteSale}
            onView={handleViewSale}
          />
        )}
      </div>

      {/* Archive Confirmation Dialog */}
      {saleToArchive && !saleToArchive.is_archived && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Archive className="w-5 h-5 text-yellow-700" />
              </div>
              <h3 className="text-lg font-semibold">Archive Sale?</h3>
            </div>
            <div className="text-muted-foreground mb-6">
              Archiving this sale will:
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li>Hide it from active sales lists</li>
                <li>Exclude it from reports and calculations</li>
                <li>Preserve the record for reference</li>
                <li>Allow restoration at any time</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setSaleToArchive(null)}
                className="rounded-xl px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmArchive}
                className="rounded-xl px-6 bg-yellow-600 hover:bg-yellow-700"
              >
                Archive Sale
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      {saleToArchive && saleToArchive.is_archived && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-green-700" />
              </div>
              <h3 className="text-lg font-semibold">Restore Sale?</h3>
            </div>
            <div className="text-muted-foreground mb-6">
              Restoring this sale will:
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li>Show it in active sales lists</li>
                <li>Include it in reports and calculations</li>
                <li>Allow editing and new related actions</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setSaleToArchive(null)}
                className="rounded-xl px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmRestore}
                className="rounded-xl px-6 bg-green-600 hover:bg-green-700"
              >
                Restore Sale
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hard Delete Confirmation Dialog */}
      {saleToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-md w-full shadow-xl border-destructive/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-destructive">Permanently Delete?</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              ⚠️ This will <strong>permanently delete</strong> this sale record. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setSaleToDelete(null)}
                className="rounded-xl px-6"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDelete}
                className="rounded-xl px-6"
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
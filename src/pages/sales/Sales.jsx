"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  ShoppingCart, 
  RefreshCw, 
  DollarSign, 
  Users, 
  Package,
  Archive,
  Eye,
  Pencil,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useData } from "@/context/DataContext"
import { debugSupabase, startTiming, endTiming, addTimingEvent } from "@/lib/debug"
import { toast } from "sonner"
import SalesForm from "@/components/sales/SalesForm"
import SalesTable from "@/components/sales/SalesTable"

// Format KES currency
const formatKES = (amount) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 0
}).format(amount || 0)

// ✅ Helper: Get local date string for timezone-safe comparison
const getLocalDateStr = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ✅ ADD: Security utilities for sanitization
import { useSanitize } from '@/hooks/useSanitize'
import { logSecurityEvent, SECURITY_EVENTS } from '@/lib/securityLogger'

export default function Sales() {
  const [customers, setCustomers] = useState([])
  const [stock, setStock] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)
  
  // ✅ Sale management state
  const [editingSale, setEditingSale] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
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
    createCustomer
  } = useData()

  // ✅ ADD: Sanitization hook
  // eslint-disable-next-line no-unused-vars
  const { sanitize, sanitizeForm } = useSanitize()

  // ✅ Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      debugSupabase('🛒 Sales: Starting data load (getCustomers, getStock, getSales)')
      startTiming('sales-load')
      
      addTimingEvent('sales-load', 'promise-all-start')
      const [c, s, salesData] = await Promise.all([
        getCustomers(),
        getStock(),
        getSales(showArchived)
      ])
      addTimingEvent('sales-load', 'promise-all-complete')
      
      debugSupabase(`✅ Sales data loaded: ${c?.length || 0} customers, ${s?.length || 0} stock items, ${salesData?.length || 0} sales`)
      
      setCustomers(c || [])
      setStock(s || [])
      setSales(salesData || [])
      setLastRefresh(new Date())
      endTiming('sales-load')
    } catch (error) {
      debugSupabase(`❌ Sales load error: ${error.message}`)
      console.error('Load error:', error)
      toast.error('Failed to load data')
      endTiming('sales-load')
    } finally {
      setLoading(false)
    }
  }, [getCustomers, getStock, getSales, showArchived])

  // Load on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => loadData(), 60000)
    return () => clearInterval(interval)
  }, [loadData])

  // ✅ CREATE WALK-IN CUSTOMER
  const createWalkInCustomer = useCallback(async () => {
    try {
      const walkInCount = customers.filter(c => c.name?.startsWith('Walk-in Customer')).length
      const walkInNumber = String(walkInCount + 1).padStart(3, '0')
      
      const walkInData = {
        name: `Walk-in Customer ${walkInNumber}`,
        phone: '0000000000',
        location: 'Walk-in Sale',
        is_archived: false
      }
      
      const newCustomer = await createCustomer(walkInData)
      return newCustomer.id
    } catch (err) {
      console.error('❌ Failed to create walk-in customer:', err)
      throw err
    }
  }, [customers, createCustomer])

  // ✅ UPDATED: Handle sale submission with sanitization
  const handleSaleSubmit = async (saleData) => {
    try {
      let finalSaleData = { ...saleData }
      
      // ✅ Sanitize text fields (keep numbers as numbers)
      finalSaleData = {
        ...sanitizeForm({
          customer_name: saleData.customer_name,
          product_name: saleData.product_name,
          notes: saleData.notes
        }),
        // Keep numeric fields as numbers
        customer_id: saleData.customer_id,
        product_id: saleData.product_id,
        quantity_sold: parseInt(saleData.quantity_sold) || 0,
        price: parseFloat(saleData.price) || 0,
        total: parseFloat(saleData.total) || 0,
        date: saleData.date
      }
      
      // Handle walk-in customer
      if (saleData.customer_id === 'walkin') {
        const walkInCustomerId = await createWalkInCustomer()
        finalSaleData.customer_id = walkInCustomerId
        finalSaleData.customer_name = 'Walk-in Customer'
      }
      
      if (editingSale) {
        await updateSale(editingSale.id, finalSaleData)
        
        // ✅ Log security event
        await logSecurityEvent(SECURITY_EVENTS.DATA_UPDATE, {
          table: 'sales',
          recordId: editingSale.id,
          customer: finalSaleData.customer_name,
          total: finalSaleData.total
        })
        
        setEditingSale(null)
        setShowEditModal(false)
        toast.success('Sale updated!')
      } else {
        const newSale = await createSale(finalSaleData)
        
        // ✅ Log security event
        await logSecurityEvent(SECURITY_EVENTS.DATA_CREATE, {
          table: 'sales',
          recordId: newSale?.id,
          customer: finalSaleData.customer_name,
          total: finalSaleData.total
        })
        
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

  // ✅ Open edit modal (instead of scrolling)
  const openEditModal = useCallback((sale) => {
    setEditingSale(sale)
    setShowEditModal(true)
  }, [])

  // ✅ Close edit modal
  const closeEditModal = useCallback(() => {
    setEditingSale(null)
    setShowEditModal(false)
  }, [])

  // Archive/Restore/Delete handlers
  const handleArchiveSale = useCallback((sale) => setSaleToArchive(sale), [])
  
  const confirmArchive = useCallback(async () => {
    if (!saleToArchive?.id) return
    try {
      await archiveSale(saleToArchive.id, 'User requested via UI')
      
      // ✅ Log security event
      await logSecurityEvent(SECURITY_EVENTS.DATA_UPDATE, {
        table: 'sales',
        recordId: saleToArchive.id,
        action: 'archived',
        customer: saleToArchive.customer_name
      })
      
      await loadData()
      toast.success('Sale archived!')
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setSaleToArchive(null)
    }
  }, [saleToArchive, archiveSale, loadData])

  const handleRestoreSale = useCallback((sale) => setSaleToArchive(sale), [])
  
  const confirmRestore = useCallback(async () => {
    if (!saleToArchive?.id) return
    try {
      await restoreSale(saleToArchive.id)
      
      // ✅ Log security event
      await logSecurityEvent(SECURITY_EVENTS.DATA_UPDATE, {
        table: 'sales',
        recordId: saleToArchive.id,
        action: 'restored',
        customer: saleToArchive.customer_name
      })
      
      await loadData()
      toast.success('Sale restored!')
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setSaleToArchive(null)
    }
  }, [saleToArchive, restoreSale, loadData])

  const handleDeleteSale = useCallback((sale) => setSaleToDelete(sale), [])
  
  const confirmDelete = useCallback(async () => {
    if (!saleToDelete?.id) return
    try {
      await deleteSale(saleToDelete.id)
      
      // ✅ Log security event
      await logSecurityEvent(SECURITY_EVENTS.DATA_DELETE, {
        table: 'sales',
        recordId: saleToDelete.id,
        customer: saleToDelete.customer_name
      })
      
      await loadData()
      toast.success('Sale permanently deleted!')
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setSaleToDelete(null)
    }
  }, [saleToDelete, deleteSale, loadData])

  const handleViewSale = useCallback((sale) => setViewingSale(sale), [])
  const handleRefresh = async () => { await loadData(); toast.success('Data refreshed!') }

  // ✅ Calculate today's stats (timezone-safe)
  const todayStr = getLocalDateStr(new Date())
  
  const activeSales = sales.filter(s => !s.is_archived)
  const todaysSales = activeSales.filter(sale => getLocalDateStr(sale.date) === todayStr)
  const todaysRevenue = todaysSales.reduce((sum, s) => sum + (s.total || 0), 0)
  const uniqueCustomersToday = new Set(todaysSales.map(s => s.customer_id)).size

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
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/30 bg-card/50">
            <Archive className="w-4 h-4 text-muted-foreground" />
            <label className="text-sm text-muted-foreground cursor-pointer select-none">Show Archived</label>
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="w-4 h-4 rounded border-border/50 text-primary focus:ring-primary/20" />
          </div>
          {lastRefresh && <span className="text-xs text-muted-foreground hidden md:block">Updated: {lastRefresh.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</span>}
          <Button onClick={handleRefresh} variant="outline" className="rounded-xl hover-lift-subtle" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
        ) : (
          <>
            <div className="card hover-lift cursor-pointer" onClick={handleRefresh}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Today's Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><DollarSign className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-bold text-gradient">{formatKES(todaysRevenue)}</div>
              <div className="text-xs text-muted-foreground mt-1">{todaysSales.length} transactions</div>
            </div>
            <div className="card hover-lift cursor-pointer" onClick={handleRefresh}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Sales Today</span>
                <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center"><ShoppingCart className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-bold text-success">{todaysSales.length}</div>
              <div className="text-xs text-muted-foreground mt-1">orders recorded</div>
            </div>
            <div className="card hover-lift cursor-pointer" onClick={handleRefresh}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Customers Served</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Users className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-bold text-primary">{uniqueCustomersToday}</div>
              <div className="text-xs text-muted-foreground mt-1">unique buyers</div>
            </div>
          </>
        )}
      </div>

      {/* ✅ NEW: Edit Sale Modal Popup */}
      {showEditModal && editingSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-2xl w-full shadow-xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/20">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Pencil className="w-5 h-5 text-primary" />Edit Sale
              </h2>
              <Button variant="ghost" size="sm" onClick={closeEditModal} className="hover-lift-subtle">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <SalesForm
              customers={customers}
              stock={stock}
              onSubmit={handleSaleSubmit}
              loading={loading}
              editingSale={editingSale}
              onCancel={closeEditModal}
            />
          </div>
        </div>
      )}

      {/* Sales Form (for new sales only) */}
      {!editingSale && !showEditModal && (
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
          <h2 className="text-lg font-semibold">{showArchived ? 'All Sales (Including Archived)' : 'Active Sales'} ({sales.length})</h2>
          {showArchived && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">Archived visible</span>}
        </div>
        
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : sales.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center"><ShoppingCart className="w-8 h-8 text-muted-foreground" /></div>
            <p className="text-lg font-medium mb-2">{showArchived ? 'No sales found' : 'No sales recorded yet'}</p>
            <p className="text-sm mb-4">{showArchived ? 'Toggle off "Show Archived" to see active sales' : 'Record your first sale using the form above'}</p>
            {!showArchived && <Button onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary-gradient rounded-xl"><ShoppingCart className="w-4 h-4 mr-2" />Record Your First Sale</Button>}
          </div>
        ) : (
          <SalesTable 
            sales={sales} 
            loading={false}
            onEdit={openEditModal}
            onArchive={handleArchiveSale}
            onRestore={handleRestoreSale}
            onDelete={handleDeleteSale}
            onView={handleViewSale}
          />
        )}
      </div>

      {/* Archive/Restore/Delete Dialogs (unchanged) */}
      {saleToArchive && !saleToArchive.is_archived && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center"><Archive className="w-5 h-5 text-yellow-700" /></div>
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
              <Button variant="outline" onClick={() => setSaleToArchive(null)} className="rounded-xl px-6">Cancel</Button>
              <Button onClick={confirmArchive} className="rounded-xl px-6 bg-yellow-600 hover:bg-yellow-700">Archive Sale</Button>
            </div>
          </div>
        </div>
      )}

      {saleToArchive && saleToArchive.is_archived && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><RotateCcw className="w-5 h-5 text-green-700" /></div>
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
              <Button variant="outline" onClick={() => setSaleToArchive(null)} className="rounded-xl px-6">Cancel</Button>
              <Button onClick={confirmRestore} className="rounded-xl px-6 bg-green-600 hover:bg-green-700">Restore Sale</Button>
            </div>
          </div>
        </div>
      )}

      {saleToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-md w-full shadow-xl border-destructive/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
              <h3 className="text-lg font-semibold text-destructive">Permanently Delete?</h3>
            </div>
            <p className="text-muted-foreground mb-6">⚠️ This will <strong>permanently delete</strong> this sale record. This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSaleToDelete(null)} className="rounded-xl px-6">Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} className="rounded-xl px-6">Delete Permanently</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
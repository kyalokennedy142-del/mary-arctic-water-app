"use client"

import { useState, useEffect, useCallback } from "react"
import { ShoppingCart, RefreshCw, DollarSign, Users, Package } from "lucide-react"
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

  const { getCustomers, getStock, getSales, createSale } = useData()

  // ✅ Load all data (Fast & Simple)
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [c, s, salesData] = await Promise.all([
        getCustomers(),
        getStock(),
        getSales()
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
  }, [getCustomers, getStock, getSales])

  // Load on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // ✅ Auto-refresh every 60 seconds (optional - comment out if not needed)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only auto-refresh if user hasn't interacted recently
      loadData()
    }, 60000)
    return () => clearInterval(interval)
  }, [loadData])

  // Handle sale submission
  const handleSaleSubmit = async (saleData) => {
    await createSale(saleData)
    await loadData() // Reload all data after sale
    toast.success('Sale recorded!')
  }

  // Manual refresh
  const handleRefresh = async () => {
    await loadData()
    toast.success('Data refreshed!')
  }

  // Calculate today's stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaysSales = sales.filter(sale => {
    const saleDate = new Date(sale.date)
    saleDate.setHours(0, 0, 0, 0)
    return saleDate.getTime() === today.getTime()
  })

  const todaysRevenue = todaysSales.reduce((sum, s) => sum + (s.total || 0), 0)
  const uniqueCustomersToday = new Set(todaysSales.map(s => s.customer_id)).size

  // Loading skeleton for stats
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
        
        {/* Refresh Button + Last Updated */}
        <div className="flex items-center gap-3">
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

      {/* ✅ Stats Cards - Today's Performance */}
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

      {/* ✅ Sales Form - Improved Field Visibility */}
      <div className="card p-6 hover-lift">
        <SalesForm
          customers={customers}
          stock={stock}
          onSubmit={handleSaleSubmit}
          loading={loading}
        />
      </div>

      {/* ✅ Sales Table */}
      <div className="card p-6 hover-lift">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sales.length === 0 ? (
          // Empty State with Guidance
          <div className="text-center text-muted-foreground py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">No sales recorded yet</p>
            <p className="text-sm mb-4">Record your first sale using the form above</p>
            <Button 
              onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary-gradient rounded-xl"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Record Your First Sale
            </Button>
          </div>
        ) : (
          <SalesTable sales={sales} loading={false} />
        )}
      </div>
    </div>
  )
}
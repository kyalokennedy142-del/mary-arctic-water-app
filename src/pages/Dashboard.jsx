"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useData } from '@/context/DataContext'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

// Format KES currency
const formatKES = (amount) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 0
}).format(amount || 0)

// Simple Line Chart Component for Daily Growth
const DailyGrowthChart = ({ salesData }) => {
  // Get last 7 days of sales
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      days.push(date)
    }
    return days
  }

  const days = getLast7Days()
  const dailyRevenue = days.map(day => {
    const daySales = salesData.filter(sale => {
      const saleDate = new Date(sale.date)
      saleDate.setHours(0, 0, 0, 0)
      return saleDate.getTime() === day.getTime()
    })
    return daySales.reduce((sum, s) => sum + (s.total || 0), 0)
  })

  const maxValue = Math.max(...dailyRevenue, 1000)
  const chartHeight = 120
  const chartWidth = 280
  const padding = 30

  // Generate path points for line chart
  const points = dailyRevenue.map((value, index) => {
    const x = padding + (index * (chartWidth - padding * 2) / (dailyRevenue.length - 1))
    const y = chartHeight - padding - (value / maxValue) * (chartHeight - padding * 2)
    return `${x},${y}`
  }).join(' ')

  // Generate area fill points
  const areaPoints = `
    ${padding},${chartHeight - padding} 
    ${points} 
    ${chartWidth - padding},${chartHeight - padding}
  `.trim()

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding}
            y1={chartHeight - padding - ratio * (chartHeight - padding * 2)}
            x2={chartWidth - padding}
            y2={chartHeight - padding - ratio * (chartHeight - padding * 2)}
            stroke="var(--color-border)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}
        
        {/* Area fill under line */}
        <polygon
          points={areaPoints}
          fill="url(#gradient)"
          opacity="0.2"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00a8ff" />
            <stop offset="100%" stopColor="#00a8ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#00a8ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {dailyRevenue.map((value, index) => {
          const x = padding + (index * (chartWidth - padding * 2) / (dailyRevenue.length - 1))
          const y = chartHeight - padding - (value / maxValue) * (chartHeight - padding * 2)
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#00a8ff"
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-200 hover:r-6"
            />
          )
        })}
        
        {/* X-axis labels */}
        {days.map((day, index) => {
          const x = padding + (index * (chartWidth - padding * 2) / (days.length - 1))
          return (
            <text
              key={index}
              x={x}
              y={chartHeight - 8}
              textAnchor="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {day.toLocaleDateString('en-KE', { weekday: 'short' })}
            </text>
          )
        })}
      </svg>
      
      {/* Legend */}
      <div className="flex justify-between text-xs text-muted-foreground px-2">
        <span>7 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    customers: [],
    stock: [],
    sales: []
  })

  const { getCustomers, getStock, getSales } = useData()

  // ✅ Load all dashboard data (Fast & Simple)
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const [customers, stock, sales] = await Promise.all([
        getCustomers(),
        getStock(),
        getSales()
      ])
      setData({
        customers: customers || [],
        stock: stock || [],
        sales: sales || []
      })
    } catch (error) {
      console.error('Dashboard load error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [getCustomers, getStock, getSales])

  // Load on mount
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Manual refresh
  const handleRefresh = async () => {
    await loadDashboardData()
    toast.success('Dashboard updated!')
  }

  // Calculate metrics
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaysSales = data.sales.filter(sale => {
    const saleDate = new Date(sale.date)
    saleDate.setHours(0, 0, 0, 0)
    return saleDate.getTime() === today.getTime()
  })

  const yesterdaysSales = data.sales.filter(sale => {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const saleDate = new Date(sale.date)
    saleDate.setHours(0, 0, 0, 0)
    return saleDate.getTime() === yesterday.getTime()
  })

  const todaysRevenue = todaysSales.reduce((sum, s) => sum + (s.total || 0), 0)
  const yesterdaysRevenue = yesterdaysSales.reduce((sum, s) => sum + (s.total || 0), 0)
  const revenueChange = yesterdaysRevenue > 0 
    ? ((todaysRevenue - yesterdaysRevenue) / yesterdaysRevenue) * 100 
    : 0

  const lowStockItems = data.stock.filter(item => item.quantity <= 10)
  const criticalStock = data.stock.filter(item => item.quantity <= 5)
  const healthyStock = data.stock.filter(item => item.quantity > 10).length

  // Customer segmentation
  const getCustomerStatus = (customer) => {
    const customerSales = data.sales.filter(s => s.customer_id === customer.id)
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
  }

  const customerSegments = {
    new: data.customers.filter(c => getCustomerStatus(c) === 'new').length,
    active: data.customers.filter(c => getCustomerStatus(c) === 'active').length,
    atRisk: data.customers.filter(c => getCustomerStatus(c) === 'at-risk').length,
    dormant: data.customers.filter(c => getCustomerStatus(c) === 'dormant').length
  }

  // Stock status counts
  const stockStatus = {
    healthy: healthyStock,
    low: data.stock.filter(item => item.quantity > 5 && item.quantity <= 10).length,
    critical: criticalStock.length
  }

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Loading your business overview...</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-card p-6 shadow-soft animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-4" />
              <div className="h-8 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome to AquaBiz — Here's your business overview</p>
          </div>
        </div>
        
        <Button onClick={handleRefresh} variant="outline" className="rounded-xl hover-lift-subtle">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* SECTION 1: Key Metrics (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Today's Sales */}
        <div className="card hover-lift">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Today's Sales</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gradient">{formatKES(todaysRevenue)}</div>
          <div className="text-sm text-muted-foreground mt-1">{todaysSales.length} transactions</div>
          {revenueChange !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {revenueChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(revenueChange).toFixed(1)}% vs yesterday
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="card hover-lift cursor-pointer" onClick={() => navigate('/stock')}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Low Stock</span>
            <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-warning">{criticalStock.length}</div>
          <div className="text-sm text-muted-foreground mt-1">items need restock</div>
          <div className="text-xs text-muted-foreground mt-1">{lowStockItems.length} total low items</div>
        </div>

        {/* Active Customers */}
        <div className="card hover-lift cursor-pointer" onClick={() => navigate('/customers')}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Active Customers</span>
            <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-success">{customerSegments.active}</div>
          <div className="text-sm text-muted-foreground mt-1">purchased in 30 days</div>
          <div className="text-xs text-muted-foreground mt-1">{customerSegments.new} new this week</div>
        </div>
      </div>

      {/* SECTION 2: Low Stock Alerts (Grouped by Category) */}
      {criticalStock.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Low Stock Alerts
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/stock')}
              className="text-primary hover:text-primary hover-lift-subtle"
            >
              View All Stock <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {/* Group low stock items by category */}
          {(() => {
            const groupedByCategory = criticalStock.reduce((acc, item) => {
              const category = item.category || 'Uncategorized'
              if (!acc[category]) acc[category] = []
              acc[category].push(item)
              return acc
            }, {})

            return Object.entries(groupedByCategory).map(([category, items]) => (
              <div key={category} className="mb-6 last:mb-0">
                {/* Category Header */}
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {category.replace(/-/g, ' ').toUpperCase()}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                    {items.length} item{items.length > 1 ? 's' : ''}
                  </span>
                </h3>
                
                {/* Items Grid for this Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {items.map(item => (
                    <div 
                      key={item.id} 
                      className={`rounded-xl p-4 border transition-all duration-300 hover-lift-subtle ${
                        item.quantity <= 3 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{item.product_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.quantity <= 3 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.quantity} left
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatKES(item.selling_price)} / unit
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          })()}
          
          {/* Summary Footer */}
          <div className="pt-4 border-t border-border/20">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold text-foreground">{data.stock.length}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Healthy:</span>
                <span className="font-semibold text-green-600">{healthyStock}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">Low:</span>
                <span className="font-semibold text-yellow-600">{stockStatus.low}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Critical:</span>
                <span className="font-semibold text-red-600">{stockStatus.critical}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Customer Segments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Customer Segments
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/customers')}
            className="text-primary hover:text-primary hover-lift-subtle"
          >
            View All Customers <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl p-4 bg-blue-50 border border-blue-200 hover-lift-subtle">
            <div className="text-2xl font-bold text-blue-700">{customerSegments.new}</div>
            <div className="text-sm text-blue-600 mt-1">🔵 New</div>
            <div className="text-xs text-blue-500 mt-1">Last 7 days</div>
          </div>
          <div className="rounded-xl p-4 bg-green-50 border border-green-200 hover-lift-subtle">
            <div className="text-2xl font-bold text-green-700">{customerSegments.active}</div>
            <div className="text-sm text-green-600 mt-1">🟢 Active</div>
            <div className="text-xs text-green-500 mt-1">Last 30 days</div>
          </div>
          <div className="rounded-xl p-4 bg-yellow-50 border border-yellow-200 hover-lift-subtle">
            <div className="text-2xl font-bold text-yellow-700">{customerSegments.atRisk}</div>
            <div className="text-sm text-yellow-600 mt-1">🟡 At Risk</div>
            <div className="text-xs text-yellow-500 mt-1">30-60 days</div>
          </div>
          <div className="rounded-xl p-4 bg-red-50 border border-red-200 hover-lift-subtle">
            <div className="text-2xl font-bold text-red-700">{customerSegments.dormant}</div>
            <div className="text-sm text-red-600 mt-1">🔴 Dormant</div>
            <div className="text-xs text-red-500 mt-1">60+ days</div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Daily Growth Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Daily Sales Growth
          </h2>
          {revenueChange !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${
              revenueChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(revenueChange).toFixed(1)}% vs yesterday
            </div>
          )}
        </div>
        
        <DailyGrowthChart salesData={data.sales} />
        
        <div className="mt-4 pt-4 border-t border-border/20">
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-muted-foreground">This Week:</span>
              <span className="font-semibold text-foreground ml-2">
                {formatKES(data.sales.filter(s => {
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return new Date(s.date) >= weekAgo
                }).reduce((sum, s) => sum + (s.total || 0), 0))}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg/Day:</span>
              <span className="font-semibold text-foreground ml-2">
                {formatKES(todaysSales.reduce((sum, s) => sum + (s.total || 0), 0) / (todaysSales.length || 1))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Stock Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Stock Overview
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/stock')}
            className="rounded-xl hover-lift-subtle"
          >
            Manage Stock <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-4 bg-green-50 border border-green-200 text-center hover-lift-subtle">
            <div className="text-2xl font-bold text-green-700">{stockStatus.healthy}</div>
            <div className="text-sm text-green-600 mt-1">🟢 Healthy</div>
          </div>
          <div className="rounded-xl p-4 bg-yellow-50 border border-yellow-200 text-center hover-lift-subtle">
            <div className="text-2xl font-bold text-yellow-700">{stockStatus.low}</div>
            <div className="text-sm text-yellow-600 mt-1">🟡 Low</div>
          </div>
          <div className="rounded-xl p-4 bg-red-50 border border-red-200 text-center hover-lift-subtle">
            <div className="text-2xl font-bold text-red-700">{stockStatus.critical}</div>
            <div className="text-sm text-red-600 mt-1">🔴 Critical</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          View and manage full inventory in the Stock page
        </p>
      </div>
    </div>
  )
}
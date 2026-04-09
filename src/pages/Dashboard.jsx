/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useData } from '@/context/DataContext'
import { debugSupabase, startTiming, endTiming, addTimingEvent } from '@/lib/debug'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

// Format KES currency
const formatKES = (amount) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 0
}).format(amount || 0)

// ✅ Helper: Get local date string in YYYY-MM-DD format (timezone-safe)
const getLocalDateStr = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ✅ Helper: Get date range for predefined periods or custom range (local timezone)
const getDateRange = (period, customStartDate = null, customEndDate = null) => {
  const today = new Date()
  const todayStr = getLocalDateStr(today)
  
  // ✅ If custom date range provided, return that range
  if (period === 'custom-range' && customStartDate && customEndDate) {
    // Ensure start date is not after end date
    if (customStartDate <= customEndDate) {
      return { start: customStartDate, end: customEndDate }
    }
    // If start is after end, swap them
    return { start: customEndDate, end: customStartDate }
  }
  
  switch (period) {
    case 'today':
      return { start: todayStr, end: todayStr }
    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = getLocalDateStr(yesterday)
      return { start: yesterdayStr, end: yesterdayStr }
    }
    case 'last7days': {
      const start = new Date(today)
      start.setDate(start.getDate() - 6)
      return { start: getLocalDateStr(start), end: todayStr }
    }
    case 'last30days': {
      const start = new Date(today)
      start.setDate(start.getDate() - 29)
      return { start: getLocalDateStr(start), end: todayStr }
    }
    case 'lastmonth': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return { start: getLocalDateStr(start), end: getLocalDateStr(end) }
    }
    case 'thismonth': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      return { start: getLocalDateStr(start), end: todayStr }
    }
    default:
      return { start: todayStr, end: todayStr }
  }
}

// Simple Line Chart Component for Daily Growth
const DailyGrowthChart = ({ salesData, activeCustomers }) => {
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(getLocalDateStr(date))
    }
    return days
  }

  const days = getLast7Days()
  const activeCustomerIds = new Set(activeCustomers.map(c => c.id))
  
  const dailyRevenue = days.map(dayStr => {
    const daySales = salesData.filter(sale => {
      const saleDateStr = getLocalDateStr(sale.date)
      return saleDateStr === dayStr && activeCustomerIds.has(sale.customer_id)
    })
    return daySales.reduce((sum, s) => sum + (s.total || 0), 0)
  })

  const maxValue = Math.max(...dailyRevenue, 1000)
  const chartHeight = 120
  const chartWidth = 280
  const padding = 30

  const points = dailyRevenue.map((value, index) => {
    const x = padding + (index * (chartWidth - padding * 2) / (dailyRevenue.length - 1))
    const y = chartHeight - padding - (value / maxValue) * (chartHeight - padding * 2)
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `
    ${padding},${chartHeight - padding} 
    ${points} 
    ${chartWidth - padding},${chartHeight - padding}
  `.trim()

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32">
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
        
        <polygon points={areaPoints} fill="url(#gradient)" opacity="0.2" />
        
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00a8ff" />
            <stop offset="100%" stopColor="#00a8ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <polyline
          points={points}
          fill="none"
          stroke="#00a8ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
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
        
        {days.map((dayStr, index) => {
          const x = padding + (index * (chartWidth - padding * 2) / (days.length - 1))
          const date = new Date(dayStr)
          return (
            <text
              key={index}
              x={x}
              y={chartHeight - 8}
              textAnchor="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {date.toLocaleDateString('en-KE', { weekday: 'short' })}
            </text>
          )
        })}
      </svg>
      
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
  
  // ✅ UPDATED: Period selection state with custom date range support
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [selectedStartDate, setSelectedStartDate] = useState('') // ✅ Start date for date range picker
  const [selectedEndDate, setSelectedEndDate] = useState('') // ✅ End date for date range picker
  const [showDatePicker, setShowDatePicker] = useState(false)

  const { getCustomers, getStock, getSales } = useData()

  // ✅ Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      debugSupabase('📊 Dashboard: Starting data load (getCustomers, getStock, getSales)')
      startTiming('dashboard-load')
      
      addTimingEvent('dashboard-load', 'promise-all-start')
      const [customers, stock, sales] = await Promise.all([
        getCustomers(),
        getStock(),
        getSales()
      ])
      addTimingEvent('dashboard-load', 'promise-all-complete')
      
      debugSupabase(`✅ Dashboard data loaded: ${customers?.length || 0} customers, ${stock?.length || 0} stock items, ${sales?.length || 0} sales`)
      
      setData({
        customers: customers || [],
        stock: stock || [],
        sales: sales || []
      })
      endTiming('dashboard-load')
    } catch (error) {
      debugSupabase(`❌ Dashboard load error: ${error.message}`)
      console.error('Dashboard load error:', error)
      toast.error('Failed to load dashboard data')
      endTiming('dashboard-load')
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

  // ✅ Filter to only active customers
  const activeCustomers = data.customers.filter(c => !c.is_archived)
  const activeCustomerIds = new Set(activeCustomers.map(c => c.id))

  // ✅ UPDATED: Get current date range (supports custom range)
  const currentDateRange = useMemo(() => {
    return getDateRange(selectedPeriod, selectedStartDate, selectedEndDate)
  }, [selectedPeriod, selectedStartDate, selectedEndDate])

  // ✅ Filter sales by date range (timezone-safe)
  const filteredSales = useMemo(() => {
    if (!currentDateRange) return []
    return data.sales.filter(sale => {
      const saleDateStr = getLocalDateStr(sale.date)
      return (
        saleDateStr >= currentDateRange.start &&
        saleDateStr <= currentDateRange.end &&
        activeCustomerIds.has(sale.customer_id)
      )
    })
  }, [data.sales, currentDateRange, activeCustomerIds])

  // ✅ Calculate metrics for selected period
  const periodRevenue = filteredSales.reduce((sum, s) => sum + (s.total || 0), 0)
  const periodTransactions = filteredSales.length

  // ✅ Calculate comparison metrics (previous period)
  const getPreviousPeriodRange = () => {
    if (!currentDateRange) return null
    const { start, end } = currentDateRange
    const startNum = parseInt(start.replace(/-/g, ''))
    const endNum = parseInt(end.replace(/-/g, ''))
    const daysDiff = Math.floor((endNum - startNum) / 10000 * 30 + (endNum % 10000 - startNum % 10000) / 100)
    
    const prevEnd = new Date(start)
    prevEnd.setDate(prevEnd.getDate() - 1)
    const prevStart = new Date(prevEnd)
    prevStart.setDate(prevStart.getDate() - daysDiff + 1)
    
    return {
      start: getLocalDateStr(prevStart),
      end: getLocalDateStr(prevEnd)
    }
  }

  const prevPeriodRange = getPreviousPeriodRange()
  const prevPeriodRevenue = prevPeriodRange 
    ? data.sales.filter(sale => {
        const saleDateStr = getLocalDateStr(sale.date)
        return (
          saleDateStr >= prevPeriodRange.start &&
          saleDateStr <= prevPeriodRange.end &&
          activeCustomerIds.has(sale.customer_id)
        )
      }).reduce((sum, s) => sum + (s.total || 0), 0)
    : 0

  const periodGrowth = prevPeriodRevenue > 0 
    ? ((periodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100 
    : 0

  // ✅ Today's sales (for quick reference card)
  const todayStr = getLocalDateStr(new Date())
  const todaysSales = data.sales.filter(sale => {
    const saleDateStr = getLocalDateStr(sale.date)
    return saleDateStr === todayStr && activeCustomerIds.has(sale.customer_id)
  })
  const todaysRevenue = todaysSales.reduce((sum, s) => sum + (s.total || 0), 0)

  // ✅ This week's sales (for quick reference card)
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const startOfWeekStr = getLocalDateStr(startOfWeek)
  
  const weeklySales = data.sales.filter(sale => {
    const saleDateStr = getLocalDateStr(sale.date)
    return saleDateStr >= startOfWeekStr && saleDateStr <= todayStr && activeCustomerIds.has(sale.customer_id)
  })
  const weeklyRevenue = weeklySales.reduce((sum, s) => sum + (s.total || 0), 0)

  const lowStockItems = data.stock.filter(item => item.quantity <= 10)
  const criticalStock = data.stock.filter(item => item.quantity <= 5)
  const healthyStock = data.stock.filter(item => item.quantity > 10).length

  // Customer segmentation
  const getCustomerStatus = (customer) => {
    if (customer.is_archived) return 'archived'
    
    const customerSales = data.sales.filter(s => 
      s.customer_id === customer.id && activeCustomerIds.has(customer.id)
    )
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
    new: activeCustomers.filter(c => getCustomerStatus(c) === 'new').length,
    active: activeCustomers.filter(c => getCustomerStatus(c) === 'active').length,
    atRisk: activeCustomers.filter(c => getCustomerStatus(c) === 'at-risk').length,
    dormant: activeCustomers.filter(c => getCustomerStatus(c) === 'dormant').length
  }

  // Stock status counts
  const stockStatus = {
    healthy: healthyStock,
    low: data.stock.filter(item => item.quantity > 5 && item.quantity <= 10).length,
    critical: criticalStock.length
  }

  // ✅ Period button component
  const PeriodButton = ({ period, label }) => (
    <button
      onClick={() => {
        setSelectedPeriod(period)
        setSelectedStartDate('') // Clear dates when switching periods
        setSelectedEndDate('')
        setShowDatePicker(false)
      }}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        selectedPeriod === period && !showDatePicker
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
      }`}
    >
      {label}
    </button>
  )

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
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
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ✅ UPDATED: Period Selector with Custom Date Range Picker */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">View:</span>
          
          {/* Predefined Period Buttons */}
          <PeriodButton period="today" label="Today" />
          <PeriodButton period="yesterday" label="Yesterday" />
          <PeriodButton period="last7days" label="Last 7 Days" />
          <PeriodButton period="last30days" label="Last 30 Days" />
          <PeriodButton period="lastmonth" label="Last Month" />
          
          {/* ✅ Custom Date Range Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDatePicker(!showDatePicker)
                if (!showDatePicker) {
                  setSelectedPeriod('custom-range')
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                showDatePicker || selectedPeriod === 'custom-range'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {selectedStartDate && selectedEndDate
                ? `${selectedStartDate} → ${selectedEndDate}`
                : 'Date Range'}
            </button>
            
            {/* Date Range Picker Dropdown */}
            {showDatePicker && (
              <div className="absolute top-full right-0 mt-2 p-4 bg-card border border-border/30 rounded-xl shadow-lg z-10 min-w-80">
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-foreground">Select Date Range</h3>
                  
                  {/* Start Date */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <input
                      type="date"
                      value={selectedStartDate}
                      onChange={(e) => {
                        setSelectedStartDate(e.target.value)
                        setSelectedPeriod('custom-range')
                      }}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  
                  {/* End Date */}
                  <div>
                    <Label className="text-xs text-muted-foreground">End Date</Label>
                    <input
                      type="date"
                      value={selectedEndDate}
                      onChange={(e) => {
                        setSelectedEndDate(e.target.value)
                        setSelectedPeriod('custom-range')
                      }}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  
                  {/* Info */}
                  {selectedStartDate && selectedEndDate && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                      {(() => {
                        const start = new Date(selectedStartDate)
                        const end = new Date(selectedEndDate)
                        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
                        return `${days} day${days > 1 ? 's' : ''}`
                      })()}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowDatePicker(false)
                        setSelectedStartDate('')
                        setSelectedEndDate('')
                        setSelectedPeriod('today')
                      }}
                      className="flex-1 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (selectedStartDate && selectedEndDate) {
                          setShowDatePicker(false)
                        } else {
                          toast.error('Please select both start and end dates')
                        }
                      }}
                      className="flex-1 text-xs btn-primary-gradient"
                      disabled={!selectedStartDate || !selectedEndDate}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Current Period Label */}
          <span className="ml-auto text-xs text-muted-foreground">
            {selectedPeriod === 'custom-range' && selectedStartDate && selectedEndDate
              ? `${selectedStartDate} → ${selectedEndDate}`
              : selectedPeriod === 'today' ? 'Today' :
                selectedPeriod === 'yesterday' ? 'Yesterday' :
                selectedPeriod === 'last7days' ? 'Last 7 Days' :
                selectedPeriod === 'last30days' ? 'Last 30 Days' :
                selectedPeriod === 'lastmonth' ? 'Last Month' : ''}
          </span>
        </div>
      </div>

      {/* ✅ SECTION 1: Key Metrics - Selected Period + Quick Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* ✅ Selected Period Revenue (Main Metric) */}
        <div className="card hover-lift lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              {selectedPeriod === 'custom-range' && selectedStartDate && selectedEndDate
                ? `${selectedStartDate} → ${selectedEndDate}`
                : selectedPeriod === 'today' ? 'Today' :
                  selectedPeriod === 'yesterday' ? 'Yesterday' :
                  selectedPeriod === 'last7days' ? 'Last 7 Days' :
                  selectedPeriod === 'last30days' ? 'Last 30 Days' :
                  'Last Month'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gradient">{formatKES(periodRevenue)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {periodTransactions} transactions
            {periodGrowth !== 0 && (
              <span className={`ml-2 ${periodGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {periodGrowth >= 0 ? '↑' : '↓'} {Math.abs(periodGrowth).toFixed(1)}% vs previous
              </span>
            )}
          </div>
        </div>

        {/* Today's Sales (Quick Reference) */}
        <div className="card hover-lift">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Today</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-blue-600">{formatKES(todaysRevenue)}</div>
          <div className="text-xs text-muted-foreground mt-1">{todaysSales.length} transactions</div>
        </div>

        {/* This Week's Sales (Quick Reference) */}
        <div className="card hover-lift">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">This Week</span>
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-green-600">{formatKES(weeklyRevenue)}</div>
          <div className="text-xs text-muted-foreground mt-1">{weeklySales.length} transactions</div>
        </div>

        {/* Low Stock (Quick Reference) */}
        <div className="card hover-lift cursor-pointer" onClick={() => navigate('/stock')}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Low Stock</span>
            <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-warning">{criticalStock.length}</div>
          <div className="text-xs text-muted-foreground mt-1">{lowStockItems.length} items</div>
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
          
          {(() => {
            const groupedByCategory = criticalStock.reduce((acc, item) => {
              const category = item.category || 'Uncategorized'
              if (!acc[category]) acc[category] = []
              acc[category].push(item)
              return acc
            }, {})

            return Object.entries(groupedByCategory).map(([category, items]) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {category.replace(/-/g, ' ').toUpperCase()}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                    {items.length} item{items.length > 1 ? 's' : ''}
                  </span>
                </h3>
                
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
          {periodGrowth !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${
              periodGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {periodGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(periodGrowth).toFixed(1)}% vs previous
            </div>
          )}
        </div>
        
        <DailyGrowthChart salesData={data.sales} activeCustomers={activeCustomers} />
        
        <div className="mt-4 pt-4 border-t border-border/20">
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Selected Period:</span>
              <span className="font-semibold text-foreground ml-2">
                {formatKES(periodRevenue)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg/Day:</span>
              <span className="font-semibold text-foreground ml-2">
                {formatKES(periodRevenue / (periodTransactions || 1))}
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
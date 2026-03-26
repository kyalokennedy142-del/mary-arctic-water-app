"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  RefreshCw,
  Calendar,
  Download,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useData } from '@/context/DataContext'
import { toast } from 'sonner'
import {
  formatKES,
  getLastNDays,
  getLastNMonths,
  filterSalesByDate,
  groupSalesByDay,
  groupSalesByMonth,
  getTopCustomers,
  groupSalesByCategory,
  calculateKPIs
} from '@/lib/reports'

// ... [Keep all chart components the same: RevenueAreaChart, MonthlyBarChart, CategoryPieChart, KpiCard, TopCustomerCard] ...

// Simple Area Chart Component (SVG - no external library)
const RevenueAreaChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.revenue), 1000)
  const chartHeight = 200
  const chartWidth = 600
  const padding = 40

  const points = data.map((item, index) => {
    const x = padding + (index * (chartWidth - padding * 2) / (data.length - 1))
    const y = chartHeight - padding - (item.revenue / maxValue) * (chartHeight - padding * 2)
    return { x, y, ...item }
  })

  const areaPath = `
    M ${padding},${chartHeight - padding}
    ${points.map(p => `L ${p.x},${p.y}`).join(' ')}
    L ${chartWidth - padding},${chartHeight - padding}
    Z
  `

  const linePath = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
  ).join(' ')

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48">
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
        
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00a8ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00a8ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGradient)" />
        
        <path
          d={linePath}
          fill="none"
          stroke="#00a8ff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#00a8ff"
            stroke="white"
            strokeWidth="2"
            className="transition-all duration-200 hover:r-6 cursor-pointer"
          />
        ))}
        
        {data.map((item, index) => {
          const x = padding + (index * (chartWidth - padding * 2) / (data.length - 1))
          return (
            <text
              key={index}
              x={x}
              y={chartHeight - 8}
              textAnchor="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {item.name}
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

// Simple Bar Chart Component (SVG)
const MonthlyBarChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.revenue), 1000)
  const chartHeight = 200
  const chartWidth = 600
  const padding = 40
  const barWidth = (chartWidth - padding * 2) / data.length - 10

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48">
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
        
        {data.map((item, index) => {
          const x = padding + index * ((chartWidth - padding * 2) / data.length) + 5
          const barHeight = (item.revenue / maxValue) * (chartHeight - padding * 2)
          const y = chartHeight - padding - barHeight
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                ry="4"
                fill="#00a8ff"
                className="transition-all duration-200 hover:opacity-80 cursor-pointer"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - 8}
                textAnchor="middle"
                className="text-[10px] fill-muted-foreground"
              >
                {item.name}
              </text>
            </g>
          )
        })}
      </svg>
      
      <div className="flex justify-between text-xs text-muted-foreground px-2">
        <span>6 months ago</span>
        <span>This month</span>
      </div>
    </div>
  )
}

// Simple Pie Chart Component (SVG - Donut style)
const CategoryPieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const colors = ['#00a8ff', '#33b9ff', '#66c9ff', '#99d9ff', '#cce9ff']
  
  let currentAngle = -Math.PI / 2
  
  const polarToCartesian = (centerX, centerY, radius, angle) => ({
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle)
  })
  
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle)
    const end = polarToCartesian(x, y, radius, startAngle)
    const largeArc = endAngle - startAngle <= Math.PI ? 0 : 1
    
    return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
  }
  
  const centerX = 100
  const centerY = 100
  const outerRadius = 80
  const innerRadius = 50
  
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" className="w-48 h-48">
        {data.map((item, index) => {
          if (item.value === 0) return null
          const percent = item.value / total
          const angle = percent * 2 * Math.PI
          const path = describeArc(
            centerX, centerY, outerRadius,
            currentAngle, currentAngle + angle
          )
          const innerPath = describeArc(
            centerX, centerY, innerRadius,
            currentAngle + angle, currentAngle
          )
          
          // eslint-disable-next-line react-hooks/immutability
          currentAngle += angle
          
          return (
            <path
              key={index}
              d={`${path} ${innerPath}`}
              fill={colors[index % colors.length]}
              className="transition-all duration-200 hover:opacity-80 cursor-pointer"
            />
          )
        })}
        <circle cx={centerX} cy={centerY} r={innerRadius} fill="white" className="dark:fill-card" />
      </svg>
      
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {data.filter(item => item.value > 0).map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: colors[index % colors.length] }} 
            />
            <span className="text-sm text-muted-foreground">
              {item.name.replace(/-/g, ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// KPI Card Component
const KpiCard = ({ title, value, subtitle, icon: Icon, trend }) => (
  <div className="card hover-lift">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-gradient">{value}</div>
    {subtitle && <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>}
    {trend && (
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
        trend >= 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs last period
      </div>
    )}
  </div>
)

// Top Customer Card Component
const TopCustomerCard = ({ customer, rank }) => {
  const initials = customer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  
  return (
    <div className="rounded-xl p-4 bg-card border border-border/20 hover-lift-subtle">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">{initials}</span>
          </div>
          <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
            {rank}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground truncate">{customer.name}</div>
          <div className="text-xs text-muted-foreground">{customer.totalOrders} orders</div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-primary">{formatKES(customer.totalSpent)}</div>
        </div>
      </div>
    </div>
  )
}

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    customers: [],
    stock: [],
    sales: []
  })
  const [dateRange, setDateRange] = useState('7days')

  const { getCustomers, getStock, getSales } = useData()

  const loadData = useCallback(async () => {
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
      console.error('Reports load error:', error)
      toast.error('Failed to load reports data')
    } finally {
      setLoading(false)
    }
  }, [getCustomers, getStock, getSales])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = async () => {
    await loadData()
    toast.success('Reports updated!')
  }

  const getDateRange = () => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    
    const start = new Date()
    switch (dateRange) {
      case '7days':
        start.setDate(start.getDate() - 7)
        break
      case '30days':
        start.setDate(start.getDate() - 30)
        break
      case '90days':
        start.setDate(start.getDate() - 90)
        break
      default:
        start.setDate(start.getDate() - 7)
    }
    start.setHours(0, 0, 0, 0)
    
    return { start, end }
  }

  const { start, end } = getDateRange()
  const filteredSales = filterSalesByDate(data.sales, start, end)

  const kpis = calculateKPIs(filteredSales)
  const dailyData = groupSalesByDay(filteredSales, getLastNDays(7))
  const monthlyData = groupSalesByMonth(filteredSales, getLastNMonths(6))
  const categoryData = groupSalesByCategory(filteredSales, data.stock)
  const topCustomers = getTopCustomers(data.customers, filteredSales, 5)

  const handleExport = () => {
    const headers = ['Date', 'Customer', 'Product', 'Quantity', 'Price', 'Total']
    const rows = filteredSales.map(sale => [
      new Date(sale.date).toLocaleDateString('en-KE'),
      sale.customer_name,
      sale.product_name,
      sale.quantity_sold,
      sale.price,
      sale.total
    ])
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aquabiz-reports-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Report exported!')
  }

  const SkeletonCard = () => (
    <div className="rounded-2xl bg-card p-6 shadow-soft animate-pulse">
      <div className="h-4 bg-muted rounded w-1/2 mb-4" />
      <div className="h-8 bg-muted rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/2" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Reports</h1>
            <p className="text-sm text-muted-foreground">Analyze your business performance</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="rounded-xl hover-lift-subtle"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            onClick={handleExport}
            variant="outline"
            className="rounded-xl hover-lift-subtle"
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* SECTION 1: KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard
              title="Total Revenue"
              value={formatKES(kpis.totalRevenue)}
              subtitle={`${kpis.totalOrders} orders`}
              icon={DollarSign}
            />
            <KpiCard
              title="Total Orders"
              value={kpis.totalOrders.toLocaleString()}
              subtitle="Completed sales"
              icon={Package}
            />
            <KpiCard
              title="Avg Order Value"
              value={formatKES(kpis.avgOrder)}
              subtitle="Per transaction"
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* ✅ UPDATED: GRID LAYOUT - Monthly Revenue + Category Breakdown Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Monthly Revenue (Bar Chart) */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Monthly Revenue
            </h2>
          </div>
          {loading ? (
            <div className="h-48 bg-muted rounded-xl animate-pulse" />
          ) : (
            <MonthlyBarChart data={monthlyData} />
          )}
        </div>

        {/* Right: Revenue by Category (Pie Chart) */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Revenue by Category
            </h2>
          </div>
          {loading ? (
            <div className="h-48 bg-muted rounded-xl animate-pulse" />
          ) : categoryData.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No sales data in this date range</p>
            </div>
          ) : (
            <CategoryPieChart data={categoryData} />
          )}
        </div>
      </div>

      {/* 7-Day Revenue Trend (Full Width) */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Revenue Trend (Last 7 Days)
          </h2>
        </div>
        {loading ? (
          <div className="h-48 bg-muted rounded-xl animate-pulse" />
        ) : (
          <RevenueAreaChart data={dailyData} />
        )}
      </div>

      {/* Top Customers */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Top Customers
          </h2>
          <span className="text-sm text-muted-foreground">By total spent</span>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : topCustomers.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No customer data in this date range</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topCustomers.map((customer, index) => (
              <TopCustomerCard 
                key={customer.id} 
                customer={customer} 
                rank={index + 1} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
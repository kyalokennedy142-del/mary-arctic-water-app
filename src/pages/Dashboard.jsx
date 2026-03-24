import { Users, Package, AlertTriangle, DollarSign, TrendingUp, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCustomers, useStock, useSales } from "@/lib/hooks"
import { format } from "date-fns"

// Kenyan Shilling formatter
const formatKES = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0)
}

export default function Dashboard() {
  const {  customers = [], isLoading: loadingCustomers } = useCustomers()
  const {  stock = [], isLoading: loadingStock } = useStock()
  const {  sales = [], isLoading: loadingSales } = useSales()

  const customersData = customers || []
  const stockData = stock || []
  const salesData = sales || []

  // Calculate statistics
  const totalCustomers = customersData.length
  const totalProducts = stockData.length
  const lowStockItems = stockData.filter(item => item.quantity <= 5).length
  const outOfStockItems = stockData.filter(item => item.quantity <= 0).length

  // Calculate today's sales
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todaysSales = salesData.filter(sale => {
    const saleDate = new Date(sale.date)
    saleDate.setHours(0, 0, 0, 0)
    return saleDate.getTime() === today.getTime()
  })

  const todaysRevenue = todaysSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
  const todaysTransactions = todaysSales.length
  const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0)
  const stockValue = stockData.reduce((sum, item) => sum + ((item.quantity || 0) * (item.selling_price || 0)), 0)
  const recentSales = salesData.slice(0, 5)

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers,
      description: "Active customer accounts",
      icon: Users,
      gradient: "primary",
      valueClass: ""
    },
    {
      title: "Total Products",
      value: totalProducts,
      description: "Items in inventory",
      icon: Package,
      gradient: "primary",
      valueClass: ""
    },
    {
      title: "Low Stock",
      value: lowStockItems,
      description: outOfStockItems > 0 ? `${outOfStockItems} out of stock` : "Items need restocking",
      icon: AlertTriangle,
      gradient: lowStockItems > 0 ? "warning" : "success",
      valueClass: lowStockItems > 0 ? "warning" : ""
    },
    {
      title: "Today's Revenue",
      value: formatKES(todaysRevenue),
      description: `${todaysTransactions} transactions today`,
      icon: DollarSign,
      gradient: "success",
      valueClass: "success"
    }
  ]

  if (loadingCustomers || loadingStock || loadingSales) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-icon">
          <TrendingUp />
        </div>
        <div>
          <h1 className="dashboard-header-title">Dashboard</h1>
          <p className="dashboard-header-subtitle">Welcome to AquaBiz — Here's your business overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="dashboard-stat-card overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="dashboard-card-title">{stat.title}</CardTitle>
                <div className={`dashboard-icon-container ${stat.gradient}`}>
                  <Icon />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`dashboard-stat-value ${stat.valueClass}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Business Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="dashboard-stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="dashboard-icon-container primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="dashboard-card-title text-base">Inventory Value</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashboard-stat-value dashboard-overview-value">
              {formatKES(stockValue)}
            </div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Total value of all stock at selling price
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="dashboard-icon-container success">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="dashboard-card-title text-base">Total Revenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashboard-stat-value dashboard-overview-value success">
              {formatKES(totalRevenue)}
            </div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Lifetime sales revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Warning */}
      {lowStockItems > 0 && (
        <Card className="dashboard-alert">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              The following items need restocking soon:
            </p>
            <ul className="text-sm space-y-2">
              {stockData
                .filter(item => item.quantity <= 5)
                .map(item => (
                  <li key={item.id} className="flex justify-between items-center p-2 rounded-lg bg-card border">
                    <span className="font-medium">{item.product_name}</span>
                    <span className={`font-semibold ${item.quantity <= 0 ? 'text-destructive' : 'text-warning'}`}>
                      {item.quantity} left
                    </span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recent Sales Table */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="dashboard-icon-container primary w-9 h-9">
              <ShoppingCart className="w-4 h-4" />
            </div>
            Recent Sales
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentSales.length === 0 ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">
                <ShoppingCart />
              </div>
              <p className="text-lg font-medium">No sales recorded yet</p>
              <p className="text-sm mt-1">Start by recording your first sale on the Sales page</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dashboard-table-header">
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="text-right font-semibold">Qty</TableHead>
                    <TableHead className="text-right font-semibold">Total</TableHead>
                    <TableHead className="text-right font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map((sale) => (
                    <TableRow key={sale.id} className="dashboard-table-row">
                      <TableCell className="font-medium">{sale.customer_name}</TableCell>
                      <TableCell>{sale.product_name}</TableCell>
                      <TableCell className="text-right font-mono">{sale.quantity_sold}</TableCell>
                      <TableCell className="text-right font-mono font-semibold text-primary">
                        {formatKES(sale.total)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {format(new Date(sale.date), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
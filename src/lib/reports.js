// src/lib/reports.js

// Format KES currency
export const formatKES = (amount) => new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).format(amount || 0)

// Get last N days array
export const getLastNDays = (n = 7) => {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    days.push(date)
  }
  return days
}

// Get last N months array
export const getLastNMonths = (n = 6) => {
  const months = []
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    date.setDate(1)
    date.setHours(0, 0, 0, 0)
    months.push(date)
  }
  return months
}

// Filter sales by date range
export const filterSalesByDate = (sales, startDate, endDate) => {
  return sales.filter(sale => {
    const saleDate = new Date(sale.date)
    return saleDate >= startDate && saleDate <= endDate
  })
}

// Group sales by day for chart
export const groupSalesByDay = (sales, days) => {
  return days.map(day => {
    const dayStr = day.toISOString().split('T')[0]
    const daySales = sales.filter(sale => {
      const saleDate = new Date(sale.date)
      return saleDate.toISOString().split('T')[0] === dayStr
    })
    const revenue = daySales.reduce((sum, s) => sum + (s.total || 0), 0)
    return {
      name: day.toLocaleDateString('en-KE', { weekday: 'short' }),
      date: dayStr,
      revenue,
      orders: daySales.length
    }
  })
}

// Group sales by month for chart
export const groupSalesByMonth = (sales, months) => {
  return months.map(month => {
    const monthStr = month.toISOString().slice(0, 7) // "2026-03"
    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.date)
      return saleDate.toISOString().slice(0, 7) === monthStr
    })
    const revenue = monthSales.reduce((sum, s) => sum + (s.total || 0), 0)
    return {
      name: month.toLocaleDateString('en-KE', { month: 'short' }),
      month: monthStr,
      revenue,
      orders: monthSales.length
    }
  })
}

// Get top customers by total spent
export const getTopCustomers = (customers, sales, limit = 5) => {
  return customers
    .map(customer => {
      const customerSales = sales.filter(s => s.customer_id === customer.id)
      const totalSpent = customerSales.reduce((sum, s) => sum + (s.total || 0), 0)
      const totalOrders = customerSales.length
      return { ...customer, totalSpent, totalOrders }
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit)
}

// Group sales by product category for pie chart
export const groupSalesByCategory = (sales, stock) => {
  const categoryRevenue = {}
  
  sales.forEach(sale => {
    const product = stock.find(s => s.id === sale.product_id)
    const category = product?.category || 'Uncategorized'
    categoryRevenue[category] = (categoryRevenue[category] || 0) + (sale.total || 0)
  })
  
  return Object.entries(categoryRevenue)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

// Calculate KPI metrics
export const calculateKPIs = (sales) => {
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0)
  const totalOrders = sales.length
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0
  
  return { totalRevenue, totalOrders, avgOrder }
}
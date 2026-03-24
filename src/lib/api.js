const STORAGE_KEYS = {
  CUSTOMERS: 'aquabiz_customers',
  STOCK: 'aquabiz_stock',
  SALES: 'aquabiz_sales'
}

const getStorage = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Error reading localStorage:', e)
    return []
  }
}

const setStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    console.log('💾 Saved to', key, ':', data.length, 'items')
    return true
  } catch (e) {
    console.error('Error writing localStorage:', e)
    return false
  }
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9)

export const customersApi = {
  getAll: async () => {
    const data = getStorage(STORAGE_KEYS.CUSTOMERS)
    console.log('📋 Fetching customers:', data.length, 'items')
    return data
  },
  create: async (customerData) => {
    const customers = getStorage(STORAGE_KEYS.CUSTOMERS)
    const newCustomer = {
      id: generateId(),
      ...customerData,
      created_at: new Date().toISOString()
    }
    customers.push(newCustomer)
    setStorage(STORAGE_KEYS.CUSTOMERS, customers)
    return newCustomer
  },
  update: async (id, customerData) => {
    const customers = getStorage(STORAGE_KEYS.CUSTOMERS)
    const index = customers.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Customer not found')
    customers[index] = { ...customers[index], ...customerData }
    setStorage(STORAGE_KEYS.CUSTOMERS, customers)
    return customers[index]
  },
  delete: async (id) => {
    const customers = getStorage(STORAGE_KEYS.CUSTOMERS)
    const filtered = customers.filter(c => c.id !== id)
    setStorage(STORAGE_KEYS.CUSTOMERS, filtered)
    return true
  }
}

export const stockApi = {
  getAll: async () => {
    return getStorage(STORAGE_KEYS.STOCK)
  },
  create: async (stockData) => {
    const stock = getStorage(STORAGE_KEYS.STOCK)
    const newItem = {
      id: generateId(),
      ...stockData,
      created_at: new Date().toISOString()
    }
    stock.push(newItem)
    setStorage(STORAGE_KEYS.STOCK, stock)
    return newItem
  },
  reduceQuantity: async (id, quantitySold) => {
    const stock = getStorage(STORAGE_KEYS.STOCK)
    const index = stock.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Stock item not found')
    if (stock[index].quantity < quantitySold) {
      throw new Error(`Only ${stock[index].quantity} units available`)
    }
    stock[index].quantity = stock[index].quantity - quantitySold
    setStorage(STORAGE_KEYS.STOCK, stock)
    return stock[index]
  }
}

export const salesApi = {
  getAll: async () => {
    const sales = getStorage(STORAGE_KEYS.SALES)
    return sales.sort((a, b) => new Date(b.date) - new Date(a.date))
  },
  getByCustomerId: async (customerId) => {
    const sales = getStorage(STORAGE_KEYS.SALES)
    return sales
      .filter(s => s.customer_id === customerId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  },
  create: async (saleData) => {
    const sales = getStorage(STORAGE_KEYS.SALES)
    const newSale = {
      id: generateId(),
      ...saleData,
      date: new Date().toISOString()
    }
    sales.push(newSale)
    setStorage(STORAGE_KEYS.SALES, sales)
    return newSale
  }
}

export const seedSampleData = () => {
  console.log('🌱 Checking if seed is needed...')
  
  // Seed customers if empty
  if (getStorage(STORAGE_KEYS.CUSTOMERS).length === 0) {
    const sampleCustomers = [
      { id: generateId(), name: 'John Mwangi', phone: '+254712345678', location: 'Nairobi CBD', created_at: new Date().toISOString() },
      { id: generateId(), name: 'Sarah Ochieng', phone: '+254798765432', location: 'Westlands', created_at: new Date().toISOString() },
      { id: generateId(), name: 'David Kamau', phone: '+254711223344', location: 'Kilimani', created_at: new Date().toISOString() }
    ]
    setStorage(STORAGE_KEYS.CUSTOMERS, sampleCustomers)
    console.log('✅ Seeded 3 customers')
  }

  // Seed stock if empty
  if (getStorage(STORAGE_KEYS.STOCK).length === 0) {
    const sampleStock = [
      { id: generateId(), product_name: '20L Water Bottle', quantity: 50, selling_price: 5.00, created_at: new Date().toISOString() },
      { id: generateId(), product_name: '5L Water Pack', quantity: 120, selling_price: 2.00, created_at: new Date().toISOString() },
      { id: generateId(), product_name: '500ml Water (24-pack)', quantity: 30, selling_price: 8.50, created_at: new Date().toISOString() }
    ]
    setStorage(STORAGE_KEYS.STOCK, sampleStock)
    console.log('✅ Seeded 3 stock items')
  }

  console.log(' Initialization complete!')
}
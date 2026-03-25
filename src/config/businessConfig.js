/**
 * AquaBiz - Business Logic Configuration
 * Centralized business rules, constants, and configurations
 */

// ============================================
// APP CONFIGURATION
// ============================================
export const APP_CONFIG = {
  appName: 'AquaBiz',
  version: '1.0.0',
  currency: 'KES',
  timezone: 'Africa/Nairobi',
  dateFormat: 'MMM d, yyyy',
  dateTimeFormat: 'MMM d, yyyy HH:mm',
}

// ============================================
// PRODUCT CATEGORIES & RULES
// ============================================
export const PRODUCT_CATEGORIES = {
  WATER_BOTTLES_FILLED: {
    id: 'water-bottles-filled',
    name: 'WATER BOTTLES WITH WATER',
    description: 'Filled water bottles ready for sale',
    requiresStock: true,
    canRefill: false,
    minPrice: 25,
    maxPrice: 450,
  },
  WATER_REFILLS: {
    id: 'water-refills',
    name: 'WATER REFILLS',
    description: 'Water refill services',
    requiresStock: false,
    canRefill: true,
    minPrice: 5,
    maxPrice: 100,
  },
  PACKAGES: {
    id: 'packages',
    name: 'PACKAGES',
    description: 'Bulk water packages',
    requiresStock: true,
    canRefill: false,
    minPrice: 420,
    maxPrice: 600,
    isBulk: true,
  },
  WATER_PUMPS: {
    id: 'water-pumps',
    name: 'WATER PUMPS',
    description: 'Water pump accessories',
    requiresStock: true,
    canRefill: false,
    minPrice: 500,
    maxPrice: 600,
    isAccessory: true,
  },
  EMPTY_BOTTLES: {
    id: 'empty-bottles',
    name: 'EMPTY BOTTLES',
    description: 'Empty water bottles for sale',
    requiresStock: true,
    canRefill: false,
    minPrice: 500,
    maxPrice: 950,
  },
  ACCESSORIES: {
    id: 'accessories',
    name: 'ACCESSORIES',
    description: 'Water accessories and add-ons',
    requiresStock: true,
    canRefill: false,
    minPrice: 30,
    maxPrice: 1100,
    isAccessory: true,
  },
}

// ============================================
// STOCK MANAGEMENT RULES
// ============================================
export const STOCK_RULES = {
  // Minimum stock threshold alerts
  lowStockThreshold: 10,
  criticalStockThreshold: 5,
  outOfStockThreshold: 0,
  
  // Maximum stock levels
  maxStockLevel: 500,
  
  // Reorder points
  reorderPoint: 20,
  reorderQuantity: 50,
  
  // Stock status labels
  statusLabels: {
    outOfStock: 'Out of Stock',
    lowStock: 'Low Stock',
    inStock: 'In Stock',
    overstocked: 'Overstocked',
  },
}

// ============================================
// SALES RULES & VALIDATIONS
// ============================================
export const SALES_RULES = {
  // Minimum and maximum quantities
  minQuantity: 1,
  maxQuantity: 100,
  
  // Discount rules
  maxDiscountPercent: 20,
  bulkDiscountThreshold: 10,
  bulkDiscountPercent: 5,
  
  // Payment terms
  allowCredit: false,
  maxCreditDays: 0,
  
  // Tax configuration
  taxEnabled: false,
  taxRate: 0,
  
  // Validation messages
  validationMessages: {
    minQuantity: 'Minimum quantity is 1',
    maxQuantity: 'Maximum quantity is 100',
    insufficientStock: 'Insufficient stock available',
    invalidPrice: 'Price must be greater than 0',
  },
}

// ============================================
// CUSTOMER MANAGEMENT RULES
// ============================================
export const CUSTOMER_RULES = {
  // Required fields
  requiredFields: ['name', 'phone'],
  
  // Phone validation
  phonePattern: /^\+254[0-9]{9}$/,
  phoneFormat: '+254XXXXXXXXX',
  
  // Customer types
  types: {
    retail: 'Retail Customer',
    wholesale: 'Wholesale Customer',
    corporate: 'Corporate Client',
  },
  
  // Credit limits
  defaultCreditLimit: 0,
  maxCreditLimit: 50000,
}

// ============================================
// PRICING RULES
// ============================================
export const PRICING_RULES = {
  // Price formatting
  currency: 'KES',
  locale: 'en-KE',
  minDecimals: 0,
  maxDecimals: 2,
  
  // Price validation
  minPrice: 0,
  maxPrice: 100000,
  
  // Price tiers
  tiers: {
    retail: { multiplier: 1.0, name: 'Retail Price' },
    wholesale: { multiplier: 0.9, name: 'Wholesale Price (10% off)' },
    corporate: { multiplier: 0.85, name: 'Corporate Price (15% off)' },
  },
}

// ============================================
// DASHBOARD METRICS
// ============================================
export const DASHBOARD_METRICS = {
  // Time periods for analytics
  periods: {
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
  },
  
  // Key performance indicators
  kpis: {
    totalSales: 'Total Sales',
    totalRevenue: 'Total Revenue',
    totalCustomers: 'Total Customers',
    totalProducts: 'Total Products',
    lowStockItems: 'Low Stock Items',
    avgOrderValue: 'Average Order Value',
  },
  
  // Chart configurations
  charts: {
    salesTrend: {
      type: 'line',
      period: 'daily',
      dataPoints: 30,
    },
    topProducts: {
      type: 'bar',
      limit: 5,
    },
    categoryDistribution: {
      type: 'pie',
    },
  },
}

// ============================================
// NOTIFICATION SETTINGS
// ============================================
export const NOTIFICATION_SETTINGS = {
  // Stock alerts
  stockAlerts: {
    enabled: true,
    lowStock: true,
    outOfStock: true,
    overstocked: false,
  },
  
  // Sales notifications
  salesNotifications: {
    enabled: true,
    newSale: true,
    largeOrder: true,
    largeOrderThreshold: 5000,
  },
  
  // Customer notifications
  customerNotifications: {
    enabled: false,
    newCustomer: true,
    customerInactive: true,
    inactiveDays: 30,
  },
}

// ============================================
// FEATURE FLAGS
// ============================================
export const FEATURE_FLAGS = {
  enableInventoryTracking: true,
  enableCustomerCredit: false,
  enableDiscounts: true,
  enableTaxCalculation: false,
  enableMultiLocation: false,
  enableBarcodeScanning: false,
  enableReports: true,
  enableExports: true,
}

// ============================================
// EXPORT HELPERS
// ============================================

/**
 * Get category by ID
 */
export const getCategoryById = (categoryId) => {
  return Object.values(PRODUCT_CATEGORIES).find(cat => cat.id === categoryId)
}

/**
 * Get all category options for dropdowns
 */
export const getCategoryOptions = () => {
  return Object.values(PRODUCT_CATEGORIES).map(cat => ({
    value: cat.id,
    label: cat.name,
    description: cat.description,
  }))
}

/**
 * Check if stock is low
 */
export const isLowStock = (quantity) => {
  return quantity <= STOCK_RULES.lowStockThreshold && quantity > STOCK_RULES.criticalStockThreshold
}

/**
 * Check if stock is critical
 */
export const isCriticalStock = (quantity) => {
  return quantity <= STOCK_RULES.criticalStockThreshold && quantity > STOCK_RULES.outOfStockThreshold
}

/**
 * Check if out of stock
 */
export const isOutOfStock = (quantity) => {
  return quantity <= STOCK_RULES.outOfStockThreshold
}

/**
 * Get stock status
 */
export const getStockStatus = (quantity) => {
  if (isOutOfStock(quantity)) return STOCK_RULES.statusLabels.outOfStock
  if (isCriticalStock(quantity)) return STOCK_RULES.statusLabels.lowStock
  if (isLowStock(quantity)) return STOCK_RULES.statusLabels.lowStock
  if (quantity > STOCK_RULES.maxStockLevel) return STOCK_RULES.statusLabels.overstocked
  return STOCK_RULES.statusLabels.inStock
}

/**
 * Validate sale quantity
 */
export const validateSaleQuantity = (quantity, availableStock) => {
  const errors = []
  
  if (quantity < SALES_RULES.minQuantity) {
    errors.push(SALES_RULES.validationMessages.minQuantity)
  }
  
  if (quantity > SALES_RULES.maxQuantity) {
    errors.push(SALES_RULES.validationMessages.maxQuantity)
  }
  
  if (quantity > availableStock) {
    errors.push(SALES_RULES.validationMessages.insufficientStock)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Format price in KES
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat(PRICING_RULES.locale, {
    style: 'currency',
    currency: PRICING_RULES.currency,
    minimumFractionDigits: PRICING_RULES.minDecimals,
    maximumFractionDigits: PRICING_RULES.maxDecimals,
  }).format(amount || 0)
}

/**
 * Calculate bulk discount
 */
export const calculateBulkDiscount = (quantity, unitPrice) => {
  if (quantity >= SALES_RULES.bulkDiscountThreshold) {
    const discount = (unitPrice * quantity) * (SALES_RULES.bulkDiscountPercent / 100)
    return {
      hasDiscount: true,
      discountAmount: discount,
      discountPercent: SALES_RULES.bulkDiscountPercent,
      finalPrice: (unitPrice * quantity) - discount,
    }
  }
  
  return {
    hasDiscount: false,
    discountAmount: 0,
    discountPercent: 0,
    finalPrice: unitPrice * quantity,
  }
}

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  return CUSTOMER_RULES.phonePattern.test(phone)
}

/**
 * Get default business settings
 */
export const getDefaultSettings = () => ({
  app: APP_CONFIG,
  stock: STOCK_RULES,
  sales: SALES_RULES,
  customers: CUSTOMER_RULES,
  pricing: PRICING_RULES,
  dashboard: DASHBOARD_METRICS,
  notifications: NOTIFICATION_SETTINGS,
  features: FEATURE_FLAGS,
})

export default {
  APP_CONFIG,
  PRODUCT_CATEGORIES,
  STOCK_RULES,
  SALES_RULES,
  CUSTOMER_RULES,
  PRICING_RULES,
  DASHBOARD_METRICS,
  NOTIFICATION_SETTINGS,
  FEATURE_FLAGS,
  getCategoryById,
  getCategoryOptions,
  isLowStock,
  isCriticalStock,
  isOutOfStock,
  getStockStatus,
  validateSaleQuantity,
  formatPrice,
  calculateBulkDiscount,
  validatePhone,
  getDefaultSettings,
}
/**
 * AquaBiz - Centralized CRUD Operations & Page Relationships
 * This file defines all data operations and how pages connect to each other
 */

// ============================================
// DATABASE TABLE SCHEMA
// ============================================
export const DB_SCHEMA = {
  customers: {
    tableName: 'customers',
    primaryKey: 'id',
    fields: {
      id: { type: 'uuid', auto: true },
      name: { type: 'string', required: true },
      phone: { type: 'string', required: true },
      location: { type: 'string', required: false },
      created_at: { type: 'timestamp', auto: true },
      updated_at: { type: 'timestamp', auto: true }
    },
    relationships: {
      sales: { type: 'one-to-many', foreignKey: 'customer_id' }
    }
  },
  
  products: {
    tableName: 'products',
    primaryKey: 'id',
    fields: {
      id: { type: 'uuid', auto: true },
      category: { type: 'string', required: true },
      name: { type: 'string', required: true },
      description: { type: 'text', required: false },
      price: { type: 'decimal', required: true },
      unit: { type: 'string', required: true },
      is_active: { type: 'boolean', default: true },
      created_at: { type: 'timestamp', auto: true }
    },
    relationships: {
      stock: { type: 'one-to-many', foreignKey: 'product_id' }
    }
  },
  
  stock: {
    tableName: 'stock',
    primaryKey: 'id',
    fields: {
      id: { type: 'uuid', auto: true },
      product_id: { type: 'uuid', foreignKey: 'products.id' },
      product_name: { type: 'string', required: true },
      quantity: { type: 'integer', required: true, default: 0 },
      selling_price: { type: 'decimal', required: true },
      category: { type: 'string', required: true },
      created_at: { type: 'timestamp', auto: true },
      updated_at: { type: 'timestamp', auto: true }
    },
    relationships: {
      product: { type: 'many-to-one', foreignKey: 'product_id' },
      sales: { type: 'one-to-many', foreignKey: 'product_id' }
    }
  },
  
  sales: {
    tableName: 'sales',
    primaryKey: 'id',
    fields: {
      id: { type: 'uuid', auto: true },
      customer_id: { type: 'uuid', foreignKey: 'customers.id' },
      customer_name: { type: 'string', required: true },
      product_id: { type: 'uuid', foreignKey: 'stock.id' },
      product_name: { type: 'string', required: true },
      quantity_sold: { type: 'integer', required: true },
      price: { type: 'decimal', required: true },
      total: { type: 'decimal', required: true },
      date: { type: 'timestamp', auto: true }
    },
    relationships: {
      customer: { type: 'many-to-one', foreignKey: 'customer_id' },
      product: { type: 'many-to-one', foreignKey: 'product_id' }
    }
  }
}

// ============================================
// PAGE RELATIONSHIPS & DATA FLOW
// ============================================
export const PAGE_RELATIONSHIPS = {
  dashboard: {
    path: '/',
    component: 'Dashboard',
    dataDependencies: ['customers', 'stock', 'sales'],
    updatesOn: ['customer:create', 'stock:update', 'sale:create'],
    displays: ['stats', 'charts', 'recentSales', 'alerts']
  },
  
  customers: {
    path: '/customers',
    component: 'Customers',
    dataDependencies: ['customers'],
    updatesOn: ['customer:create', 'customer:update', 'customer:delete'],
    displays: ['customerList', 'customerForm', 'customerSales'],
    connectsTo: ['sales'] // Can create sales from customer page
  },
  
  stock: {
    path: '/stock',
    component: 'Stock',
    dataDependencies: ['stock', 'products'],
    updatesOn: ['stock:create', 'stock:update', 'product:create'],
    displays: ['stockList', 'stockForm', 'stockAlerts'],
    connectsTo: ['sales'] // Stock decreases when sale is made
  },
  
  sales: {
    path: '/sales',
    component: 'Sales',
    dataDependencies: ['customers', 'stock', 'products', 'sales'],
    updatesOn: ['sale:create'],
    displays: ['salesForm', 'salesHistory'],
    connectsTo: ['customers', 'stock'], // Requires customer + stock data
    triggers: ['stock:update'] // Reduces stock quantity on sale
  }
}

// ============================================
// CRUD OPERATIONS CONFIGURATION
// ============================================
export const CRUD_OPERATIONS = {
  // ============================================
  // CUSTOMERS CRUD
  // ============================================
  customers: {
    create: {
      endpoint: 'customers',
      method: 'INSERT',
      requiredFields: ['name', 'phone'],
      optionalFields: ['location'],
      validation: {
        name: { minLength: 2, maxLength: 100 },
        phone: { pattern: /^\+254[0-9]{9}$/, message: 'Invalid Kenyan phone number' },
        location: { maxLength: 200 }
      },
      onSuccess: ['refresh:customers', 'refresh:dashboard', 'notify:customerCreated'],
      onError: ['notify:customerCreateFailed']
    },
    
    read: {
      endpoint: 'customers',
      method: 'SELECT',
      fields: ['*', 'count()'],
      filters: ['is_active'],
      sorting: { default: 'created_at', order: 'DESC' }
    },
    
    update: {
      endpoint: 'customers',
      method: 'UPDATE',
      requiredFields: ['id'],
      updatableFields: ['name', 'phone', 'location'],
      validation: {
        name: { minLength: 2, maxLength: 100 },
        phone: { pattern: /^\+254[0-9]{9}$/ }
      },
      onSuccess: ['refresh:customers', 'refresh:dashboard', 'notify:customerUpdated'],
      onError: ['notify:customerUpdateFailed']
    },
    
    delete: {
      endpoint: 'customers',
      method: 'DELETE',
      requiredFields: ['id'],
      cascade: false, // Don't delete related sales
      softDelete: true, // Set is_active = false instead
      onSuccess: ['refresh:customers', 'refresh:dashboard', 'notify:customerDeleted'],
      onError: ['notify:customerDeleteFailed']
    }
  },
  
  // ============================================
  // PRODUCTS CRUD
  // ============================================
  products: {
    create: {
      endpoint: 'products',
      method: 'INSERT',
      requiredFields: ['category', 'name', 'price', 'unit'],
      optionalFields: ['description', 'is_active'],
      validation: {
        category: { enum: ['water-bottles-filled', 'water-refills', 'packages', 'water-pumps', 'empty-bottles', 'accessories'] },
        name: { minLength: 2, maxLength: 200 },
        price: { min: 0, max: 100000 },
        unit: { enum: ['bottle', 'refill', 'package', 'piece'] }
      },
      onSuccess: ['refresh:products', 'refresh:stock', 'refresh:dashboard'],
      onError: ['notify:productCreateFailed']
    },
    
    read: {
      endpoint: 'products',
      method: 'SELECT',
      fields: ['*', 'count()'],
      filters: ['is_active', 'category'],
      sorting: { default: 'category', order: 'ASC' }
    },
    
    update: {
      endpoint: 'products',
      method: 'UPDATE',
      requiredFields: ['id'],
      updatableFields: ['category', 'name', 'description', 'price', 'unit', 'is_active'],
      validation: {
        price: { min: 0, max: 100000 }
      },
      onSuccess: ['refresh:products', 'refresh:stock', 'refresh:dashboard'],
      onError: ['notify:productUpdateFailed']
    },
    
    delete: {
      endpoint: 'products',
      method: 'DELETE',
      requiredFields: ['id'],
      cascade: false,
      softDelete: true,
      onSuccess: ['refresh:products', 'refresh:stock', 'refresh:dashboard'],
      onError: ['notify:productDeleteFailed']
    }
  },
  
  // ============================================
  // STOCK CRUD
  // ============================================
  stock: {
    create: {
      endpoint: 'stock',
      method: 'INSERT',
      requiredFields: ['product_name', 'quantity', 'selling_price', 'category'],
      optionalFields: ['product_id'],
      validation: {
        quantity: { min: 0, max: 10000 },
        selling_price: { min: 0, max: 100000 }
      },
      onSuccess: ['refresh:stock', 'refresh:dashboard', 'notify:stockAdded'],
      onError: ['notify:stockCreateFailed']
    },
    
    read: {
      endpoint: 'stock',
      method: 'SELECT',
      fields: ['*', 'count()'],
      filters: ['category', 'quantity'],
      sorting: { default: 'product_name', order: 'ASC' }
    },
    
    update: {
      endpoint: 'stock',
      method: 'UPDATE',
      requiredFields: ['id'],
      updatableFields: ['product_name', 'quantity', 'selling_price', 'category'],
      validation: {
        quantity: { min: 0, max: 10000 },
        selling_price: { min: 0, max: 100000 }
      },
      onSuccess: ['refresh:stock', 'refresh:dashboard', 'notify:stockUpdated'],
      onError: ['notify:stockUpdateFailed']
    },
    
    delete: {
      endpoint: 'stock',
      method: 'DELETE',
      requiredFields: ['id'],
      cascade: false,
      softDelete: false,
      onSuccess: ['refresh:stock', 'refresh:dashboard', 'notify:stockDeleted'],
      onError: ['notify:stockDeleteFailed']
    },
    
    // Special operation: Reduce stock on sale
    reduceQuantity: {
      endpoint: 'stock',
      method: 'UPDATE',
      requiredFields: ['id', 'quantity_sold'],
      logic: 'quantity = quantity - quantity_sold',
      validation: {
        quantity_sold: { min: 1, maxField: 'quantity' } // Can't sell more than available
      },
      onSuccess: ['refresh:stock', 'refresh:dashboard', 'refresh:sales'],
      onError: ['notify:insufficientStock']
    }
  },
  
  // ============================================
  // SALES CRUD
  // ============================================
  sales: {
    create: {
      endpoint: 'sales',
      method: 'INSERT',
      requiredFields: ['customer_id', 'customer_name', 'product_id', 'product_name', 'quantity_sold', 'price', 'total'],
      optionalFields: [],
      validation: {
        customer_id: { required: true },
        product_id: { required: true },
        quantity_sold: { min: 1 },
        price: { min: 0 },
        total: { min: 0, equals: 'quantity_sold * price' }
      },
      // Multi-step operation
      steps: [
        { action: 'validate:stock', check: 'quantity >= quantity_sold' },
        { action: 'insert:sale' },
        { action: 'update:stock', reduce: 'quantity_sold' }
      ],
      onSuccess: ['refresh:sales', 'refresh:stock', 'refresh:dashboard', 'notify:saleRecorded'],
      onError: ['notify:saleCreateFailed', 'rollback:stock']
    },
    
    read: {
      endpoint: 'sales',
      method: 'SELECT',
      fields: ['*', 'count()'],
      filters: ['date', 'customer_id', 'product_id'],
      sorting: { default: 'date', order: 'DESC' },
      joins: [
        { table: 'customers', on: 'sales.customer_id = customers.id' },
        { table: 'stock', on: 'sales.product_id = stock.id' }
      ]
    },
    
    update: {
      endpoint: 'sales',
      method: 'UPDATE',
      requiredFields: ['id'],
      updatableFields: [], // Sales should not be editable after creation
      allowed: false,
      reason: 'Sales are immutable after creation for audit purposes'
    },
    
    delete: {
      endpoint: 'sales',
      method: 'DELETE',
      requiredFields: ['id'],
      cascade: false,
      allowed: false,
      reason: 'Sales cannot be deleted. Use credit note or refund process instead'
    }
  }
}

// ============================================
// PAGE DATA FLOW DIAGRAM
// ============================================
export const DATA_FLOW = {
  // When user creates a customer
  customerCreate: {
    from: 'customers',
    to: ['customers', 'dashboard'],
    action: 'INSERT',
    refresh: ['customers', 'dashboard']
  },
  
  // When user records a sale
  saleCreate: {
    from: 'sales',
    to: ['sales', 'stock', 'dashboard', 'customers'],
    action: 'INSERT + UPDATE',
    steps: [
      'validate:stock_quantity',
      'insert:sale_record',
      'reduce:stock_quantity',
      'refresh:all_pages'
    ]
  },
  
  // When user updates stock
  stockUpdate: {
    from: 'stock',
    to: ['stock', 'dashboard', 'sales'],
    action: 'UPDATE',
    refresh: ['stock', 'dashboard']
  },
  
  // When dashboard loads
  dashboardLoad: {
    from: 'dashboard',
    to: ['customers', 'stock', 'sales'],
    action: 'SELECT',
    aggregations: [
      'count:customers',
      'count:stock',
      'sum:sales.total',
      'count:low_stock_items'
    ]
  }
}

// ============================================
// BUSINESS RULES & VALIDATIONS
// ============================================
export const BUSINESS_RULES = {
  // Stock cannot go negative
  stockMinimum: 0,
  
  // Sale quantity cannot exceed available stock
  saleQuantityValidation: 'quantity_sold <= stock.quantity',
  
  // Sale total must equal quantity × price
  saleTotalValidation: 'total = quantity_sold × price',
  
  // Customer phone must be Kenyan format
  customerPhoneFormat: '+254XXXXXXXXX',
  
  // Products cannot be deleted if they have sales
  productDeleteConstraint: 'no_related_sales',
  
  // Sales are immutable (cannot edit/delete)
  salesImmutability: true,
  
  // Minimum sale quantity
  minimumSaleQuantity: 1,
  
  // Maximum sale quantity per transaction
  maximumSaleQuantity: 100,
  
  // Low stock threshold for alerts
  lowStockThreshold: 10,
  
  // Critical stock threshold
  criticalStockThreshold: 5
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all pages that depend on a specific data type
 */
export const getDependentPages = (dataType) => {
  const dependentPages = []
  Object.entries(PAGE_RELATIONSHIPS).forEach(([page, config]) => {
    if (config.dataDependencies.includes(dataType)) {
      dependentPages.push(page)
    }
  })
  return dependentPages
}

/**
 * Get all operations that trigger a refresh for a specific page
 */
export const getRefreshTriggers = (pageName) => {
  const page = PAGE_RELATIONSHIPS[pageName]
  if (!page) return []
  return page.updatesOn
}

/**
 * Validate data against CRUD rules
 */
export const validateCRUD = (operation, data) => {
  const [entity, action] = operation.split(':')
  const rules = CRUD_OPERATIONS[entity]?.[action]
  
  if (!rules) return { valid: false, error: 'Invalid operation' }
  
  // Check required fields
  if (rules.requiredFields) {
    const missing = rules.requiredFields.filter(field => !data[field])
    if (missing.length > 0) {
      return { valid: false, error: `Missing required fields: ${missing.join(', ')}` }
    }
  }
  
  // Check validation rules
  if (rules.validation) {
    for (const [field, validations] of Object.entries(rules.validation)) {
      const value = data[field]
      
      if (validations.minLength && value?.length < validations.minLength) {
        return { valid: false, error: `${field} must be at least ${validations.minLength} characters` }
      }
      
      if (validations.maxLength && value?.length > validations.maxLength) {
        return { valid: false, error: `${field} must be at most ${validations.maxLength} characters` }
      }
      
      if (validations.min && value < validations.min) {
        return { valid: false, error: `${field} must be at least ${validations.min}` }
      }
      
      if (validations.max && value > validations.max) {
        return { valid: false, error: `${field} must be at most ${validations.max}` }
      }
      
      if (validations.pattern && !validations.pattern.test(value)) {
        return { valid: false, error: validations.message || `${field} format is invalid` }
      }
    }
  }
  
  return { valid: true }
}

/**
 * Get relationship between two pages
 */
export const getPageRelationship = (page1, page2) => {
  const p1 = PAGE_RELATIONSHIPS[page1]
  const p2 = PAGE_RELATIONSHIPS[page2]
  
  if (!p1 || !p2) return null
  
  // Check if pages share data dependencies
  const sharedData = p1.dataDependencies.filter(dep => p2.dataDependencies.includes(dep))
  
  // Check if pages connect to each other
  const connects = p1.connectsTo?.includes(page2) || p2.connectsTo?.includes(page1)
  
  return {
    sharedData,
    connects,
    relationship: connects ? 'direct' : sharedData.length > 0 ? 'indirect' : 'none'
  }
}

// ============================================
// EXPORT DEFAULT
// ============================================
export default {
  DB_SCHEMA,
  PAGE_RELATIONSHIPS,
  CRUD_OPERATIONS,
  DATA_FLOW,
  BUSINESS_RULES,
  getDependentPages,
  getRefreshTriggers,
  validateCRUD,
  getPageRelationship
}
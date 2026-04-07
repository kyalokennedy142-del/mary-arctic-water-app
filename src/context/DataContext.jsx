import { createContext, useContext, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const DataContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}

export function DataProvider({ children }) {
  // eslint-disable-next-line no-unused-vars
  const [globalLoading, setGlobalLoading] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [globalError, setGlobalError] = useState(null)

  // ✅ HELPER: Safe fetch with RLS error handling (DEFINED HERE)
  const safeFetch = useCallback(async (query, errorMessage = 'Operation failed') => {
    try {
      const { data, error } = await query
      
      if (error) {
        // Handle RLS violation (403)
        if (error.code === '42501' || error.status === 403) {
          console.warn('⚠️ RLS access denied:', errorMessage)
          toast.error('Access denied. Please contact admin.')
          return { data: [], error: null }
        }
        console.error(`${errorMessage}:`, error)
        toast.error(errorMessage + ': ' + error.message)
        return { data: [], error }
      }
      return { data: data || [], error: null }
    } catch (err) {
      console.error(`${errorMessage}:`, err)
      toast.error('Unexpected error: ' + err.message)
      return { data: [], error: err }
    }
  }, [])

  // ✅ HELPER: Sanitize data for database (prevent XSS)
  const sanitizeForDatabase = (data) => {
    const sanitized = {}
    for (const [key, value] of Object.entries(data)) {
      // Skip IDs, numbers, booleans, dates
      if (key.endsWith('_id') || key === 'id' || 
          typeof value === 'number' || 
          typeof value === 'boolean' ||
          value instanceof Date) {
        sanitized[key] = value
      } else if (typeof value === 'string') {
        // Sanitize strings to prevent XSS
        sanitized[key] = value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .trim()
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }

  // ============================================
  // CUSTOMERS
  // ============================================

  const getCustomers = useCallback(async (includeArchived = false) => {
    let query = supabase
      .from('customers')
      .select('id, name, phone, location, is_archived, created_at') // ✅ NO trailing comma
      .order('created_at', { ascending: false })
    
    if (!includeArchived) query = query.eq('is_archived', false)
    
    const { data } = await safeFetch(query, 'Failed to load customers')
    return data
  }, [safeFetch])

  const createCustomer = useCallback(async (customerData) => {
    const sanitized = sanitizeForDatabase(customerData)
    const { data, error } = await safeFetch(
      supabase.from('customers').insert([sanitized]).select().single(),
      'Failed to add customer'
    )
    if (!error) toast.success('Customer added!')
    return data
  }, [safeFetch])

  const updateCustomer = useCallback(async (id, customerData) => {
    if (!id) throw new Error('Invalid customer ID')
    const sanitized = sanitizeForDatabase(customerData)
    const { data, error } = await safeFetch(
      supabase.from('customers').update({ ...sanitized, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
      'Failed to update customer'
    )
    if (!error) toast.success('Customer updated!')
    return data
  }, [safeFetch])

  const archiveCustomer = useCallback(async (id, reason = 'User requested') => {
    if (!id) throw new Error('Invalid customer ID')
    const { data, error } = await safeFetch(
      supabase.from('customers').update({ is_archived: true, archived_at: new Date().toISOString(), archived_reason: reason }).eq('id', id).select().single(),
      'Failed to archive customer'
    )
    if (!error) toast.success('Customer archived!')
    return data
  }, [safeFetch])

  const restoreCustomer = useCallback(async (id) => {
    if (!id) throw new Error('Invalid customer ID')
    const { data, error } = await safeFetch(
      supabase.from('customers').update({ is_archived: false, archived_at: null, archived_reason: null }).eq('id', id).select().single(),
      'Failed to restore customer'
    )
    if (!error) toast.success('Customer restored!')
    return data
  }, [safeFetch])

  const deleteCustomer = useCallback(async (id) => {
    if (!id) throw new Error('Invalid customer ID')
    // Delete related sales first
    await supabase.from('sales').delete().eq('customer_id', id)
    const { error } = await safeFetch(
      supabase.from('customers').delete().eq('id', id),
      'Failed to delete customer'
    )
    if (!error) toast.success('Customer deleted!')
    return !error
  }, [safeFetch])

  // ============================================
  // STOCK
  // ============================================

  const getStock = useCallback(async () => {
    const { data } = await safeFetch(
      supabase.from('stock').select('id, product_name, category, quantity, selling_price, cost_price, reorder_level, is_active').order('product_name'), // ✅ NO trailing comma
      'Failed to load stock'
    )
    return data
  }, [safeFetch])

  const createStock = useCallback(async (stockData) => {
    const stockToInsert = {
      ...sanitizeForDatabase(stockData),
      quantity: parseInt(stockData.quantity) || 0,
      selling_price: parseFloat(stockData.selling_price) || 0,
      cost_price: parseFloat(stockData.cost_price) || 0,
      reorder_level: parseInt(stockData.reorder_level) || 10,
      is_active: stockData.is_active !== false
    }
    const { data, error } = await safeFetch(
      supabase.from('stock').insert([stockToInsert]).select().single(),
      'Failed to add stock'
    )
    if (!error) toast.success('Stock added!')
    return data
  }, [safeFetch])

  const updateStock = useCallback(async (id, stockData) => {
    if (!id) throw new Error('Invalid stock ID')
    const stockToUpdate = Object.entries({
      quantity: stockData.quantity !== undefined ? parseInt(stockData.quantity) : undefined,
      selling_price: stockData.selling_price !== undefined ? parseFloat(stockData.selling_price) : undefined,
      cost_price: stockData.cost_price !== undefined ? parseFloat(stockData.cost_price) : 0,
      reorder_level: stockData.reorder_level !== undefined ? parseInt(stockData.reorder_level) : undefined,
      is_active: stockData.is_active,
      updated_at: new Date().toISOString()
    }).reduce((acc, [key, value]) => { if (value !== undefined) acc[key] = value; return acc }, {})
    
    const { data, error } = await safeFetch(
      supabase.from('stock').update(stockToUpdate).eq('id', id).select().single(),
      'Failed to update stock'
    )
    if (!error) toast.success('Stock updated!')
    return data
  }, [safeFetch])

  const reduceStock = useCallback(async (id, quantitySold) => {
    const { data: current } = await safeFetch(
      supabase.from('stock').select('quantity').eq('id', id).single(),
      'Failed to check stock'
    )
    if (!current || current.quantity < quantitySold) {
      toast.error('Insufficient stock')
      throw new Error('Not enough stock')
    }
    // eslint-disable-next-line no-unused-vars
    const { data, error } = await safeFetch(
      supabase.from('stock').update({ quantity: current.quantity - quantitySold, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
      'Failed to reduce stock'
    )
    return data
  }, [safeFetch])

  // ============================================
  // SALES - Fixed: NO created_at column
  // ============================================

  const getSales = useCallback(async (includeArchived = false) => {
    let query = supabase
      .from('sales')
      .select('id, customer_id, product_id, quantity_sold, price, total, date, is_archived') // ✅ NO created_at, NO trailing comma
      .order('date', { ascending: false })
      .limit(100)
    
    if (!includeArchived) query = query.eq('is_archived', false)
    
    const { data } = await safeFetch(query, 'Failed to load sales')
    return data
  }, [safeFetch])

  const createSale = useCallback(async (saleData) => {
    // Check archived customer
    const { data: customer } = await supabase.from('customers').select('is_archived').eq('id', saleData.customer_id).single()
    if (customer?.is_archived) throw new Error('Cannot record sale for archived customer')
    
    // Insert sale - ✅ NO created_at in select
    const { data: sale, error: saleError } = await safeFetch(
      supabase.from('sales').insert([{ 
        customer_id: saleData.customer_id,
        product_id: saleData.product_id,
        quantity_sold: parseInt(saleData.quantity_sold),
        price: parseFloat(saleData.price),
        total: parseFloat(saleData.total),
        date: saleData.date || new Date().toISOString(),
        notes: saleData.notes || null
      }]).select('id, total, date').single(), // ✅ Only select existing columns
      'Failed to record sale'
    )
    if (saleError) throw saleError
    
    // Reduce stock
    await reduceStock(saleData.product_id, parseInt(saleData.quantity_sold))
    
    toast.success('Sale recorded!')
    return sale
  }, [safeFetch, reduceStock])

  const updateSale = useCallback(async (id, saleData) => {
    if (!id) throw new Error('Invalid sale ID')
    const { data, error } = await safeFetch(
      supabase.from('sales').update({
        ...saleData,
        quantity_sold: saleData.quantity_sold !== undefined ? parseInt(saleData.quantity_sold) : undefined,
        price: saleData.price !== undefined ? parseFloat(saleData.price) : undefined,
        total: saleData.total !== undefined ? parseFloat(saleData.total) : undefined,
        updated_at: new Date().toISOString()
      }).eq('id', id).select().single(),
      'Failed to update sale'
    )
    if (!error) toast.success('Sale updated!')
    return data
  }, [safeFetch])

  const archiveSale = useCallback(async (id, reason = 'User requested') => {
    if (!id) throw new Error('Invalid sale ID')
    const { data, error } = await safeFetch(
      supabase.from('sales').update({ is_archived: true, archived_at: new Date().toISOString(), archived_reason: reason, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
      'Failed to archive sale'
    )
    if (!error) toast.success('Sale archived!')
    return data
  }, [safeFetch])

  const restoreSale = useCallback(async (id) => {
    if (!id) throw new Error('Invalid sale ID')
    const { data, error } = await safeFetch(
      supabase.from('sales').update({ is_archived: false, archived_at: null, archived_reason: null, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
      'Failed to restore sale'
    )
    if (!error) toast.success('Sale restored!')
    return data
  }, [safeFetch])

  const deleteSale = useCallback(async (id) => {
    if (!id) throw new Error('Invalid sale ID')
    const { error } = await safeFetch(
      supabase.from('sales').delete().eq('id', id),
      'Failed to delete sale'
    )
    if (!error) toast.success('Sale deleted!')
    return !error
  }, [safeFetch])

  // ============================================
  // CONTEXT VALUE - Function-based API
  // ============================================

  const value = {
    loading: globalLoading,
    error: globalError,
    // Customers
    getCustomers,
    createCustomer,
    updateCustomer,
    archiveCustomer,
    restoreCustomer,
    deleteCustomer,
    // Stock
    getStock,
    createStock,
    updateStock,
    reduceStock,
    // Sales
    getSales,
    createSale,
    updateSale,
    archiveSale,
    restoreSale,
    deleteSale
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
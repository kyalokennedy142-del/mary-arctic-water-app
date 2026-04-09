/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { debugRLS, debugRLSError, debugSupabase, startTiming, endTiming, addTimingEvent } from '@/lib/debug'
import { toast } from 'sonner'

const DataContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}

export function DataProvider({ children }) {
  const [globalLoading, setGlobalLoading] = useState(false)
  const [globalError, setGlobalError] = useState(null)

  // ✅ HELPER: Safe fetch with RLS error handling
  const safeFetch = useCallback(async (query, errorMessage = 'Operation failed') => {
    const queryKey = `safeFetch-${Math.random().toString(36).substring(7)}`
    startTiming(queryKey)
    addTimingEvent(queryKey, 'safeFetch-start')
    
    try {
      const { data, error } = await query
      addTimingEvent(queryKey, 'query-complete')
      
      if (error) {
        if (error.code === '42501' || error.status === 403) {
          debugRLSError(error, errorMessage)
          debugRLS(`🔐 RLS violation on: ${errorMessage}`, { code: error.code, status: error.status })
          toast.error('Access denied. Please contact admin.')
          endTiming(queryKey)
          return { data: [], error: null }
        }
        debugSupabase(`❌ Query error on ${errorMessage}:`, error)
        toast.error(errorMessage + ': ' + error.message)
        endTiming(queryKey)
        return { data: [], error }
      }
      debugSupabase(`✅ ${errorMessage} - success`)
      endTiming(queryKey)
      return { data: data || [], error: null }
    } catch (err) {
      debugSupabase(`❌ Unexpected error on ${errorMessage}:`, err)
      toast.error('Unexpected error: ' + err.message)
      endTiming(queryKey)
      return { data: [], error: err }
    }
  }, [])

  // ✅ HELPER: Sanitize data for database (prevent XSS)
  const sanitizeForDatabase = (data) => {
    const sanitized = {}
    for (const [key, value] of Object.entries(data)) {
      if (key.endsWith('_id') || key === 'id' || 
          typeof value === 'number' || 
          typeof value === 'boolean' ||
          value instanceof Date) {
        sanitized[key] = value
      } else if (typeof value === 'string') {
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
      .select('id, name, phone, location, is_archived, created_at')
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
      supabase.from('stock').select('id, product_name, category, quantity, selling_price, cost_price, reorder_level, is_active').order('product_name'),
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
    const { data, error } = await safeFetch(
      supabase.from('stock').update({ quantity: current.quantity - quantitySold, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
      'Failed to reduce stock'
    )
    return data
  }, [safeFetch])

  // ============================================
  // SALES - ✅ FIXED: Include product_name in select
  // ============================================

  const getSales = useCallback(async (includeArchived = false) => {
    let query = supabase
      .from('sales')
      // ✅ FIXED: Added product_name, customer_name and notes to select
      .select('id, customer_id, customer_name, product_id, product_name, quantity_sold, price, total, date, is_archived, notes')
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
    
    // ✅ FIXED: Ensure product_name is included in insert and select
    const { data: sale, error: saleError } = await safeFetch(
      supabase.from('sales').insert([{ 
        customer_id: saleData.customer_id,
        product_id: saleData.product_id,
        product_name: saleData.product_name || 'Unknown Product', // ✅ Save product_name
        quantity_sold: parseInt(saleData.quantity_sold),
        price: parseFloat(saleData.price),
        total: parseFloat(saleData.total),
        date: saleData.date || new Date().toISOString(),
        notes: saleData.notes || null
      }]).select('id, product_name, total, date, notes').single(), // ✅ Select product_name
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
        product_name: saleData.product_name, // ✅ Keep product_name on update
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
  // PARALLEL DATA LOADING - ✅ NEW: Fetch all data at once
  // ============================================
  
  const loadAllData = useCallback(async () => {
    setGlobalLoading(true)
    startTiming('loadAllData')
    addTimingEvent('loadAllData', 'parallel-fetch-start')
    
    try {
      // ✅ Fetch all data in parallel, not sequentially
      const [customersData, stockData, salesData] = await Promise.all([
        getCustomers(),
        getStock(),
        getSales()
      ])
      
      addTimingEvent('loadAllData', 'parallel-fetch-complete')
      endTiming('loadAllData')
      setGlobalLoading(false)
      
      return { customers: customersData, stock: stockData, sales: salesData }
    } catch (error) {
      debugSupabase(`❌ Error loading all data:`, error)
      setGlobalError(error.message)
      setGlobalLoading(false)
      endTiming('loadAllData')
      return { customers: [], stock: [], sales: [] }
    }
  }, [getCustomers, getStock, getSales])

  // ============================================
  // CONTEXT VALUE
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
    deleteSale,
    // ✅ NEW: Parallel loading
    loadAllData
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
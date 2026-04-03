// src/context/DataContext.jsx
import { createContext, useContext, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

// Create context
const DataContext = createContext(null)

// Custom hook to use the context
// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}

// Provider component
export function DataProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ============================================
  // CUSTOMERS - With Archive Support
  // ============================================

  const getCustomers = async (includeArchived = false) => {
    try {
      let query = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!includeArchived) {
        query = query.eq('is_archived', false)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching customers:', err)
      toast.error('Failed to load customers')
      return []
    }
  }

  const getArchivedCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_archived', true)
        .order('archived_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching archived customers:', err)
      return []
    }
  }

  const createCustomer = async (customerData) => {
    try {
      console.log('📦 Creating customer:', customerData)
      const { data, error } = await supabase
        .from('customers')
        .insert([{ 
          ...customerData,
          is_archived: false
        }])
        .select()
        .single()
      
      if (error) {
        console.error('❌ Supabase create error:', error)
        throw error
      }
      console.log('✅ Customer created:', data)
      toast.success('Customer added successfully!')
      return data
    } catch (err) {
      console.error('❌ createCustomer error:', err)
      toast.error('Failed to add customer: ' + err.message)
      throw err
    }
  }

  const updateCustomer = async (id, customerData) => {
    console.log('📦 DataContext updateCustomer called:', { id, customerData })
    
    if (!id || id === 'undefined' || id === 'null' || id === null) {
      console.error('❌ Invalid customer ID:', id)
      throw new Error('Invalid customer ID: ' + id)
    }
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...customerData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      console.log('📦 Supabase update response:', { data, error })
      
      if (error) {
        console.error('❌ Supabase update error:', error)
        throw new Error(error.message)
      }
      
      console.log('✅ Customer updated:', data)
      toast.success('Customer updated successfully!')
      return data
    } catch (err) {
      console.error('❌ updateCustomer error:', err)
      toast.error('Failed to update customer: ' + err.message)
      throw err
    }
  }

  const archiveCustomer = async (id, reason = 'User requested') => {
    try {
      console.log('🗃️ Archiving customer:', id, reason)
      
      if (!id || id === 'undefined' || id === 'null' || id === null) {
        throw new Error('Invalid customer ID: ' + id)
      }
      
      const { data, error } = await supabase
        .from('customers')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_reason: reason
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      console.log('✅ Customer archived:', data)
      toast.success('Customer archived! History preserved but excluded from reports.')
      return true
    } catch (err) {
      console.error('❌ archiveCustomer error:', err)
      toast.error('Failed to archive: ' + err.message)
      throw err
    }
  }

  const restoreCustomer = async (id) => {
    try {
      console.log('🔄 Restoring customer:', id)
      
      const { data, error } = await supabase
        .from('customers')
        .update({
          is_archived: false,
          archived_at: null,
          archived_reason: null
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      console.log('✅ Customer restored:', data)
      toast.success('Customer restored! Now included in reports.')
      return true
    } catch (err) {
      console.error('❌ restoreCustomer error:', err)
      toast.error('Failed to restore: ' + err.message)
      throw err
    }
  }

  const deleteCustomer = async (id) => {
    try {
      console.log('🗑️ HARD DELETE customer:', id, '- USE WITH CAUTION')
      
      if (!id || id === 'undefined' || id === 'null' || id === null) {
        throw new Error('Invalid customer ID: ' + id)
      }
      
      // First delete related sales to satisfy foreign key
      await supabase.from('sales').delete().eq('customer_id', id)
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Customer permanently deleted!')
      return true
    } catch (err) {
      console.error('❌ deleteCustomer error:', err)
      toast.error('Failed to delete: ' + err.message)
      throw err
    }
  }

  // ============================================
  // PRODUCTS
  // ============================================

  const getProducts = async (category = null) => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
      
      if (category) {
        query = query.eq('category', category)
      }
      
      const { data, error } = await query.order('name')
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching products:', err)
      return []
    }
  }

  // ============================================
  // STOCK - With cost_price fix
  // ============================================

  const getStock = async () => {
    try {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .order('product_name')
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching stock:', err)
      return []
    }
  }

  const createStock = async (stockData) => {
    try {
      // ✅ Ensure numeric fields are properly typed
      const stockToInsert = {
        ...stockData,
        quantity: parseInt(stockData.quantity) || 0,
        selling_price: parseFloat(stockData.selling_price) || 0,
        cost_price: parseFloat(stockData.cost_price) || 0,
        reorder_level: parseInt(stockData.reorder_level) || 10,
        is_active: stockData.is_active !== false
      }
      
      const { data, error } = await supabase
        .from('stock')
        .insert([stockToInsert])
        .select()
        .single()
      
      if (error) throw error
      toast.success('Stock item added successfully!')
      return data
    } catch (err) {
      console.error('Error creating stock:', err)
      toast.error('Failed to add stock: ' + err.message)
      throw err
    }
  }

  // ✅ FIXED: updateStock with cost_price handling
  const updateStock = async (id, stockData) => {
    console.log('📦 DataContext updateStock called:', { id, stockData })
    
    if (!id || id === 'undefined' || id === 'null' || id === null) {
      throw new Error('Invalid stock ID: ' + id)
    }
    
    try {
      // ✅ Ensure all numeric fields are properly typed for Supabase
      const stockToUpdate = {
        ...stockData,
        // Ensure numeric fields are numbers, not strings
        quantity: stockData.quantity !== undefined ? parseInt(stockData.quantity) : undefined,
        selling_price: stockData.selling_price !== undefined ? parseFloat(stockData.selling_price) : undefined,
        cost_price: stockData.cost_price !== undefined ? parseFloat(stockData.cost_price) : 0, // ✅ Default to 0 if missing
        reorder_level: stockData.reorder_level !== undefined ? parseInt(stockData.reorder_level) : undefined,
        is_active: stockData.is_active !== undefined ? stockData.is_active : undefined,
        // Always update timestamp
        updated_at: new Date().toISOString()
      }
      
      // Remove undefined values to avoid Supabase errors
      Object.keys(stockToUpdate).forEach(key => {
        if (stockToUpdate[key] === undefined) {
          delete stockToUpdate[key]
        }
      })
      
      const { data, error } = await supabase
        .from('stock')
        .update(stockToUpdate)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Supabase update error:', error)
        throw new Error(error.message)
      }
      
      console.log('✅ Stock updated:', data)
      toast.success('Stock updated successfully!')
      return data
    } catch (err) {
      console.error('❌ updateStock error:', err)
      toast.error('Failed to update stock: ' + err.message)
      throw err
    }
  }

  const reduceStock = async (id, quantitySold) => {
    try {
      const { data: current, error: fetchError } = await supabase
        .from('stock')
        .select('quantity')
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      if (current.quantity < quantitySold) {
        throw new Error(`Only ${current.quantity} units available`)
      }

      const { data: updated, error: updateError } = await supabase
        .from('stock')
        .update({ 
          quantity: current.quantity - quantitySold,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      return updated
    } catch (err) {
      console.error('Error reducing stock:', err)
      toast.error('Failed to update stock: ' + err.message)
      throw err
    }
  }

  // ============================================
  // SALES - Full Management
  // ============================================

  const getSales = async (includeArchived = false) => {
    try {
      let query = supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false })
      
      if (!includeArchived) {
        query = query.eq('is_archived', false)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching sales:', err)
      return []
    }
  }

  const getSalesByCustomer = async (customerId, includeArchived = false) => {
    try {
      if (!includeArchived) {
        const { data: customer } = await supabase
          .from('customers')
          .select('is_archived')
          .eq('id', customerId)
          .single()
        
        if (customer?.is_archived) {
          console.log('⚠️ Customer is archived, returning empty sales')
          return []
        }
      }
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching customer sales:', err)
      return []
    }
  }

  const createSale = async (saleData) => {
    try {
      console.log('🛒 Creating sale:', saleData)
      
      const { data: customer } = await supabase
        .from('customers')
        .select('is_archived')
        .eq('id', saleData.customer_id)
        .single()
      
      if (customer?.is_archived) {
        throw new Error('Cannot record sale for archived customer')
      }
      
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{ 
          ...saleData,
          quantity_sold: parseInt(saleData.quantity_sold),
          price: parseFloat(saleData.price),
          total: parseFloat(saleData.total)
        }])
        .select()
        .single()
      
      if (saleError) throw saleError

      await reduceStock(saleData.product_id, saleData.quantity_sold)

      console.log('✅ Sale recorded:', sale)
      toast.success('Sale recorded and stock updated!')
      return sale
    } catch (err) {
      console.error('❌ createSale error:', err)
      toast.error('Failed to record sale: ' + err.message)
      throw err
    }
  }

  const updateSale = async (id, saleData) => {
    console.log('📦 DataContext updateSale called:', { id, saleData })
    
    if (!id || id === 'undefined' || id === 'null' || id === null) {
      throw new Error('Invalid sale ID: ' + id)
    }
    
    try {
      const { data, error } = await supabase
        .from('sales')
        .update({
          ...saleData,
          quantity_sold: saleData.quantity_sold !== undefined ? parseInt(saleData.quantity_sold) : undefined,
          price: saleData.price !== undefined ? parseFloat(saleData.price) : undefined,
          total: saleData.total !== undefined ? parseFloat(saleData.total) : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      console.log('✅ Sale updated:', data)
      toast.success('Sale updated successfully!')
      return data
    } catch (err) {
      console.error('❌ updateSale error:', err)
      toast.error('Failed to update sale: ' + err.message)
      throw err
    }
  }

  const archiveSale = async (id, reason = 'User requested') => {
    console.log('🗃️ DataContext archiveSale called:', { id, reason })
    
    if (!id || id === 'undefined' || id === 'null' || id === null) {
      throw new Error('Invalid sale ID: ' + id)
    }
    
    try {
      const { data, error } = await supabase
        .from('sales')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      console.log('✅ Sale archived:', data)
      toast.success('Sale archived! Record preserved but excluded from reports.')
      return true
    } catch (err) {
      console.error('❌ archiveSale error:', err)
      toast.error('Failed to archive sale: ' + err.message)
      throw err
    }
  }

  const restoreSale = async (id) => {
    console.log('🔄 DataContext restoreSale called:', id)
    
    if (!id || id === 'undefined' || id === 'null' || id === null) {
      throw new Error('Invalid sale ID: ' + id)
    }
    
    try {
      const { data, error } = await supabase
        .from('sales')
        .update({
          is_archived: false,
          archived_at: null,
          archived_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      console.log('✅ Sale restored:', data)
      toast.success('Sale restored! Now included in reports.')
      return true
    } catch (err) {
      console.error('❌ restoreSale error:', err)
      toast.error('Failed to restore sale: ' + err.message)
      throw err
    }
  }

  const deleteSale = async (id) => {
    console.log('🗑️ DataContext deleteSale called:', id)
    
    if (!id || id === 'undefined' || id === 'null' || id === null) {
      throw new Error('Invalid sale ID: ' + id)
    }
    
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      console.log('✅ Sale permanently deleted:', id)
      toast.success('Sale permanently deleted!')
      return true
    } catch (err) {
      console.error('❌ deleteSale error:', err)
      toast.error('Failed to delete sale: ' + err.message)
      throw err
    }
  }

  // ============================================
  // SEED INITIAL DATA
  // ============================================

  const seedInitialData = async () => {
    try {
      const { count } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
      
      if (count > 0) {
        console.log('✅ Data already exists in Supabase')
        setLoading(false)
        return
      }

      await supabase.from('customers').insert([
        { name: 'John Mwangi', phone: '+254712345678', location: 'Nairobi CBD' },
        { name: 'Sarah Ochieng', phone: '+254798765432', location: 'Westlands' },
        { name: 'David Kamau', phone: '+254711223344', location: 'Kilimani' }
      ])

      console.log('🌱 Sample customers seeded to Supabase')
      setLoading(false)
    } catch (err) {
      console.error('Error seeding data:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = {
    loading,
    error,
    // Customers
    getCustomers,
    getArchivedCustomers,
    createCustomer,
    updateCustomer,
    archiveCustomer,
    restoreCustomer,
    deleteCustomer,
    // Products
    getProducts,
    // Stock
    getStock,
    createStock,
    updateStock,  // ✅ Now includes cost_price fix
    reduceStock,
    // Sales
    getSales,
    getSalesByCustomer,
    createSale,
    updateSale,
    archiveSale,
    restoreSale,
    deleteSale,
    // Seed
    seedInitialData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
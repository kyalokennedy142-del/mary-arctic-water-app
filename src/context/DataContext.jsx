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

  // ✅ Get ONLY active (non-archived) customers by default
  const getCustomers = async (includeArchived = false) => {
    try {
      let query = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      
      // ✅ Exclude archived unless explicitly requested
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

  // ✅ Get ONLY archived customers (for admin views)
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
          is_archived: false // ✅ Explicitly set as active
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

  // ✅ Update customer with ID validation
  const updateCustomer = async (id, customerData) => {
    console.log('📦 DataContext updateCustomer called:', { id, customerData })
    
    // ✅ Validate ID before proceeding
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

  // ✅ ARCHIVE customer (soft delete) - excludes from ALL calculations
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

  // ✅ Un-archive customer (restore to active)
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

  // ⚠️ Hard delete (use with caution - only for test data)
  // Deletes customer AND related sales to satisfy foreign key
  const deleteCustomer = async (id) => {
    try {
      console.log('🗑️ HARD DELETE customer:', id, '- USE WITH CAUTION')
      
      if (!id || id === 'undefined' || id === 'null' || id === null) {
        throw new Error('Invalid customer ID: ' + id)
      }
      
      // ⚠️ First delete related sales to satisfy foreign key constraint
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
  // SALES - Exclude archived customers from queries
  // ============================================

  const getSales = async (includeArchivedCustomers = false) => {
    try {
      let query = supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false })
      
      // ✅ Exclude sales from archived customers unless requested
      if (!includeArchivedCustomers) {
        // Join with customers table and filter
        query = query
          .select(`
            *,
            customer:customers (
              id,
              name,
              is_archived
            )
          `)
          .filter('customer.is_archived', 'eq', false)
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
      // ✅ Check if customer is archived (unless explicitly including archived)
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
      
      // ✅ Check if customer is archived before allowing sale
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
        .insert([{ ...saleData }])
        .select()
        .single()
      
      if (saleError) throw saleError

      // Reduce stock after successful sale
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

  // ============================================
  // STOCK (unchanged)
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
      const { data, error } = await supabase
        .from('stock')
        .insert([{ ...stockData }])
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

  const reduceStock = async (id, quantitySold) => {
    try {
      // Get current quantity
      const { data: current, error: fetchError } = await supabase
        .from('stock')
        .select('quantity')
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      if (current.quantity < quantitySold) {
        throw new Error(`Only ${current.quantity} units available`)
      }

      // Update quantity
      const { data: updated, error: updateError } = await supabase
        .from('stock')
        .update({ quantity: current.quantity - quantitySold })
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
  // PRODUCTS (unchanged)
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
  // SEED INITIAL DATA (unchanged)
  // ============================================

  const seedInitialData = async () => {
    try {
      // Check if customers already exist
      const { count } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
      
      if (count > 0) {
        console.log('✅ Data already exists in Supabase')
        setLoading(false)
        return
      }

      // Seed sample customers
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
  // CONTEXT VALUE - Export all functions
  // ============================================

  const value = {
    loading,
    error,
    // Customers
    getCustomers,
    getArchivedCustomers,
    createCustomer,
    updateCustomer,
    archiveCustomer,    // ✅ NEW: Soft delete (archive)
    restoreCustomer,    // ✅ NEW: Undo archive
    deleteCustomer,     // ⚠️ Hard delete (use with caution)
    // Products
    getProducts,
    // Stock
    getStock,
    createStock,
    reduceStock,
    // Sales
    getSales,
    getSalesByCustomer,
    createSale,
    // Seed
    seedInitialData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
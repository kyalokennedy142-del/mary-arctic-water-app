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
  // CUSTOMERS
  // ============================================

  const getCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching customers:', err)
      toast.error('Failed to load customers')
      return []
    }
  }

  const createCustomer = async (customerData) => {
    try {
      console.log('📦 Creating customer:', customerData)
      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customerData }])
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

  // ✅ FIXED: Single updateCustomer with ID validation
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

  const deleteCustomer = async (id) => {
    try {
      console.log('🗑️ Deleting customer:', id)
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Customer deleted successfully!')
      return true
    } catch (err) {
      console.error('❌ deleteCustomer error:', err)
      toast.error('Failed to delete customer: ' + err.message)
      throw err
    }
  }

  // ============================================
  // PRODUCTS (Mary Arctic Water - 31 Products)
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
  // STOCK
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
  // SALES
  // ============================================

  const getSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching sales:', err)
      return []
    }
  }

  const getSalesByCustomer = async (customerId) => {
    try {
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
      
      // Create sale record
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{ ...saleData }])
        .select()
        .single()
      
      if (saleError) throw saleError

      // Reduce stock
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
  // SEED INITIAL DATA
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
  // CONTEXT VALUE
  // ============================================

  const value = {
    loading,
    error,
    // Customers
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
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
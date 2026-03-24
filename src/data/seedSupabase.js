import { supabase } from '@/lib/supabaseClient'
import { MARY_ARCTIC_PRODUCTS, PRODUCT_CATEGORIES } from './products'

/**
 * Seed Mary Arctic Water products to Supabase
 * Run this once to populate your database
 */
export const seedProductsToSupabase = async () => {
  try {
    console.log('🌱 Seeding Mary Arctic Water products...')

    // Check if products already exist
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    if (count > 0) {
      console.log(`✅ ${count} products already exist, skipping seed`)
      return
    }

    // Insert products
    const productsToInsert = MARY_ARCTIC_PRODUCTS.map(p => ({
      category: p.category,
      name: p.name,
      description: p.description,
      price: p.price,
      unit: p.unit,
      is_active: true
    }))

    const { data, error } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select()

    if (error) throw error

    console.log(`✅ Seeded ${data.length} products to Supabase`)

    // Also seed initial stock entries
    const stockToInsert = MARY_ARCTIC_PRODUCTS.map(p => ({
      product_name: p.name,
      quantity: Math.floor(Math.random() * 100) + 10, // Random 10-110 units
      selling_price: p.price,
      category: p.category
    }))

    await supabase.from('stock').insert(stockToInsert)
    console.log('✅ Seeded initial stock levels')

    return { success: true, count: data.length }

  } catch (err) {
    console.error('❌ Failed to seed products:', err.message)
    throw err
  }
}

/**
 * Seed sample customers to Supabase
 */
export const seedCustomersToSupabase = async () => {
  try {
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
    
    if (count > 0) {
      console.log(`✅ ${count} customers already exist`)
      return
    }

    const sampleCustomers = [
      { name: 'John Mwangi', phone: '+254712345678', location: 'Nairobi CBD' },
      { name: 'Sarah Ochieng', phone: '+254798765432', location: 'Westlands' },
      { name: 'David Kamau', phone: '+254711223344', location: 'Kilimani' }
    ]

    await supabase.from('customers').insert(sampleCustomers)
    console.log('✅ Seeded 3 sample customers')

  } catch (err) {
    console.error('❌ Failed to seed customers:', err.message)
  }
}
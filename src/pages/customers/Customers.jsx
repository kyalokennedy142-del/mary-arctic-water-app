import { useState, useEffect } from 'react'
import { Users, UserPlus, Phone, MapPin, Pencil, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useData } from "@/context/DataContext"
import CustomerSales from "./CustomerSales"
import { toast } from "sonner"

export default function Customers() {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({ name: "", phone: "", location: "" })
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  // eslint-disable-next-line no-unused-vars
  const { getCustomers, createCustomer, updateCustomer, deleteCustomer, getSalesByCustomer } = useData()

  // ✅ DEFINE loadCustomers FIRST (before useEffect)
  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await getCustomers()
      setCustomers(data || [])
    } catch (err) {
      console.error('Failed to load customers:', err)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ THEN use it in useEffect
  useEffect(() => {
    loadCustomers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone) {
      toast.error("Name and Phone are required")
      return
    }

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData)
        setEditingCustomer(null)
      } else {
        await createCustomer(formData)
      }
      setFormData({ name: "", phone: "", location: "" })
      await loadCustomers()
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Error already shown by DataContext
    }
  }

  const handleCardClick = (customerId) => {
    setSelectedCustomerId(customerId)
  }

  const handleEditClick = (customer, e) => {
    e.stopPropagation()
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone,
      location: customer.location || ""
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteClick = async (customer, e) => {
    e.stopPropagation()
    if (window.confirm(`Delete ${customer.name}?`)) {
      try {
        await deleteCustomer(customer.id)
        if (selectedCustomerId === customer.id) setSelectedCustomerId(null)
        await loadCustomers()
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        // Error already shown
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingCustomer(null)
    setFormData({ name: "", phone: "", location: "" })
  }

  const selectedCustomer = customers?.find?.(c => c.id === selectedCustomerId)

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border/50">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary-light/20 flex items-center justify-center shadow-sm">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage your customer base</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      <Card className="rounded-2xl border bg-card shadow-soft animate-slide-up">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            {editingCustomer ? <Pencil className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
            {editingCustomer ? 'Edit Customer' : 'Add Customer'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input id="name" name="name" placeholder="Full name" value={formData.name} onChange={handleInputChange} className="input-enhanced rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                <Input id="phone" name="phone" placeholder="+254..." value={formData.phone} onChange={handleInputChange} className="input-enhanced rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input id="location" name="location" placeholder="Address / area" value={formData.location} onChange={handleInputChange} className="input-enhanced rounded-xl" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="btn-primary-gradient rounded-xl px-6" disabled={loading}>
                {editingCustomer ? 'Update Customer' : 'Add Customer'}
              </Button>
              {editingCustomer && (
                <Button type="button" variant="outline" onClick={handleCancelEdit} className="rounded-xl px-6 border-border">Cancel</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sales Panel */}
      {selectedCustomerId && selectedCustomer && (
        <div className="animate-slide-up">
          <CustomerSales customer={selectedCustomer} onClose={() => setSelectedCustomerId(null)} />
        </div>
      )}

      {/* Customer Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">All Customers ({customers?.length || 0})</h2>
        
        {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div></div>}
        
        {!loading && customers?.length === 0 && (
          <div className="text-center text-muted-foreground py-12 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">No customers yet</p>
            <p className="text-sm">Add your first customer above, or seed sample data.</p>
            <Button 
              onClick={async () => {
                // Seed sample customers directly to Supabase
                const { supabase } = await import('@/lib/supabaseClient')
                await supabase.from('customers').insert([
                  { name: 'John Mwangi', phone: '+254712345678', location: 'Nairobi CBD' },
                  { name: 'Sarah Ochieng', phone: '+254798765432', location: 'Westlands' },
                  { name: 'David Kamau', phone: '+254711223344', location: 'Kilimani' }
                ])
                toast.success('Sample customers added!')
                loadCustomers()
              }} 
              variant="outline" 
              className="mt-4 rounded-xl"
            >
              Add Sample Customers
            </Button>
          </div>
        )}
        
        {!loading && customers?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer, index) => (
              <div
                key={customer.id}
                onClick={() => handleCardClick(customer.id)}
                className={`cursor-pointer rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-elevated hover:border-primary/30 hover:-translate-y-0.5 ${selectedCustomerId === customer.id ? 'ring-2 ring-primary/30 border-primary shadow-elevated' : 'border-border/50'}`}
                style={{ animation: `fadeIn 0.4s ease-out ${index * 0.05}s both` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary/15 to-primary-light/15 flex items-center justify-center shrink-0 shadow-sm">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span className="truncate">{customer.phone}</span>
                    </div>
                    {customer.location && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span className="truncate">{customer.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                  <Button size="sm" variant="outline" onClick={(e) => handleEditClick(customer, e)} className="flex-1 h-8 text-xs rounded-lg">
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={(e) => handleDeleteClick(customer, e)} className="flex-1 h-8 text-xs rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10">
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
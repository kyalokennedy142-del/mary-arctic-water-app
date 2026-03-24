import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Pencil } from 'lucide-react'

export default function CustomerForm({ onSubmit, editingCustomer, onCancel }) {
  const [form, setForm] = useState({ name: '', phone: '', location: '' })
  const [loading, setLoading] = useState(false)

  // Populate form when editing
  useState(() => {
    if (editingCustomer) {
      setForm({
        name: editingCustomer.name,
        phone: editingCustomer.phone,
        location: editingCustomer.location || ''
      })
    }
  }, [editingCustomer])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(form)
    setForm({ name: '', phone: '', location: '' })
    setLoading(false)
  }

  const handleCancel = () => {
    setForm({ name: '', phone: '', location: '' })
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4">
      <h3 className="text-base font-semibold flex items-center gap-2">
        {editingCustomer ? (
          <>
            <Pencil className="w-4 h-4 text-primary" />
            Edit Customer
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 text-primary" />
            Add Customer
          </>
        )}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Address / area"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 rounded-xl px-6">
          {loading ? (editingCustomer ? 'Updating...' : 'Adding...') : (editingCustomer ? 'Update Customer' : 'Add Customer')}
        </Button>
        
        {editingCustomer && (
          <Button type="button" variant="outline" onClick={handleCancel} className="rounded-xl px-6">
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
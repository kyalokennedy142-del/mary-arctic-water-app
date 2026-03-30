"use client"

import { useState, useEffect, useCallback } from 'react'
import { UserPlus, Pencil, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function CustomerForm({ 
  onSubmit, 
  editingCustomer, 
  onCancel,
  loading = false 
}) {
  const [form, setForm] = useState({ name: '', phone: '', location: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (editingCustomer) {
      setForm({
        name: editingCustomer.name || '',
        phone: editingCustomer.phone || '',
        location: editingCustomer.location || ''
      })
      setErrors({})
    }
  }, [editingCustomer])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }, [errors])

  const validateForm = useCallback(() => {
    const newErrors = {}
    
    // ✅ Name validation
    if (!form.name || form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    // ✅ Phone validation - FIXED: Use inline regex, not external reference
    const phoneRegex = /^\+?254\d{9}$/
    const cleanPhone = form.phone.replace(/\s/g, '')
    
    if (!form.phone || !phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Phone must be Kenyan format: +254XXXXXXXXX'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    console.log('📝 Form submit triggered', form)
    
    if (!validateForm()) {
      console.log('❌ Validation failed', errors)
      toast.error('Please fix the errors in the form')
      return
    }

    setIsSubmitting(true)
    console.log('🔄 Submitting to onSubmit...', form)
    
    try {
      const success = await onSubmit(form)
      console.log('✅ onSubmit returned:', success)
      
      if (success !== false) {
        toast.success(editingCustomer ? 'Customer updated!' : 'Customer added!')
        setForm({ name: '', phone: '', location: '' })
        setErrors({})
      }
    } catch (err) {
      console.error('❌ Form submit error:', err)
      toast.error('Failed to save customer: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }, [form, errors, onSubmit, editingCustomer, validateForm])

  const handleCancel = useCallback(() => {
    setForm({ name: '', phone: '', location: '' })
    setErrors({})
    onCancel?.()
  }, [onCancel])

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-border/20">
        {editingCustomer ? (
          <>
            <Pencil className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold">Edit Customer</h3>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold">Add Customer</h3>
          </>
        )}
      </div>
      
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
          <Input
            id="name"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleInputChange}
            className={`rounded-xl ${errors.name ? 'border-destructive' : ''}`}
            disabled={isSubmitting || loading}
          />
          {errors.name && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.name}
            </p>
          )}
        </div>
        
        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+254712345678"
            value={form.phone}
            onChange={handleInputChange}
            className={`rounded-xl ${errors.phone ? 'border-destructive' : ''}`}
            disabled={isSubmitting || loading}
          />
          {errors.phone && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.phone}
            </p>
          )}
        </div>
        
        {/* Location */}
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="Address / area"
            value={form.location}
            onChange={handleInputChange}
            className="rounded-xl"
            disabled={isSubmitting || loading}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button 
          type="submit" 
          disabled={isSubmitting || loading} 
          className="btn-primary-gradient rounded-xl px-6 min-w-35"
        >
          {isSubmitting || loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {editingCustomer ? 'Updating...' : 'Adding...'}
            </span>
          ) : (
            editingCustomer ? 'Update Customer' : 'Add Customer'
          )}
        </Button>
        
        {editingCustomer && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel} 
            className="rounded-xl px-6"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
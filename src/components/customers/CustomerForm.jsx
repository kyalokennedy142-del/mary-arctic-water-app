"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { validateCRUD, BUSINESS_RULES } from '@/config/crudOperations'

export default function CustomerForm({ 
  onSubmit, 
  editingCustomer, 
  onCancel,
  loading = false,
  autoFillData = null 
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

  // Auto-fill from sales data if provided
  useEffect(() => {
    if (autoFillData?.name || autoFillData?.phone) {
      setForm(prev => ({
        ...prev,
        name: autoFillData.name || prev.name,
        phone: autoFillData.phone || prev.phone
      }))
    }
  }, [autoFillData])

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
    
    // CRUD validation
    const crudValidation = validateCRUD('customers:create', form)
    if (!crudValidation.valid) {
      newErrors.general = crudValidation.error
    }
    
    // Phone format validation (Kenyan format)
    if (form.phone && !BUSINESS_RULES.customerPhoneFormat.test(form.phone)) {
      newErrors.phone = 'Phone must be Kenyan format: +254XXXXXXXXX'
    }
    
    // Name validation
    if (form.name && form.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      if (errors.general) {
        toast.error(errors.general)
      }
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit(form)
      toast.success(editingCustomer ? 'Customer updated!' : 'Customer added!')
      setForm({ name: '', phone: '', location: '' })
      setErrors({})
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error('Failed to save customer')
    } finally {
      setIsSubmitting(false)
    }
  }, [form, errors, onSubmit, editingCustomer, validateForm])

  const handleCancel = useCallback(() => {
    setForm({ name: '', phone: '', location: '' })
    setErrors({})
    onCancel?.()
  }, [onCancel])

  // Keyboard shortcuts: Ctrl+Enter to save, Esc to cancel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editingCustomer) {
        handleCancel()
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSubmit(e)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingCustomer, handleCancel, handleSubmit])

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-border/50">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
          <Input
            id="name"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleInputChange}
            className={`rounded-xl ${errors.name ? 'border-destructive focus:ring-destructive/20' : ''}`}
            required
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        
        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+254XXXXXXXXX"
            value={form.phone}
            onChange={handleInputChange}
            className={`rounded-xl ${errors.phone ? 'border-destructive focus:ring-destructive/20' : ''}`}
            required
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
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
          />
        </div>
      </div>

      {/* General Error */}
      {errors.general && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          {errors.general}
        </p>
      )}

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
      
      {/* Keyboard Shortcuts Hint */}
      <p className="text-xs text-muted-foreground pt-2 border-t border-border/30">
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+Enter</kbd> to save, 
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] ml-1">Esc</kbd> to cancel
      </p>
    </form>
  )
}
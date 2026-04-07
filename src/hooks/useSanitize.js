import { useCallback } from 'react'
import { sanitizeInput } from '@/lib/sanitize'

// ✅ Reusable hook for sanitizing form inputs
export const useSanitize = () => {
  
  // Sanitize a single value
  const sanitize = useCallback((value) => {
    if (typeof value !== 'string') return value
    return sanitizeInput(value)
  }, [])
  
  // Sanitize an entire form object
  const sanitizeForm = useCallback((formData) => {
    const sanitized = {}
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value)
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(v => typeof v === 'string' ? sanitizeInput(v) : v)
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sanitize])
  
  // Sanitize and validate email
  const sanitizeEmail = useCallback((email) => {
    const sanitized = sanitizeInput(email).toLowerCase()
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)
    return { value: sanitized, isValid }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sanitize])
  
  // Sanitize and validate phone (Kenya format)
  const sanitizePhone = useCallback((phone) => {
    const sanitized = sanitizeInput(phone).replace(/\s/g, '')
    const isValid = /^(\+254|0)?[79]\d{8}$/.test(sanitized)
    return { value: sanitized, isValid }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sanitize])
  
  return {
    sanitize,
    sanitizeForm,
    sanitizeEmail,
    sanitizePhone
  }
}
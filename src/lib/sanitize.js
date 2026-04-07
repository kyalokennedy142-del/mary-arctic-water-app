// ✅ Sanitize user input to prevent XSS attacks
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

// ✅ Validate email format
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// ✅ Validate password strength
export const validatePassword = (password) => {
  const errors = []
  let strength = 0
  
  // Length check
  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 25
  else if (password.length < 8) errors.push('At least 8 characters')
  
  // Character type checks
  if (/[A-Z]/.test(password)) { strength += 15 } else { errors.push('One uppercase letter') }
  if (/[a-z]/.test(password)) { strength += 15 }
  if (/[0-9]/.test(password)) { strength += 10 } else { errors.push('One number') }
  if (/[^A-Za-z0-9]/.test(password)) { strength += 10 } else { errors.push('One special character (!@#$%^&*)') }
  
  return {
    valid: errors.length === 0,
    errors,
    strength: Math.min(strength, 100)
  }
}

// ✅ Validate phone number (Kenya format)
export const validatePhone = (phone) => {
  const regex = /^(\+254|0)?[79]\d{8}$/
  return regex.test(phone.replace(/\s/g, ''))
}
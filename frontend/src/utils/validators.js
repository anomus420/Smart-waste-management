export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return { valid: false, message: 'Email is required' }
  if (!re.test(email)) return { valid: false, message: 'Please enter a valid email address' }
  return { valid: true, message: '' }
}

export const validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Password is required' }
  if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' }
  return { valid: true, message: '' }
}

export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { valid: false, message: `${fieldName} is required` }
  }
  return { valid: true, message: '' }
}

export const validateMinLength = (value, min, fieldName = 'This field') => {
  if (!value || value.length < min) {
    return { valid: false, message: `${fieldName} must be at least ${min} characters` }
  }
  return { valid: true, message: '' }
}

export const validatePhone = (phone) => {
  if (!phone) return { valid: false, message: 'Phone number is required' }
  const re = /^[0-9+\-\s()]{7,15}$/
  if (!re.test(phone)) return { valid: false, message: 'Please enter a valid phone number' }
  return { valid: true, message: '' }
}
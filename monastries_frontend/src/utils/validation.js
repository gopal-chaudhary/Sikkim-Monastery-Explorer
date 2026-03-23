// Client-side validation matching backend (utils/validation.js + User model)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Strong password: min 8 chars, 1 lower, 1 upper, 1 number, 1 symbol
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export function validateSignup({ firstName, lastName, emailId, password }) {
  const errors = {}
  if (!firstName?.trim()) errors.firstName = 'First name is required'
  else if (firstName.trim().length < 3 || firstName.trim().length > 50)
    errors.firstName = 'First name must be 3 to 50 characters'
  if (!lastName?.trim()) errors.lastName = 'Last name is required'
  if (!emailId?.trim()) errors.emailId = 'Email is required'
  else if (!EMAIL_REGEX.test(emailId.trim())) errors.emailId = 'Enter a valid email address'
  if (!password) errors.password = 'Password is required'
  else if (!STRONG_PASSWORD.test(password))
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number and symbol (@$!%*?&)'
  return errors
}

export function validateLogin({ emailId, password }) {
  const errors = {}
  if (!emailId?.trim()) errors.emailId = 'Email is required'
  else if (!EMAIL_REGEX.test(emailId.trim())) errors.emailId = 'Enter a valid email address'
  if (!password) errors.password = 'Password is required'
  return errors
}

const ALLOWED_EDIT_FIELDS = ['firstName', 'lastName', 'emailId', 'photoUrl', 'gender', 'age', 'about', 'skills']

export function validateEditProfile(body) {
  const keys = Object.keys(body || {})
  const invalid = keys.filter((k) => !ALLOWED_EDIT_FIELDS.includes(k))
  if (invalid.length) return { message: `Not allowed to update: ${invalid.join(', ')}` }
  if (body.firstName != null && (body.firstName.length < 3 || body.firstName.length > 50))
    return { message: 'First name must be 3 to 50 characters' }
  if (body.emailId != null && !EMAIL_REGEX.test(body.emailId))
    return { message: 'Enter a valid email address' }
  if (body.gender != null && !['Male', 'female', 'other'].includes(body.gender))
    return { message: 'Gender must be Male, female or other' }
  return null
}

export function validateContribution(data) {
  const errors = {}
  if (!data.monasteryName?.trim()) errors.monasteryName = 'Monastery name is required'
  if (!data.location?.trim()) errors.location = 'Location is required'
  if (!data.region?.trim()) errors.region = 'Region is required'
  if (!data.description?.trim()) errors.description = 'Description is required'
  if (!data.coordinates || typeof data.coordinates !== 'object') {
    errors.coordinates = 'Coordinates are required'
  } else {
    const lat = Number(data.coordinates.latitude)
    const lng = Number(data.coordinates.longitude)
    if (Number.isNaN(lat) || Number.isNaN(lng)) errors.coordinates = 'Valid latitude and longitude required'
  }
  return errors
}

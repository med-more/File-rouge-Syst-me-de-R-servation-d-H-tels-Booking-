export const formatCurrencyMAD = (value) => {
  if (value == null || isNaN(Number(value))) return '0,00 MAD'
  try {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(Number(value))
  } catch {
    return `${Number(value).toFixed(2)} MAD`
  }
}
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-()]+$/
  return re.test(phone)
}

export const generateBookingId = () => {
  return "BK" + Date.now().toString(36).toUpperCase()
}

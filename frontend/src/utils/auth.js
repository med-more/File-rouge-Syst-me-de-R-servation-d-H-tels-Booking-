import axios from "axios"

/**
 * Logout function to clear user session
 */
export const logout = () => {
  // Remove token from localStorage
  localStorage.removeItem("token")

  // Remove authorization header from axios defaults
  delete axios.defaults.headers.common["Authorization"]

  // Clear any other stored user data
  localStorage.removeItem("user")
  localStorage.removeItem("refreshToken")

  // Redirect to home page
  window.location.href = "/"
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token")
  return !!token
}

/**
 * Get current user token
 */
export const getToken = () => {
  return localStorage.getItem("token")
}

/**
 * Set user token
 */
export const setToken = (token) => {
  localStorage.setItem("token", token)
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
}

/**
 * Get user data from localStorage
 */
export const getUser = () => {
  const user = localStorage.getItem("user")
  return user ? JSON.parse(user) : null
}

/**
 * Set user data in localStorage
 */
export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user))
}

/**
 * Clear all user data
 */
export const clearUserData = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  localStorage.removeItem("refreshToken")
  delete axios.defaults.headers.common["Authorization"]
}

/**
 * Check if user has specific role
 */
export const hasRole = (role) => {
  const user = getUser()
  return user && user.role === role
}

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  return hasRole("admin")
}

/**
 * Refresh authentication token
 */
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await axios.post("/api/auth/refresh", {
      refreshToken,
    })

    const { token, user } = response.data
    setToken(token)
    setUser(user)

    return { success: true, token, user }
  } catch (error) {
    // If refresh fails, logout user
    logout()
    return { success: false, error: error.message }
  }
}

/**
 * Setup axios interceptors for automatic token refresh
 */
export const setupAxiosInterceptors = () => {
  // Request interceptor to add token to headers
  axios.interceptors.request.use(
    (config) => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  // Response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const result = await refreshToken()
          if (result.success) {
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${result.token}`
            return axios(originalRequest)
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          logout()
          return Promise.reject(refreshError)
        }
      }

      // If it's a 401 and we couldn't refresh, logout
      if (error.response?.status === 401) {
        logout()
      }

      return Promise.reject(error)
    },
  )
}

/**
 * Initialize authentication on app start
 */
export const initializeAuth = () => {
  const token = getToken()
  if (token) {
    // Set axios default header
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
  }

  // Setup interceptors
  setupAxiosInterceptors()
}

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const minLength = 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  return {
    isValid: password.length >= minLength,
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    score: [password.length >= minLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean)
      .length,
  }
}

/**
 * Generate password strength message
 */
export const getPasswordStrengthMessage = (password) => {
  const validation = validatePassword(password)

  if (validation.score === 5) {
    return { message: "Very Strong", color: "text-green-600" }
  } else if (validation.score >= 4) {
    return { message: "Strong", color: "text-green-500" }
  } else if (validation.score >= 3) {
    return { message: "Medium", color: "text-yellow-500" }
  } else if (validation.score >= 2) {
    return { message: "Weak", color: "text-orange-500" }
  } else {
    return { message: "Very Weak", color: "text-red-500" }
  }
}

/**
 * Check if user session is expired
 */
export const isSessionExpired = () => {
  const token = getToken()
  if (!token) return true

  try {
    // Decode JWT token to check expiration
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch (error) {
    // If we can't decode the token, consider it expired
    return true
  }
}

/**
 * Get time until token expires (in minutes)
 */
export const getTokenExpirationTime = () => {
  const token = getToken()
  if (!token) return 0

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Date.now() / 1000
    const timeLeft = payload.exp - currentTime
    return Math.max(0, Math.floor(timeLeft / 60)) // Return minutes
  } catch (error) {
    return 0
  }
}

/**
 * Auto-logout when token expires
 */
export const setupAutoLogout = () => {
  const checkTokenExpiration = () => {
    if (isSessionExpired()) {
      logout()
    }
  }

  // Check every minute
  setInterval(checkTokenExpiration, 60000)

  // Check immediately
  checkTokenExpiration()
}

/**
 * Handle login success
 */
export const handleLoginSuccess = (token, user, refreshToken = null) => {
  setToken(token)
  setUser(user)

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken)
  }

  // Setup auto-logout
  setupAutoLogout()
}

/**
 * Get user permissions based on role
 */
export const getUserPermissions = () => {
  const user = getUser()
  if (!user) return []

  const permissions = {
    user: ["view_profile", "edit_profile", "view_bookings", "create_booking", "cancel_booking"],
    admin: [
      "view_profile",
      "edit_profile",
      "view_bookings",
      "create_booking",
      "cancel_booking",
      "manage_hotels",
      "manage_users",
      "manage_payments",
      "view_analytics",
      "export_data",
    ],
  }

  return permissions[user.role] || permissions.user
}

/**
 * Check if user has specific permission
 */
export const hasPermission = (permission) => {
  const permissions = getUserPermissions()
  return permissions.includes(permission)
}

/**
 * Format user display name
 */
export const getDisplayName = (user = null) => {
  const currentUser = user || getUser()
  if (!currentUser) return "Guest"

  return currentUser.name || currentUser.email || "User"
}

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user = null) => {
  const currentUser = user || getUser()
  if (!currentUser || !currentUser.name) return "U"

  return currentUser.name
    .split(" ")
    .map((name) => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("")
}

export default {
  logout,
  isAuthenticated,
  getToken,
  setToken,
  getUser,
  setUser,
  clearUserData,
  hasRole,
  isAdmin,
  refreshToken,
  setupAxiosInterceptors,
  initializeAuth,
  isValidEmail,
  validatePassword,
  getPasswordStrengthMessage,
  isSessionExpired,
  getTokenExpirationTime,
  setupAutoLogout,
  handleLoginSuccess,
  getUserPermissions,
  hasPermission,
  getDisplayName,
  getUserInitials,
}

"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
  isAdmin: false,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      const newState = {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        isAdmin: action.payload.user.role === "admin",
      }
      console.log('Auth reducer - LOGIN_SUCCESS:', {
        userRole: action.payload.user.role,
        isAdmin: newState.isAdmin,
        newState
      })
      return newState
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        isAdmin: false,
      }
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      }
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
        isAdmin: action.payload.role === "admin",
      }
    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        isAdmin: false,
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [state.token])

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: response.data.user,
              token: token,
            },
          })
        } catch (error) {
          console.error('Token validation error:', error)
          localStorage.removeItem("token")
          dispatch({ type: "AUTH_ERROR" })
        }
      }
      dispatch({ type: "SET_LOADING", payload: false })
    }
    checkAuth()
  }, [])

  const login = async (email, password, mode = "normal") => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      
      let response
      
      if (mode === "auto-login") {
        console.log('Auto-login mode: using existing token')
        
        const token = localStorage.getItem("token")
        if (!token) {
          console.error('Auto-login: no token found in localStorage')
          throw new Error("Token non trouvé")
        }
        
        console.log('Auto-login: token found, calling /api/auth/me')
        
        try {
          response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          const user = response.data.user
          console.log('Auto-login: user data retrieved:', user)
          
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user, token },
          })
          
          return { success: true, user }
        } catch (meError) {
          console.error('Auto-login: /me endpoint failed:', meError.response?.data)
          throw new Error("Impossible de récupérer les informations utilisateur")
        }
      } else {
        response = await axios.post('http://localhost:5000/api/auth/login', {
          email,
          password
        })

        const { token, user } = response.data
        
        console.log('Login response:', { token, user })
        console.log('User role:', user.role)
        console.log('Is admin?', user.role === 'admin')
        
        localStorage.setItem("token", token)
        
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user, token },
        })
        
        toast.success("Connexion réussie !")
        return { success: true, user }
      }
    } catch (error) {
      console.error('Login error:', error.response?.data)
      const errorMessage = error.response?.data?.message || "Échec de la connexion"
      if (mode !== "auto-login") {
        toast.error(errorMessage)
      }
      return { success: false, error: errorMessage }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const register = async (name, email, countryCode, phone, password) => {
    try {
      const requestData = {
        name: name?.trim(),
        email: email?.trim().toLowerCase(),
        countryCode: countryCode?.trim(),
        phone: phone?.trim(),
        password: password
      }
      
      console.log('Sending registration data:', requestData)
      console.log('Data types:', {
        name: typeof requestData.name,
        email: typeof requestData.email,
        countryCode: typeof requestData.countryCode,
        phone: typeof requestData.phone,
        password: typeof requestData.password
      })
      
      const response = await axios.post('http://localhost:5000/api/auth/register', requestData)

      if (response.status === 201) {
        toast.success("Inscription réussie ! Veuillez vérifier votre email.")
        return { success: true, data: response.data }
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data)
      console.error('Full error:', error)
      
      let errorMessage = "Échec de l'inscription"
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        errorMessage = error.response.data.errors[0].msg
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    dispatch({ type: "LOGOUT" })
    toast.success("Déconnexion réussie")
  }

  const updateProfile = async (userData) => {
    try {
      const response = await axios.patch('http://localhost:5000/api/user/profile', userData, {
        headers: { Authorization: `Bearer ${state.token}` }
      })
      
      const updatedUser = response.data.user
      dispatch({ type: "UPDATE_USER", payload: updatedUser })
      toast.success("Profil mis à jour avec succès !")
      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error.response?.data)
      const errorMessage = error.response?.data?.message || "Échec de la mise à jour"
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email })
      toast.success("Email de réinitialisation envoyé !")
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Échec de l'envoi de l'email"
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const resetPassword = async (token, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', { 
        token, 
        password 
      })
      toast.success("Mot de passe réinitialisé avec succès !")
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Échec de la réinitialisation"
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

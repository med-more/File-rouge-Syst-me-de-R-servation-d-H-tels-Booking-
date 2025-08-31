"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import Lottie from "lottie-react"
import loginAnimation from "../../data/login.json"

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Email invalide").required("Email requis"),
  password: Yup.string().required("Mot de passe requis"),
  rememberMe: Yup.boolean(),
})

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const { login, isAuthenticated, isAdmin, loading } = useAuth()
  const [pendingEmailVerification, setPendingEmailVerification] = useState("")
  const [isResending, setIsResending] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated && !loading) {
      const from = location.state?.from?.pathname || "/"
      
      console.log('Login redirect:', { 
        isAuthenticated, 
        isAdmin, 
        from, 
        targetPath: isAdmin ? "/admin" : from 
      })
      
      if (isAdmin) {
        console.log('Redirecting admin to /admin')
        navigate("/admin", { replace: true })
      } else {
        console.log('Redirecting user to:', from)
        navigate(from, { replace: true })
      }
    }
  }, [isAuthenticated, isAdmin, loading, navigate, location])

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setLoginError("")
    
    try {
      console.log('Login attempt with:', { email: values.email, rememberMe: values.rememberMe })
      
      const result = await login(values.email, values.password)
      console.log('Login result:', result)
      
      if (result.success) {
        console.log("Connexion réussie, redirection en cours...")
        
        if (values.rememberMe) {
          localStorage.setItem("rememberMe", "true")
        } else {
          localStorage.removeItem("rememberMe")
        }
      } else {
        const errorMsg = result.error || "Échec de la connexion"
        console.error('Login failed:', errorMsg)
        setLoginError(errorMsg)
        setFieldError("email", errorMsg)
        if (errorMsg?.includes('Email non vérifié')) {
          setPendingEmailVerification(values.email)
        }
      }
    } catch (error) {
      console.error('Login unexpected error:', error)
      const errorMsg = "Une erreur inattendue s'est produite"
      setLoginError(errorMsg)
      setFieldError("email", errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex -mt-16 pt-32 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
      </div>

      <div className="flex-1 flex justify-center items-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue</h2>
              <p className="text-gray-600">Connectez-vous à votre compte</p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{loginError}</span>
                </div>
                {pendingEmailVerification && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700">Vous n'avez pas reçu le code ?</span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setIsResending(true)
                          const res = await fetch('http://localhost:5000/api/auth/resend-verification', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: pendingEmailVerification })
                          })
                          if (!res.ok) throw new Error('Échec de l\'envoi')
                          setLoginError('Nouveau code envoyé ! Vérifiez votre email.')
                        } catch (e) {
                          setLoginError('Impossible d\'envoyer le code. Réessayez plus tard.')
                        } finally {
                          setIsResending(false)
                        }
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded hover:bg-yellow-200 transition-colors"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> Envoi...
                        </>
                      ) : (
                        'Renvoyer le code'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            <Formik
              initialValues={{
                email: "",
                password: "",
                rememberMe: false,
              }}
              validationSchema={LoginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Entrez votre email"
                      />
                    </div>
                    <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600 flex items-center">
                      {msg => (
                        <>
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {msg}
                        </>
                      )}
                    </ErrorMessage>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Field
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Entrez votre mot de passe"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600 flex items-center">
                      {msg => (
                        <>
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {msg}
                        </>
                      )}
                    </ErrorMessage>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Field
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="rememberMe" className="ml-3 text-sm text-gray-700">
                        Se souvenir de moi
                      </label>
                    </div>
                    <Link to="/reset-password" className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors">
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-lg hover:shadow-xl mt-6"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Connexion en cours...
                      </div>
                    ) : (
                      <>
                        Se connecter
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Vous n'avez pas de compte ?{" "}
                <Link to="/register" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-8">
        <div className="max-w-md w-full -mt-16">
          <Lottie animationData={loginAnimation} loop={true} />
        </div>
      </div>
    </div>
  )
}

export default Login
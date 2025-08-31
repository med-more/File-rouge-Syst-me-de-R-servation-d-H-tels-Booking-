"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Mail, ArrowLeft, CheckCircle, AlertCircle, RefreshCw, ArrowRight } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios"
import { toast } from "react-toastify"
import Lottie from "lottie-react"
import verifyEmailAnimation from "../../data/verify-email.json"

const VerifyEmailSchema = Yup.object().shape({
  'code-0': Yup.string().required("Champ requis"),
  'code-1': Yup.string().required("Champ requis"),
  'code-2': Yup.string().required("Champ requis"),
  'code-3': Yup.string().required("Champ requis"),
  'code-4': Yup.string().required("Champ requis"),
  'code-5': Yup.string().required("Champ requis"),
})

const VerifyEmail = () => {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [email, setEmail] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const inputRefs = useRef([])

  useEffect(() => {
    // Récupérer l'email depuis l'état de navigation ou les paramètres URL
    const emailFromState = location.state?.email
    const emailFromParams = new URLSearchParams(location.search).get('email')
    const userEmail = emailFromState || emailFromParams

    if (userEmail) {
      setEmail(userEmail)
    } else {
      // Si pas d'email, rediriger vers l'inscription
      navigate("/register")
    }
  }, [location, navigate])

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setIsVerifying(true)
    
    try {
      console.log('Submitting verification with:', { email, code: values.code })
      
      const response = await axios.post('http://localhost:5000/api/auth/verify-email', {
        email: email,
        code: values.code
      })

      console.log('Verification response:', response.data)
      const { token, user } = response.data

      // Connecter automatiquement l'utilisateur
      localStorage.setItem("token", token)
      
      // Mettre à jour le contexte d'authentification
      const loginResult = await login("", "", "auto-login")
      console.log('Login result:', loginResult)
      
      if (loginResult.success) {
        toast.success("Email vérifié avec succès ! Bienvenue sur HotelBook !")
        
        // Rediriger vers la page d'accueil
        navigate("/", { replace: true })
      } else {
        throw new Error(loginResult.error || "Échec de la connexion automatique")
      }
      
    } catch (error) {
      console.error('Verification error:', error.response?.data || error.message)
      const errorMessage = error.response?.data?.message || error.message || "Échec de la vérification"
      setFieldError("code", errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsVerifying(false)
      setSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    
    try {
      await axios.post('http://localhost:5000/api/auth/resend-verification', {
        email: email
      })
      
      toast.success("Nouveau code envoyé ! Vérifiez votre email.")
      setCountdown(60) // 60 secondes de cooldown
      
    } catch (error) {
      console.error('Resend error:', error.response?.data)
      const errorMessage = error.response?.data?.message || "Échec de l'envoi du code"
      toast.error(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  const handleCodeChange = (e, setFieldValue) => {
    const value = e.target.value
    const fieldIndex = parseInt(e.target.name.split('-')[1])
    
    console.log('Code change:', { fieldIndex, value, name: e.target.name })
    
    // Mettre à jour la valeur
    setFieldValue(`code-${fieldIndex}`, value)
    
    // Passer au champ suivant si une valeur est entrée
    if (value && fieldIndex < 5) {
      inputRefs.current[fieldIndex + 1]?.focus()
    }
    
    // Revenir au champ précédent si on efface
    if (!value && fieldIndex > 0) {
      inputRefs.current[fieldIndex - 1]?.focus()
    }
  }

  const formatCode = (values) => {
    return Object.values(values).join('')
  }

  return (
    <div className="min-h-screen bg-white flex -mt-16 pt-32 relative overflow-hidden">
      {/* Background Spots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
      </div>

      {/* Left Side - Verification Form */}
      <div className="flex-1 flex justify-center items-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérifiez votre email</h2>
              <p className="text-gray-600">
                Nous avons envoyé un code de vérification à 6 chiffres à
              </p>
              <p className="text-blue-600 font-semibold mt-1">{email}</p>
            </div>

                         <Formik
               initialValues={{
                 'code-0': '',
                 'code-1': '',
                 'code-2': '',
                 'code-3': '',
                 'code-4': '',
                 'code-5': '',
               }}
               validationSchema={VerifyEmailSchema}
               onSubmit={(values, { setSubmitting, setFieldError }) => {
                 const code = formatCode(values)
                 handleSubmit({ code }, { setSubmitting, setFieldError })
               }}
               validate={(values) => {
                 const code = formatCode(values)
                 if (code.length === 6) {
                   return {}
                 }
                 return { code: "Le code doit contenir exactement 6 chiffres" }
               }}
             >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Code Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Code de vérification
                    </label>
                    <div className="flex justify-center space-x-2 sm:space-x-3">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <Field
                          key={index}
                          name={`code-${index}`}
                          innerRef={(el) => (inputRefs.current[index] = el)}
                          onChange={(e) => handleCodeChange(e, setFieldValue)}
                          className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          maxLength={1}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                      ))}
                    </div>
                    <ErrorMessage name="code" component="div" className="mt-2 text-sm text-red-600 flex items-center justify-center">
                      {msg => (
                        <>
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {msg}
                        </>
                      )}
                    </ErrorMessage>
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={isVerifying || isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    {isVerifying ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Vérification en cours...
                      </div>
                    ) : (
                      <>
                        Vérifier l'email
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Resend Code */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm mb-3">
                Vous n'avez pas reçu le code ?
              </p>
              <button
                onClick={handleResendCode}
                disabled={isResending || countdown > 0}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
              >
                {isResending ? (
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </div>
                ) : countdown > 0 ? (
                  <span>Renvoyer dans {countdown}s</span>
                ) : (
                  <span>Renvoyer le code</span>
                )}
              </button>
            </div>

            {/* Back to Register */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/register")}
                className="text-gray-600 hover:text-gray-700 font-medium transition-colors flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'inscription
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Animation */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-8">
        <div className="max-w-md w-full -mt-16">
          <Lottie animationData={verifyEmailAnimation} loop={true} />
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail

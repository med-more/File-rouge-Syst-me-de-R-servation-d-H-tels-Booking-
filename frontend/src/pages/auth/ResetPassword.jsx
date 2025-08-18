"use client"

import { useMemo, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Mail, ArrowLeft, Lock, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "react-toastify"
import Lottie from "lottie-react"
import resetPasswordAnimation from "../../data/reset-password.json"
import { useAuth } from "../../contexts/AuthContext"

const ResetPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { forgotPassword, resetPassword } = useAuth()

  const { token: tokenParam } = useParams()
  const token = useMemo(
    () => tokenParam || new URLSearchParams(location.search).get("token"),
    [tokenParam, location.search]
  )
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isResetDone, setIsResetDone] = useState(false)

  const EmailSchema = Yup.object().shape({
    email: Yup.string().email("Email invalide").required("Email requis"),
  })

  const PasswordSchema = Yup.object().shape({
    password: Yup.string().min(6, "6 caractères minimum").required("Mot de passe requis"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Les mots de passe ne correspondent pas")
      .required("Confirmation requise"),
  })

  const handleEmailSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const res = await forgotPassword(values.email)
      if (res.success) {
        setIsSubmitted(true)
      } else {
        setFieldError("email", res.error || "Échec de l'envoi de l'email")
      }
    } catch (error) {
      setFieldError("email", "Une erreur inattendue s'est produite")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const res = await resetPassword(token, values.password)
      if (res.success) {
        setIsResetDone(true)
        toast.success("Mot de passe réinitialisé avec succès !")
        setTimeout(() => navigate("/login", { replace: true }), 1000)
      } else {
        setFieldError("password", res.error || "Échec de la réinitialisation")
      }
    } catch (error) {
      setFieldError("password", "Une erreur inattendue s'est produite")
    } finally {
      setSubmitting(false)
    }
  }

  // État après demande d'email envoyée
  if (!token && isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Vérifiez votre email</h2>
            <p className="mt-2 text-sm text-gray-600">Nous avons envoyé un lien de réinitialisation à votre adresse email.</p>
            <div className="mt-6">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // État après réinitialisation terminée (affiché brièvement avant redirection)
  if (token && isResetDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Mot de passe mis à jour</h2>
          <p className="mt-2 text-sm text-gray-600">Redirection vers la page de connexion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="max-w-6xl w-full flex items-center justify-between gap-16 relative z-10">
        <div className="hidden lg:block w-1/3">
          <div className="w-64 mx-auto">
            <Lottie animationData={resetPasswordAnimation} loop={true} />
          </div>
        </div>
        <div className="w-full lg:w-2/3">
          <div className="bg-white p-8 rounded-2xl shadow-lg relative overflow-hidden max-w-xl mx-auto">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="relative z-10">
              <div>
                <Link to="/login" className="flex items-center text-blue-600 hover:text-blue-700 mb-6">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la connexion
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                  {token ? "Définir un nouveau mot de passe" : "Réinitialiser le mot de passe"}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  {token
                    ? "Entrez et confirmez votre nouveau mot de passe pour accéder à votre compte."
                    : "Entrez votre adresse email et nous vous enverrons un lien de réinitialisation."}
                </p>
              </div>

              {/* Formulaires */}
              {!token ? (
                <Formik initialValues={{ email: "" }} validationSchema={EmailSchema} onSubmit={handleEmailSubmit}>
                  {({ isSubmitting }) => (
                    <Form className="mt-8 space-y-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Adresse email
                        </label>
                        <div className="mt-1 relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Field
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Entrez votre email"
                          />
                        </div>
                        <ErrorMessage name="email" component="div" className="mt-2 text-sm text-red-600 flex items-center">
                          {msg => (
                            <>
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {msg}
                            </>
                          )}
                        </ErrorMessage>
                      </div>

                      <div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {isSubmitting ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              ) : (
                <Formik
                  initialValues={{ password: "", confirmPassword: "" }}
                  validationSchema={PasswordSchema}
                  onSubmit={handlePasswordSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form className="mt-8 space-y-6">
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Nouveau mot de passe
                        </label>
                        <div className="mt-1 relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Field
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Entrez votre nouveau mot de passe"
                          />
                        </div>
                        <ErrorMessage name="password" component="div" className="mt-2 text-sm text-red-600 flex items-center">
                          {msg => (
                            <>
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {msg}
                            </>
                          )}
                        </ErrorMessage>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirmer le mot de passe
                        </label>
                        <div className="mt-1 relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Field
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Confirmez votre mot de passe"
                          />
                        </div>
                        <ErrorMessage name="confirmPassword" component="div" className="mt-2 text-sm text-red-600 flex items-center">
                          {msg => (
                            <>
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {msg}
                            </>
                          )}
                        </ErrorMessage>
                      </div>

                      <div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {isSubmitting ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
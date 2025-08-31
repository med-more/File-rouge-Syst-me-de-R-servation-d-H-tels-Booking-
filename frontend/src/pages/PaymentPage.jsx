"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { CreditCard, Lock, CheckCircle, Shield, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useBooking } from "../contexts/BookingContext"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import axios from "axios"
import { toast } from "react-toastify"
import { formatCurrencyMAD } from "../utils/helpers"

// Composant pour l'icône de carte de crédit
const CardIcon = ({ cardType }) => {
  const getCardIcon = () => {
    switch (cardType) {
      case 'visa':
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#1A1F71"/>
            <path d="M9.5 8.5h5v7h-5z" fill="white"/>
            <path d="M12 12.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" fill="white"/>
          </svg>
        )
      case 'mastercard':
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#EB001B"/>
            <circle cx="9" cy="12" r="3" fill="#F79E1B"/>
            <circle cx="15" cy="12" r="3" fill="#FF5F00"/>
          </svg>
        )
      default:
        return <CreditCard className="w-8 h-8 text-gray-400" />
    }
  }

  return (
    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200">
      {getCardIcon()}
    </div>
  )
}

// Schéma de validation Yup
const PaymentSchema = Yup.object().shape({
  cardNumber: Yup.string()
    .matches(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'Numéro de carte invalide')
    .required('Numéro de carte requis'),
  expiryDate: Yup.string()
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Date d\'expiration invalide (MM/AA)')
    .required('Date d\'expiration requise'),
  cvc: Yup.string()
    .matches(/^\d{3,4}$/, 'CVC invalide')
    .required('CVC requis'),
  cardholderName: Yup.string()
    .min(2, 'Nom trop court')
    .max(50, 'Nom trop long')
    .required('Nom du titulaire requis'),
  email: Yup.string()
    .email('Email invalide')
    .required('Email requis'),
  phone: Yup.string()
    .matches(/^\+?[\d\s\-\(\)]+$/, 'Numéro de téléphone invalide')
    .required('Numéro de téléphone requis')
})

const CheckoutForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentBooking, createBooking } = useBooking()
  const [processing, setProcessing] = useState(false)
  const [showCvc, setShowCvc] = useState(false)
  const [cardType, setCardType] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const cardNumberRef = useRef(null)

  // Données statiques pour la simulation
  const bookingData = {
    hotelName: "Hôtel Luxe Paris",
    roomType: "Chambre Deluxe",
    checkIn: "2024-03-20",
    checkOut: "2024-03-25",
    guests: 2,
    nights: 5,
    roomPrice: 350,
    subtotal: 1750,
    taxes: 210,
    fees: 50,
    total: 2010
  }

  // Fonction pour détecter le type de carte
  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '')
    
    if (/^4/.test(cleanNumber)) return 'visa'
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard'
    if (/^3[47]/.test(cleanNumber)) return 'amex'
    if (/^6/.test(cleanNumber)) return 'discover'
    
    return ''
  }

  // Fonction pour formater le numéro de carte
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  // Fonction pour formater la date d'expiration
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    
    return v
  }

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setProcessing(true)
    setPaymentError(null)

    try {
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Simuler une validation côté serveur
      if (values.cardNumber.includes('0000')) {
        throw new Error('Carte refusée par la banque')
      }

      // Simuler un succès de paiement
      setPaymentSuccess(true)
      toast.success("Paiement effectué avec succès ! Votre réservation est confirmée.")
      
      // Rediriger vers la page de confirmation après 3 secondes
      setTimeout(() => {
        navigate("/my-bookings")
      }, 3000)
    } catch (error) {
      setPaymentError(error.message || "Une erreur est survenue lors du paiement")
      toast.error("Erreur lors du paiement")
    } finally {
      setProcessing(false)
      setSubmitting(false)
    }
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-200/30 p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Paiement réussi !</h2>
          <p className="text-gray-600 mb-6">Votre réservation a été confirmée et vous recevrez un email de confirmation.</p>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Shield className="h-4 w-4 mr-2" />
            <span>Paiement sécurisé par SSL</span>
          </div>
        </div>
      </div>
    )
  }

  if (!currentBooking && !bookingData) {
    navigate("/hotels")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Résumé de la réservation */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-200/30 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl flex items-center justify-center mr-4">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Résumé de la réservation</h2>
                <p className="text-gray-600">Vérifiez les détails avant de payer</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{bookingData.hotelName}</h3>
                <p className="text-gray-600 text-sm">{bookingData.roomType}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-semibold text-gray-900">{bookingData.checkIn}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-semibold text-gray-900">{bookingData.checkOut}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Voyageurs</span>
                  <span className="font-semibold">{bookingData.guests} personnes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nuits</span>
                  <span className="font-semibold">{bookingData.nights}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix par nuit</span>
                  <span className="font-medium">{formatCurrencyMAD(bookingData.roomPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{formatCurrencyMAD(bookingData.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-medium">{formatCurrencyMAD(bookingData.taxes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais de service</span>
                  <span className="font-medium">{formatCurrencyMAD(bookingData.fees)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="font-medium">{formatCurrencyMAD(bookingData.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de paiement */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-200/30 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-400 rounded-xl flex items-center justify-center mr-4">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Paiement sécurisé</h2>
                <p className="text-gray-600">Vos données sont protégées</p>
              </div>
            </div>

            <Formik
              initialValues={{
                cardNumber: '',
                expiryDate: '',
                cvc: '',
                cardholderName: '',
                email: user?.email || '',
                phone: user?.phone || ''
              }}
              validationSchema={PaymentSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="space-y-6">
                  
                  {/* Numéro de carte */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Numéro de carte
                    </label>
                    <div className="relative">
                      <Field
                        name="cardNumber"
                        innerRef={cardNumberRef}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value)
                          setFieldValue('cardNumber', formatted)
                          setCardType(detectCardType(formatted))
                        }}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CardIcon cardType={cardType} />
                      </div>
                    </div>
                    <ErrorMessage name="cardNumber" component="div" className="text-red-500 text-sm mt-1 flex items-center">
                      {msg => (
                        <>
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {msg}
                        </>
                      )}
                    </ErrorMessage>
                  </div>

                  {/* Date d'expiration et CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Date d'expiration
                      </label>
                      <Field
                        name="expiryDate"
                        placeholder="MM/AA"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        onChange={(e) => {
                          const formatted = formatExpiryDate(e.target.value)
                          setFieldValue('expiryDate', formatted)
                        }}
                      />
                      <ErrorMessage name="expiryDate" component="div" className="text-red-500 text-sm mt-1 flex items-center">
                        {msg => (
                          <>
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {msg}
                          </>
                        )}
                      </ErrorMessage>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        CVC
                      </label>
                      <div className="relative">
                        <Field
                          name="cvc"
                          type={showCvc ? "text" : "password"}
                          placeholder="123"
                          className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCvc(!showCvc)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCvc ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <ErrorMessage name="cvc" component="div" className="text-red-500 text-sm mt-1 flex items-center">
                        {msg => (
                          <>
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {msg}
                          </>
                        )}
                      </ErrorMessage>
                    </div>
                  </div>

                  {/* Nom du titulaire */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Nom du titulaire
                    </label>
                    <Field
                      name="cardholderName"
                      placeholder="JEAN DUPONT"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <ErrorMessage name="cardholderName" component="div" className="text-red-500 text-sm mt-1 flex items-center">
                      {msg => (
                        <>
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {msg}
                        </>
                      )}
                    </ErrorMessage>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Email de confirmation
                    </label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="jean.dupont@example.com"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1 flex items-center">
                      {msg => (
                        <>
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {msg}
                        </>
                      )}
                    </ErrorMessage>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Téléphone
                    </label>
                    <Field
                      name="phone"
                      placeholder="+33 6 12 34 56 78"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1 flex items-center">
                      {msg => (
                        <>
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {msg}
                        </>
                      )}
                    </ErrorMessage>
                  </div>

                  {/* Bouton de paiement */}
                  <button
                    type="submit"
                    disabled={isSubmitting || processing}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Traitement en cours...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Lock className="h-5 w-5 mr-2" />
                        Payer {formatCurrencyMAD(bookingData.total)}
                      </div>
                    )}
                  </button>

                  {/* Message d'erreur */}
                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      {paymentError}
                    </div>
                  )}

                  {/* Sécurité */}
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Paiement sécurisé par SSL - Vos données sont protégées</span>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  )
}

const PaymentPage = () => {
  return <CheckoutForm />
}

export default PaymentPage

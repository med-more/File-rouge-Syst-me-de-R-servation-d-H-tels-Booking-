"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  Shield, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Sparkles, 
  Star,
  Clock,
  Calendar,
  Users,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Heart,
  Gift,
  Award,
  ArrowRight,
  Check,
  Loader2
} from "lucide-react"
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
      case 'amex':
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#006FCF"/>
            <path d="M6 8h12v8H6z" fill="white"/>
            <path d="M8 10h8v4H8z" fill="#006FCF"/>
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

// Composant de progression du paiement
const PaymentProgress = ({ step, totalSteps = 4 }) => {
  const steps = [
    { id: 1, label: "Informations", icon: CreditCard },
    { id: 2, label: "Validation", icon: CheckCircle },
    { id: 3, label: "Paiement", icon: Lock },
    { id: 4, label: "Confirmation", icon: Award }
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((stepItem, index) => {
          const Icon = stepItem.icon
          const isActive = step >= stepItem.id
          const isCompleted = step > stepItem.id
          
          return (
            <div key={stepItem.id} className="flex flex-col items-center relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isCompleted 
                  ? 'bg-success-500 text-white shadow-lg' 
                  : isActive 
                    ? 'bg-primary-500 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-400'
              }`}>
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <span className={`text-xs font-medium mt-2 transition-colors duration-300 ${
                isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {stepItem.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`absolute top-6 left-1/2 w-full h-0.5 transition-colors duration-300 ${
                  step > stepItem.id ? 'bg-success-500' : 'bg-gray-200'
                }`} style={{ transform: 'translateX(50%)', width: 'calc(100% - 3rem)' }} />
              )}
            </div>
          )
        })}
      </div>
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
    .matches(/^(\+212|0)[5-7][0-9]{8}$/, 'Numéro de téléphone marocain invalide (format: 06xxxxxxxx ou +2126xxxxxxxx)')
    .required('Numéro de téléphone requis')
})

// Fonction pour formater les numéros de téléphone marocains
const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  
  // Nettoyer le numéro (supprimer espaces, tirets, etc.)
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  
  // Si le numéro commence par 0, le convertir en format international
  if (cleaned.startsWith('0')) {
    return '+212' + cleaned.substring(1)
  }
  
  // Si le numéro commence par +212, le garder tel quel
  if (cleaned.startsWith('+212')) {
    return cleaned
  }
  
  // Si le numéro commence par 212, ajouter le +
  if (cleaned.startsWith('212')) {
    return '+' + cleaned
  }
  
  // Sinon, ajouter +212
  return '+212' + cleaned
}

const CheckoutForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentBooking, createBooking } = useBooking()
  const [processing, setProcessing] = useState(false)
  const [showCvc, setShowCvc] = useState(false)
  const [cardType, setCardType] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isCardValid, setIsCardValid] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const cardNumberRef = useRef(null)
  const [formValues, setFormValues] = useState({})

  // Utiliser la réservation courante si disponible, sinon fallback minimal
  const bookingData = currentBooking || {
    hotelName: "",
    roomType: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    nights: 0,
    roomPrice: 0,
    subtotal: 0,
    taxes: 0,
    fees: 0,
    total: 0,
    amenities: [],
    rating: 0,
    location: "",
    image: ""
  }

  // Effet de confetti pour le succès
  useEffect(() => {
    if (paymentSuccess) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [paymentSuccess])

  // Validation en temps réel
  useEffect(() => {
    const isValid = formValues.cardNumber && formValues.expiryDate && formValues.cvc && formValues.cardholderName && formValues.email && formValues.phone
    setIsFormValid(isValid)
  }, [formValues])

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
    setCurrentStep(2)

    try {
      // Étape 1: Validation
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCurrentStep(3)

      // Étape 2: Traitement du paiement
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simuler une validation côté serveur
      if (values.cardNumber.includes('0000')) {
        throw new Error('Carte refusée par la banque')
      }

      // Étape 3: Création de la réservation côté backend
      if (!currentBooking) {
        throw new Error('Données de réservation manquantes')
      }

      // Validation et formatage des invités
      const guests = {
        adults: Math.max(1, Number(currentBooking.guests?.adults || currentBooking.guests || 1)),
        children: Math.max(0, Number(currentBooking.guests?.children || 0)),
        infants: Math.max(0, Number(currentBooking.guests?.infants || 0)),
      }
      
      console.log('Guests data:', guests)

      // Validation des données requises
      const hotelId = currentBooking.hotelId || currentBooking.hotel?._id
      const roomId = currentBooking.roomId || currentBooking.room?._id
      
      if (!hotelId) {
        throw new Error('Hotel ID manquant')
      }
      if (!roomId) {
        throw new Error('Room ID manquant')
      }
      if (!currentBooking.checkIn) {
        throw new Error('Date de check-in manquante')
      }
      if (!currentBooking.checkOut) {
        throw new Error('Date de check-out manquante')
      }
      if (!currentBooking.roomPrice) {
        throw new Error('Prix de la chambre manquant')
      }

      // Validation des ObjectIds
      const isValidObjectId = (id) => {
        return /^[0-9a-fA-F]{24}$/.test(id)
      }
      
      if (!isValidObjectId(hotelId)) {
        throw new Error(`Hotel ID invalide: ${hotelId}`)
      }
      if (!isValidObjectId(roomId)) {
        throw new Error(`Room ID invalide: ${roomId}`)
      }

      console.log('Current booking data:', currentBooking)
      console.log('Hotel ID:', hotelId)
      console.log('Room ID:', roomId)

      // Validation et formatage des dates
      const checkInDate = new Date(currentBooking.checkIn)
      const checkOutDate = new Date(currentBooking.checkOut)
      
      if (isNaN(checkInDate.getTime())) {
        throw new Error('Date de check-in invalide')
      }
      if (isNaN(checkOutDate.getTime())) {
        throw new Error('Date de check-out invalide')
      }
      
      if (checkOutDate <= checkInDate) {
        throw new Error('La date de check-out doit être après la date de check-in')
      }

      const payload = {
        hotelId,
        roomId,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        guests,
        guestDetails: {
          primaryGuest: {
            firstName: (user?.name || 'Guest').split(' ')[0] || 'Guest',
            lastName: (user?.name || 'User').split(' ').slice(1).join(' ') || 'User',
            email: user?.email || values.email,
            phone: formatPhoneNumber(user?.phone || values.phone),
          }
        },
        pricePerNight: Number(currentBooking.roomPrice),
        taxes: Math.round((currentBooking.taxes || 0) * 100) / 100,
        fees: Math.round((currentBooking.fees || 0) * 100) / 100,
        discount: 0,
        paymentMethod: 'credit_card',
        specialRequests: '',
        roomPreferences: [],
        cancellationPolicy: 'free_cancellation',
        source: 'website',
        ipAddress: '',
        userAgent: navigator.userAgent
      }

      console.log('Booking payload:', payload)

      const result = await createBooking(payload)
      if (!result.success) {
        throw new Error(result.error || 'La création de la réservation a échoué')
      }

      setCurrentStep(4)
      setPaymentSuccess(true)
      toast.success("Paiement effectué avec succès ! Votre réservation est confirmée.")
      setTimeout(() => navigate("/my-bookings"), 2000)
    } catch (error) {
      setPaymentError(error.message || "Une erreur est survenue lors du paiement")
      toast.error("Erreur lors du paiement")
      setCurrentStep(1)
    } finally {
      setProcessing(false)
      setSubmitting(false)
    }
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden -mt-16 pt-32">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-success-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-r from-success-500 to-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-success-200/30 p-12 text-center max-w-lg w-full">
            <div className="w-24 h-24 bg-gradient-to-r from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            
            <h2 className="text-4xl font-black text-gray-900 mb-6">
              Paiement Réussi !
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Votre réservation a été confirmée et vous recevrez un email de confirmation dans quelques minutes.
            </p>

            <div className="bg-gradient-to-r from-success-50 to-accent-50 border border-success-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center text-sm text-success-700 font-medium mb-2">
                <Shield className="h-5 w-5 mr-2" />
                <span>Paiement sécurisé par SSL</span>
              </div>
              <div className="flex items-center justify-center text-xs text-gray-600">
                <Lock className="h-3 w-3 mr-1" />
                <span>Vos données sont protégées</span>
              </div>
            </div>

            <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Redirection vers vos réservations...</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-success-500 to-accent-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Recharger depuis localStorage si besoin
  if (!currentBooking && !bookingData) {
    try {
      const saved = localStorage.getItem('currentBooking')
      if (saved) {
        // Laisser le contexte se mettre à jour ailleurs; ici on lit juste pour l’affichage
      } else {
        navigate("/hotels")
        return null
      }
    } catch {
    navigate("/hotels")
    return null
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden -mt-16 pt-32">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-r from-primary-500 to-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header avec progression */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            Finaliser votre réservation
          </h1>
          <p className="text-xl text-gray-600 mb-8">Sécurisez votre séjour en quelques clics</p>
          <PaymentProgress step={currentStep} />
          </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
            {/* Résumé de la réservation */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-primary-200/30 p-8">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">Résumé de la réservation</h2>
                <p className="text-gray-600 text-lg">Vérifiez les détails avant de payer</p>
              </div>
            </div>

            {/* Image de l'hôtel */}
            <div className="relative mb-6 rounded-2xl overflow-hidden">
              <img 
                src={bookingData.image} 
                alt={bookingData.hotelName}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                <Star className="h-4 w-4 text-accent-500 mr-1" />
                <span className="text-sm font-bold text-gray-900">{bookingData.rating}</span>
              </div>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                <MapPin className="h-4 w-4 text-primary-500 mr-1" />
                <span className="text-sm font-medium text-gray-900">{bookingData.location}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-100">
                <h3 className="font-bold text-gray-900 text-xl mb-2">{bookingData.hotelName}</h3>
                <p className="text-gray-600 text-lg">{bookingData.roomType}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-primary-500 mr-2" />
                    <p className="text-sm text-gray-600 font-medium">Check-in</p>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">{bookingData.checkIn}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-primary-500 mr-2" />
                    <p className="text-sm text-gray-600 font-medium">Check-out</p>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">{bookingData.checkOut}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-primary-500 mr-2" />
                    <span className="text-gray-600 font-medium">Voyageurs</span>
                  </div>
                  <span className="font-bold text-lg text-gray-900">{bookingData.guests} personnes</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-primary-500 mr-2" />
                    <span className="text-gray-600 font-medium">Nuits</span>
                  </div>
                  <span className="font-bold text-lg text-gray-900">{bookingData.nights}</span>
                </div>
              </div>

              {/* Équipements */}
              <div className="bg-gradient-to-br from-accent-50 to-primary-50 rounded-2xl p-5 border border-accent-100">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Sparkles className="h-4 w-4 text-accent-500 mr-2" />
                  Équipements inclus
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {(Array.isArray(bookingData.amenities) ? bookingData.amenities : []).map((amenity, index) => {
                    const getIcon = (name) => {
                      switch(name.toLowerCase()) {
                        case 'wifi': return <Wifi className="h-4 w-4" />
                        case 'parking': return <Car className="h-4 w-4" />
                        case 'spa': return <Waves className="h-4 w-4" />
                        case 'restaurant': return <Utensils className="h-4 w-4" />
                        case 'piscine': return <Waves className="h-4 w-4" />
                        case 'gym': return <Dumbbell className="h-4 w-4" />
                        default: return <Check className="h-4 w-4" />
                      }
                    }
                    return (
                      <div key={index} className="flex items-center text-sm text-gray-700 bg-white/50 rounded-lg p-2">
                        {getIcon(amenity)}
                        <span className="ml-1 font-medium">{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Prix par nuit</span>
                  <span className="font-bold text-gray-900">{formatCurrencyMAD(bookingData.roomPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Sous-total</span>
                  <span className="font-bold text-gray-900">{formatCurrencyMAD(bookingData.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Taxes</span>
                  <span className="font-bold text-gray-900">{formatCurrencyMAD(bookingData.taxes)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Frais de service</span>
                  <span className="font-bold text-gray-900">{formatCurrencyMAD(bookingData.fees)}</span>
                </div>
                <div className="border-t-2 border-primary-200 pt-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black text-gray-900">Total</span>
                    <span className="text-2xl font-black text-primary-600">{formatCurrencyMAD(bookingData.total)}</span>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-success-600">
                    <Gift className="h-4 w-4 mr-1" />
                    <span>Économie de 15% avec votre réservation</span>
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* Formulaire de paiement */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-primary-200/30 p-8">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-success-600 to-success-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">Paiement sécurisé</h2>
                <p className="text-gray-600 text-lg">Vos données sont protégées</p>
              </div>
              <div className="ml-auto">
                <div className="flex items-center text-sm text-success-600 font-medium">
                  <Shield className="h-4 w-4 mr-1" />
                  <span>SSL 256-bit</span>
                </div>
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
              {({ values, setFieldValue, isSubmitting }) => {
                // Mise à jour des valeurs du formulaire pour la validation
                useEffect(() => {
                  setFormValues(values)
                }, [values])

                return (
                  <Form className="space-y-6">
                  
                  {/* Numéro de carte */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-primary-500" />
                  Numéro de carte
                      {isCardValid && <Check className="h-4 w-4 ml-2 text-success-500" />}
                </label>
                    <div className="relative">
                      <Field
                        name="cardNumber"
                        innerRef={cardNumberRef}
                  placeholder="1234 5678 9012 3456"
                        className="w-full px-5 py-4 pr-16 border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-200 transition-all duration-200 text-lg font-medium bg-gray-50 focus:bg-white"
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value)
                          setFieldValue('cardNumber', formatted)
                          setCardType(detectCardType(formatted))
                          setIsCardValid(formatted.length === 19)
                        }}
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <CardIcon cardType={cardType} />
                      </div>
                    </div>
                    <ErrorMessage name="cardNumber" component="div" className="text-error-600 text-sm mt-2 flex items-center font-medium">
                      {msg => (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {msg}
                        </>
                      )}
                    </ErrorMessage>
              </div>

                  {/* Date d'expiration et CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                    Date d'expiration
                  </label>
                      <Field
                        name="expiryDate"
                    placeholder="MM/AA"
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-200 transition-all duration-200 font-medium bg-gray-50 focus:bg-white"
                        onChange={(e) => {
                          const formatted = formatExpiryDate(e.target.value)
                          setFieldValue('expiryDate', formatted)
                        }}
                      />
                      <ErrorMessage name="expiryDate" component="div" className="text-error-600 text-sm mt-2 flex items-center font-medium">
                        {msg => (
                          <>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {msg}
                          </>
                        )}
                      </ErrorMessage>
                </div>
                    
                <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                    CVC
                  </label>
                      <div className="relative">
                        <Field
                          name="cvc"
                          type={showCvc ? "text" : "password"}
                    placeholder="123"
                          className="w-full px-5 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-200 transition-all duration-200 font-medium bg-gray-50 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCvc(!showCvc)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          {showCvc ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <ErrorMessage name="cvc" component="div" className="text-error-600 text-sm mt-2 flex items-center font-medium">
                        {msg => (
                          <>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {msg}
                          </>
                        )}
                      </ErrorMessage>
                </div>
              </div>

                  {/* Nom du titulaire */}
              <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Nom du titulaire
                </label>
                    <Field
                      name="cardholderName"
                  placeholder="JEAN DUPONT"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-200 transition-all duration-200 font-medium bg-gray-50 focus:bg-white"
                    />
                    <ErrorMessage name="cardholderName" component="div" className="text-error-600 text-sm mt-2 flex items-center font-medium">
                      {msg => (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {msg}
                        </>
                      )}
                    </ErrorMessage>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Email de confirmation
                    </label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="jean.dupont@example.com"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-200 transition-all duration-200 font-medium bg-gray-50 focus:bg-white"
                    />
                    <ErrorMessage name="email" component="div" className="text-error-600 text-sm mt-2 flex items-center font-medium">
                      {msg => (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {msg}
                        </>
                      )}
                    </ErrorMessage>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Téléphone
                    </label>
                    <Field
                      name="phone"
                      placeholder="+33 6 12 34 56 78"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-200 transition-all duration-200 font-medium bg-gray-50 focus:bg-white"
                    />
                    <ErrorMessage name="phone" component="div" className="text-error-600 text-sm mt-2 flex items-center font-medium">
                      {msg => (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {msg}
                        </>
                      )}
                    </ErrorMessage>
              </div>

                  {/* Bouton de paiement */}
              <button
                type="submit"
                    disabled={isSubmitting || processing || !isFormValid}
                    className={`w-full font-black py-5 px-8 rounded-2xl shadow-2xl transition-all duration-200 text-lg ${
                      isFormValid && !processing
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {processing ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin h-6 w-6 mr-3" />
                        <span>Traitement en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Lock className="h-6 w-6 mr-3" />
                        <span>Payer {formatCurrencyMAD(bookingData.total)}</span>
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </div>
                    )}
              </button>

                  {/* Message d'erreur */}
            {paymentError && (
                    <div className="bg-error-50 border-2 border-error-200 text-error-700 px-6 py-4 rounded-2xl flex items-center font-medium">
                      <AlertCircle className="h-5 w-5 mr-3" />
                {paymentError}
              </div>
            )}

                  {/* Sécurité */}
                  <div className="bg-gradient-to-r from-success-50 to-accent-50 border border-success-200 rounded-2xl p-4">
                    <div className="flex items-center justify-center text-sm text-success-700 font-medium mb-2">
                      <Shield className="h-5 w-5 mr-2" />
                      <span>Paiement sécurisé par SSL</span>
                    </div>
                    <div className="flex items-center justify-center text-xs text-gray-600">
                      <Lock className="h-3 w-3 mr-1" />
                      <span>Vos données sont protégées et chiffrées</span>
                    </div>
                  </div>

                  {/* Garanties */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-center">
                      <Award className="h-6 w-6 text-primary-500 mx-auto mb-1" />
                      <div className="text-xs font-medium text-primary-700">Garantie 100%</div>
                    </div>
                    <div className="bg-accent-50 border border-accent-200 rounded-xl p-3 text-center">
                      <Heart className="h-6 w-6 text-accent-500 mx-auto mb-1" />
                      <div className="text-xs font-medium text-accent-700">Satisfaction</div>
                    </div>
                  </div>
                </Form>
                )
              }}
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

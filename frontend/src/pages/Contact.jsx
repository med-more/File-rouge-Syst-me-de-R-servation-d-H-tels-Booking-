"use client"

import { useState, useEffect } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Headphones, Globe, Star } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"

const ContactSchema = Yup.object().shape({
  name: Yup.string().required("Le nom est requis"),
  email: Yup.string().email("Email invalide").required("L'email est requis"),
  subject: Yup.string().required("Le sujet est requis"),
  message: Yup.string().required("Le message est requis").min(10, "Le message doit contenir au moins 10 caractères"),
})

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true)
    try {
      await axios.post("/api/contact", values)
      toast.success("Message envoyé avec succès ! Nous vous répondrons bientôt.")
      resetForm()
    } catch (error) {
      toast.error("Échec de l'envoi du message. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Hide map loading indicator after map loads
  useEffect(() => {
    const timer = setTimeout(() => {
      const loadingElement = document.getElementById('map-loading')
      if (loadingElement) {
        loadingElement.style.display = 'none'
      }
    }, 2000) // Hide after 2 seconds

    return () => clearTimeout(timer)
  }, [])

  const contactMethods = [
    {
      icon: Phone,
      title: "Téléphone",
      details: ["+212 5XX-XXX-XXX", "+212 5XX-XXX-XXX"],
      color: "from-green-500 to-emerald-600",
      description: "Appelez-nous pour une assistance immédiate"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@hotelbook.ma", "support@hotelbook.ma"],
      color: "from-blue-500 to-blue-600",
      description: "Envoyez-nous un email à tout moment"
    },
    {
      icon: MessageCircle,
      title: "Chat en Direct",
      details: ["Disponible 24/7", "Réponse instantanée"],
      color: "from-purple-500 to-purple-600",
      description: "Chattez avec notre équipe de support"
    },
    {
      icon: Headphones,
      title: "Support Technique",
      details: ["Assistance technique", "Résolution de problèmes"],
      color: "from-yellow-500 to-orange-500",
      description: "Aide technique spécialisée"
    }
  ]

  const faqs = [
    {
      question: "Comment puis-je annuler ma réservation ?",
      answer: "Vous pouvez annuler votre réservation en allant dans 'Mes Réservations' dans votre tableau de bord. Les politiques d'annulation varient selon l'hôtel et le type de réservation."
    },
    {
      question: "Mes informations de paiement sont-elles sécurisées ?",
      answer: "Oui, nous utilisons un chiffrement de niveau industrie et travaillons avec des processeurs de paiement de confiance comme Stripe pour garantir la sécurité complète de vos informations de paiement."
    },
    {
      question: "Puis-je modifier les dates de ma réservation ?",
      answer: "Les modifications de réservation dépendent de la politique de l'hôtel et de la disponibilité. Contactez-nous ou l'hôtel directement pour demander des modifications à votre réservation."
    },
    {
      question: "Comment puis-je lister mon hôtel sur la plateforme ?",
      answer: "Les propriétaires d'hôtels peuvent contacter notre équipe de partenariat pour discuter des exigences de listing et commencer avec notre plateforme. Nous vous guiderons tout au long du processus."
    }
  ]

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4 mr-2" />
            Support Client 24/7
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Contactez
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"> Nous</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nous sommes là pour vous aider et répondre à toutes vos questions
          </p>
        </section>

        {/* Contact Methods */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Nos <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Moyens de Contact</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez le moyen qui vous convient le mieux pour nous contacter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${method.color} mb-6 shadow-lg`}>
                    <method.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{method.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{method.description}</p>
                  <div className="space-y-1">
                    {method.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-700 font-medium text-sm">{detail}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form & Map Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="relative">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 shadow-xl">
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-gray-900 mb-4">Envoyez-nous un Message</h2>
                  <p className="text-gray-600">Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais</p>
                </div>

                <Formik
                  initialValues={{
                    name: "",
                    email: "",
                    subject: "",
                    message: "",
                  }}
                  validationSchema={ContactSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                            Votre Nom
                          </label>
                          <Field
                            type="text"
                            id="name"
                            name="name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Votre nom complet"
                          />
                          <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Adresse Email
                          </label>
                          <Field
                            type="email"
                            id="email"
                            name="email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="votre@email.com"
                          />
                          <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                          Sujet
                        </label>
                        <Field
                          type="text"
                          id="subject"
                          name="subject"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Comment pouvons-nous vous aider ?"
                        />
                        <ErrorMessage name="subject" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                          Message
                        </label>
                        <Field
                          as="textarea"
                          id="message"
                          name="message"
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                          placeholder="Votre message ici..."
                        />
                        <ErrorMessage name="message" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      <div className="flex justify-center">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Envoi en cours...
                            </div>
                          ) : (
                            <>
                              Envoyer le Message
                              <Send className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>

            {/* Map Section */}
            <div className="relative">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 shadow-xl">
                <div className="mb-6">
                  <h2 className="text-3xl font-black text-gray-900 mb-4">Notre Localisation</h2>
                  <p className="text-gray-600">Visitez notre bureau principal à Casablanca, Maroc</p>
                </div>
                
                                 {/* Interactive Map Container */}
                 <div className="relative bg-white rounded-2xl h-96 overflow-hidden shadow-lg border border-gray-200">
                   {/* OpenStreetMap Embed */}
                   <iframe
                     src="https://www.openstreetmap.org/export/embed.html?bbox=-7.6250%2C33.5720%2C-7.6200%2C33.5750&layer=mapnik&marker=33.5737%2C-7.6229"
                     width="100%"
                     height="100%"
                     style={{ border: 0 }}
                     allowFullScreen=""
                     loading="lazy"
                     referrerPolicy="no-referrer-when-downgrade"
                     title="Localisation HotelBook - Casablanca, Maroc"
                     className="rounded-2xl"
                   ></iframe>
                   
                   {/* Map Overlay with Location Info */}
                   <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/50">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                         <MapPin className="w-5 h-5 text-white" />
                       </div>
                       <div>
                         <h4 className="font-bold text-gray-900 text-sm">HotelBook</h4>
                         <p className="text-gray-600 text-xs">Casablanca, Maroc</p>
                       </div>
                     </div>
                   </div>
                   
                   {/* Map Controls */}
                   <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                     <a
                       href="https://www.openstreetmap.org/?mlat=33.5737&mlon=-7.6229#map=16/33.5737/-7.6229"
                       target="_blank"
                       rel="noopener noreferrer"
                       className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-white transition-colors duration-200 shadow-lg border border-gray-200/50 flex items-center space-x-1"
                     >
                       <MapPin className="w-3 h-3" />
                       <span>OpenStreetMap</span>
                     </a>
                     <a
                       href="https://www.google.com/maps/search/?api=1&query=33.5737,-7.6229"
                       target="_blank"
                       rel="noopener noreferrer"
                       className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-white transition-colors duration-200 shadow-lg border border-gray-200/50 flex items-center space-x-1"
                     >
                       <Globe className="w-3 h-3" />
                       <span>Google Maps</span>
                     </a>
                   </div>
                   
                   {/* Location Details */}
                   <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/50 max-w-xs">
                     <h4 className="font-bold text-gray-900 text-sm mb-2">Adresse Complète</h4>
                     <p className="text-gray-600 text-xs leading-relaxed">
                       Avenue Mohammed V<br />
                       Quartier Maarif<br />
                       20000 Casablanca<br />
                       Maroc
                     </p>
                     <div className="mt-2 pt-2 border-t border-gray-200">
                       <p className="text-gray-500 text-xs">
                         📍 33.5737°N, 7.6229°W
                       </p>
                     </div>
                   </div>
                   
                   {/* Map Loading Indicator */}
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center rounded-2xl" id="map-loading">
                     <div className="text-center">
                       <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                         <MapPin className="w-8 h-8 text-white" />
                       </div>
                       <p className="text-gray-600 text-sm">Chargement de la carte...</p>
                     </div>
                   </div>
                 </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900">Heures d'Ouverture</p>
                      <p className="text-gray-600">Lun - Ven: 9h00 - 18h00</p>
                      <p className="text-gray-600">Sam: 10h00 - 16h00</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900">Téléphone</p>
                      <p className="text-gray-600">+212 5XX-XXX-XXX</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-gray-600">info@hotelbook.ma</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Questions <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Fréquentes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trouvez des réponses aux questions courantes sur notre plateforme de réservation d'hôtels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-start">
                    <Star className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

export default Contact

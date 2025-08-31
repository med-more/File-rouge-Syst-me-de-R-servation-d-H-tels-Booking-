import React, { useState } from "react"
import { HelpCircle, ChevronDown, ChevronUp, Search, CreditCard, Calendar, Hotel, Clock, Shield, Users } from "lucide-react"

const FAQ = () => {
  const [openSection, setOpenSection] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const faqSections = [
    {
      title: "Réservations",
      icon: Calendar,
      questions: [
        {
          q: "Comment puis-je modifier ou annuler ma réservation ?",
          a: "Vous pouvez modifier ou annuler votre réservation dans la section 'Mes Réservations' de votre compte. Les conditions d'annulation varient selon l'hôtel et le type de réservation. Certaines réservations peuvent être annulées gratuitement jusqu'à 24h avant l'arrivée."
        },
        {
          q: "Quand dois-je payer ma réservation ?",
          a: "Le paiement dépend du type de réservation. Certains hôtels demandent un paiement immédiat, d'autres acceptent le paiement à l'arrivée. Les détails sont clairement indiqués lors de la réservation."
        },
        {
          q: "Puis-je réserver pour quelqu'un d'autre ?",
          a: "Oui, vous pouvez réserver pour une autre personne. Assurez-vous simplement d'indiquer son nom lors de la réservation et de mentionner qu'elle sera la personne qui séjournera à l'hôtel."
        }
      ]
    },
    {
      title: "Paiements",
      icon: CreditCard,
      questions: [
        {
          q: "Quels modes de paiement acceptez-vous ?",
          a: "Nous acceptons les principales cartes de crédit (Visa, MasterCard, American Express), PayPal, et dans certains cas, le paiement à l'hôtel. Les options disponibles sont affichées lors du paiement."
        },
        {
          q: "Les paiements sont-ils sécurisés ?",
          a: "Oui, tous nos paiements sont sécurisés avec un cryptage SSL de pointe. Nous ne stockons jamais vos informations de carte de crédit et travaillons avec des processeurs de paiement de confiance."
        }
      ]
    },
    {
      title: "Services Hôteliers",
      icon: Hotel,
      questions: [
        {
          q: "L'heure d'arrivée et de départ peut-elle être flexible ?",
          a: "Les heures standards sont généralement 15h pour l'arrivée et 11h pour le départ. Pour des horaires différents, contactez directement l'hôtel. Certains proposent des check-in anticipés ou check-out tardifs, parfois avec un supplément."
        },
        {
          q: "Le petit-déjeuner est-il inclus ?",
          a: "Cela dépend de l'hôtel et du type de chambre réservée. Cette information est clairement indiquée dans les détails de la chambre lors de la réservation."
        }
      ]
    },
    {
      title: "Compte & Sécurité",
      icon: Shield,
      questions: [
        {
          q: "Comment créer un compte ?",
          a: "Cliquez sur 'S'inscrire' en haut de la page. Vous aurez besoin d'une adresse email valide et d'un mot de passe. La création de compte est gratuite et vous donne accès à des offres exclusives."
        },
        {
          q: "Mes informations personnelles sont-elles protégées ?",
          a: "Oui, nous prenons la protection de vos données très au sérieux. Toutes vos informations sont cryptées et sécurisées. Consultez notre Politique de Confidentialité pour plus de détails."
        }
      ]
    }
  ]

  const filteredSections = faqSections.map(section => ({
    ...section,
    questions: section.questions.filter(
      q => q.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
           q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.questions.length > 0)

  return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Background Spots - Style premium */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      
      <div className="container-custom py-8 relative z-10 w-full">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl relative overflow-hidden mb-8 border border-blue-200/40">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <HelpCircle className="h-10 w-10 text-blue-600 mr-2" />
                <h1 className="text-4xl font-extrabold text-black drop-shadow-lg">FAQ</h1>
              </div>
              <p className="text-lg text-blue-700/80 text-center mb-8 animate-fade-in delay-100">
                Trouvez rapidement des réponses à vos questions
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une question..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-6 animate-fade-in-up">
            {filteredSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-2xl shadow-xl border border-blue-200/40 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 text-blue-700 mb-4">
                    <section.icon className="h-6 w-6" />
                    <h2 className="text-xl font-bold">{section.title}</h2>
                  </div>
                  <div className="space-y-4">
                    {section.questions.map((item, index) => (
                      <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <button
                          onClick={() => setOpenSection(openSection === `${sectionIndex}-${index}` ? null : `${sectionIndex}-${index}`)}
                          className="w-full flex justify-between items-start text-left"
                        >
                          <span className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                            {item.q}
                          </span>
                          {openSection === `${sectionIndex}-${index}` ? (
                            <ChevronUp className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                          )}
                        </button>
                        {openSection === `${sectionIndex}-${index}` && (
                          <p className="mt-3 text-gray-600 animate-fade-in">
                            {item.a}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 text-center animate-fade-in-up">
            <p className="text-gray-600 mb-4">Vous n'avez pas trouvé ce que vous cherchiez ?</p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-200"
            >
              Contactez-nous
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQ 
"use client"

import { Users, Award, Globe, Heart, Shield, Clock, ArrowRight, Star, CheckCircle, TrendingUp, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

const AboutUs = () => {
  const stats = [
    { label: "Hôtels dans le Monde", value: "10,000+", icon: Globe, color: "from-blue-500 to-blue-600" },
    { label: "Clients Satisfaits", value: "500,000+", icon: Users, color: "from-green-500 to-emerald-600" },
    { label: "Pays Desservis", value: "50+", icon: Award, color: "from-purple-500 to-purple-600" },
    { label: "Années d'Expérience", value: "10+", icon: Clock, color: "from-yellow-500 to-orange-500" },
  ]

  const team = [
    {
      name: "Sarah Johnson",
      role: "PDG & Fondatrice",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      bio: "Avec plus de 15 ans dans l'industrie hôtelière, Sarah a fondé HotelBook pour révolutionner la façon dont les gens découvrent et réservent des hébergements.",
    },
    {
      name: "Michael Chen",
      role: "Directeur Technique",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      bio: "Michael dirige notre équipe technologique, garantissant que notre plateforme offre la meilleure expérience utilisateur avec des fonctionnalités de pointe.",
    },
    {
      name: "Emily Rodriguez",
      role: "Responsable des Opérations",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      bio: "Emily supervise nos opérations mondiales, travaillant étroitement avec nos partenaires hôteliers pour maintenir les plus hauts standards de service.",
    },
    {
      name: "David Kim",
      role: "Responsable du Succès Client",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "David s'assure que chaque client a une expérience exceptionnelle, dirigeant nos initiatives de support et de satisfaction client.",
    },
  ]

  const values = [
    {
      icon: Heart,
      title: "Client d'Abord",
      description: "Nous mettons nos clients au cœur de tout ce que nous faisons, garantissant un service et un support exceptionnels.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Confiance & Sécurité",
      description: "Votre vie privée et votre sécurité sont primordiales. Nous utilisons des mesures de sécurité de pointe pour protéger vos données.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Globe,
      title: "Portée Mondiale",
      description: "Nous connectons les voyageurs avec des hébergements dans le monde entier, rendant les voyages accessibles et agréables pour tous.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Award,
      title: "Assurance Qualité",
      description: "Nous vérifions soigneusement tous nos partenaires hôteliers pour nous assurer qu'ils respectent nos hauts standards de qualité et de service.",
      color: "from-purple-500 to-purple-600"
    },
  ]

  const achievements = [
    {
      icon: Star,
      title: "Note Moyenne 4.8/5",
      description: "Basée sur plus de 100,000 avis clients",
      color: "text-yellow-500"
    },
    {
      icon: TrendingUp,
      title: "Croissance de 300%",
      description: "Au cours des 3 dernières années",
      color: "text-green-500"
    },
    {
      icon: CheckCircle,
      title: "99.9% Uptime",
      description: "Disponibilité garantie de notre plateforme",
      color: "text-blue-500"
    },
    {
      icon: MapPin,
      title: "50+ Pays",
      description: "Présents dans le monde entier",
      color: "text-purple-500"
    },
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
            <Star className="w-4 h-4 mr-2" />
            Plateforme de Réservation N°1 au Maroc
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
            À Propos de
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"> HotelBook</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Votre partenaire de confiance pour trouver l'hébergement parfait dans le monde entier
          </p>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.color} mb-4 shadow-lg`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-black text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-semibold text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Our Story Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                  Notre <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Histoire</span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full"></div>
              </div>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  Fondée en 2014, HotelBook a commencé avec une mission simple : rendre la réservation d'hôtels plus facile, 
                  plus transparente et plus gratifiante pour les voyageurs du monde entier. Ce qui a commencé comme une petite 
                  startup est devenu une plateforme mondiale de confiance pour des millions de voyageurs.
                </p>
                <p>
                  Nos fondateurs, eux-mêmes voyageurs expérimentés, étaient frustrés par la complexité et les frais cachés des 
                  plateformes de réservation existantes. Ils ont imaginé un service qui serait transparent, convivial et axé 
                  sur la fourniture d'une valeur réelle aux voyageurs et aux partenaires hôteliers.
                </p>
                <p>
                  Aujourd'hui, nous sommes fiers d'offrir l'accès à plus de 10 000 hôtels dans le monde, des propriétés 
                  boutique aux resorts de luxe, tous soigneusement sélectionnés pour répondre à nos hauts standards de qualité 
                  et de service.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl transform rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop"
                alt="Notre Histoire"
                className="relative w-full h-96 object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Nos <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Valeurs</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ces valeurs fondamentales guident tout ce que nous faisons et façonnent la façon dont nous servons nos clients et partenaires.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${value.color} mb-6 shadow-lg`}>
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-8">Notre Mission</h2>
              <p className="text-xl text-blue-100 max-w-4xl mx-auto mb-12 leading-relaxed">
                Démocratiser les voyages en fournissant une plateforme qui connecte les voyageurs avec des hébergements 
                exceptionnels dans le monde entier, tout en donnant aux partenaires hôteliers les outils et la technologie 
                dont ils ont besoin pour réussir à l'ère numérique.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-white/20">
                <blockquote className="text-xl italic text-white mb-6">
                  "Nous croyons que les voyages ont le pouvoir d'élargir les perspectives, de créer des connexions et 
                  d'enrichir les vies. Notre objectif est de rendre ces expériences transformatrices accessibles à tous, 
                  un séjour parfait à la fois."
                </blockquote>
                <cite className="text-lg font-semibold text-blue-100">- Sarah Johnson, PDG & Fondatrice</cite>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Rencontrez Notre <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Équipe</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre équipe diversifiée de professionnels passionnés se consacre à faire de vos rêves de voyage une réalité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="relative mb-6">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-xl"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Nos <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Réalisations</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des chiffres qui témoignent de notre engagement envers l'excellence et la satisfaction client.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <achievement.icon className={`w-12 h-12 mx-auto mb-4 ${achievement.color}`} />
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{achievement.title}</h3>
                  <p className="text-gray-600 text-sm">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Prêt à Commencer Votre Voyage ?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Rejoignez des milliers de voyageurs satisfaits qui font confiance à HotelBook pour leurs besoins d'hébergement
              </p>
              <Link
                to="/hotels"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-2xl hover:bg-blue-50 transition-all duration-300 hover:scale-105"
              >
                Commencer l'Exploration
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-12 animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 p-8 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-6">Our Story</h2>
                <div className="space-y-4 text-blue-700/80 text-lg">
                  <p>
                    Founded in 2014, HotelBook began with a simple mission: to make hotel booking easier, more
                    transparent, and more rewarding for travelers around the world. What started as a small startup has
                    grown into a global platform trusted by millions of travelers.
                  </p>
                  <p>
                    Our founders, experienced travelers themselves, were frustrated with the complexity and hidden fees of
                    existing booking platforms. They envisioned a service that would be transparent, user-friendly, and
                    focused on delivering real value to both travelers and hotel partners.
                  </p>
                  <p>
                    Today, we're proud to offer access to over 10,000 hotels worldwide, from boutique properties to luxury
                    resorts, all carefully selected to meet our high standards for quality and service. Our platform
                    continues to evolve, incorporating the latest technology to enhance the booking experience.
                  </p>
                </div>
              </div>
              <div>
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Our Story"
                  className="w-full h-96 object-cover rounded-2xl shadow-2xl border-2 border-blue-200/30 animate-fade-in-up"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">Our Values</h2>
              <p className="text-xl text-blue-700/80 max-w-2xl mx-auto">
                These core values guide everything we do and shape how we serve our customers and partners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 p-6 animate-fade-in-up">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-700 mb-3">{value.title}</h3>
                  <p className="text-blue-700/80 text-base">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 p-10 text-center animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-6">Our Mission</h2>
              <p className="text-xl text-blue-700/80 max-w-4xl mx-auto mb-8">
                To democratize travel by providing a platform that connects travelers with exceptional accommodations
                worldwide, while empowering hotel partners with the tools and technology they need to succeed in the
                digital age.
              </p>
              <div className="bg-blue-50 rounded-xl shadow p-8 max-w-3xl mx-auto animate-fade-in-up">
                <blockquote className="text-lg italic text-blue-700">
                  "We believe that travel has the power to broaden perspectives, create connections, and enrich lives. Our
                  goal is to make those transformative experiences accessible to everyone, one perfect stay at a time."
                </blockquote>
                <cite className="block mt-4 text-blue-700 font-semibold">- Sarah Johnson, CEO & Founder</cite>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">Meet Our Team</h2>
              <p className="text-xl text-blue-700/80 max-w-2xl mx-auto">
                Our diverse team of passionate professionals is dedicated to making your travel dreams a reality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 p-6 animate-fade-in-up">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100 shadow"
                  />
                  <h3 className="text-xl font-bold text-blue-700 mb-1">{member.name}</h3>
                  <p className="text-blue-700/80 font-medium mb-3">{member.role}</p>
                  <p className="text-blue-700/80 text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white p-10 rounded-3xl shadow-2xl relative overflow-hidden mt-12 border border-blue-200/40 animate-fade-in-up">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="relative z-10 text-center">
            <h2 className="text-4xl font-extrabold text-black mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl text-blue-700/80 mb-8">
              Join thousands of satisfied travelers who trust HotelBook for their accommodation needs
            </p>
            <Link
              to="/hotels"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-200 animate-fade-in-up"
            >
              Start Exploring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutUs

"use client"

import { Users, Award, Globe, Heart, Shield, Clock, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const AboutUs = () => {
  const stats = [
    { label: "Hotels Worldwide", value: "10,000+", icon: Globe },
    { label: "Happy Customers", value: "500,000+", icon: Users },
    { label: "Countries Served", value: "50+", icon: Award },
    { label: "Years of Experience", value: "10+", icon: Clock },
  ]

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "/placeholder.svg?height=300&width=300",
      bio: "With over 15 years in the hospitality industry, Sarah founded HotelBook to revolutionize how people discover and book accommodations.",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Michael leads our technology team, ensuring our platform provides the best user experience with cutting-edge features.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Emily oversees our global operations, working closely with hotel partners to maintain the highest service standards.",
    },
    {
      name: "David Kim",
      role: "Head of Customer Success",
      image: "/placeholder.svg?height=300&width=300",
      bio: "David ensures every customer has an exceptional experience, leading our support and customer satisfaction initiatives.",
    },
  ]

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "We put our customers at the heart of everything we do, ensuring exceptional service and support.",
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description:
        "Your privacy and security are paramount. We use industry-leading security measures to protect your data.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "We connect travelers with accommodations worldwide, making travel accessible and enjoyable for everyone.",
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description:
        "We carefully vet all our hotel partners to ensure they meet our high standards for quality and service.",
    },
  ]

  return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Background Spots - Style premium */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="container-custom py-8 relative z-10 w-full">
        {/* Hero Section */}
        <section className="bg-white p-10 rounded-3xl shadow-2xl relative overflow-hidden mb-12 border border-blue-200/40 animate-fade-in-up">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-black drop-shadow-lg mb-6">About HotelBook</h1>
            <p className="text-xl text-blue-700/80">
              Your trusted partner in finding the perfect accommodation worldwide
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 p-6 animate-fade-in-up">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-blue-700 font-semibold">{stat.label}</div>
                </div>
              ))}
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

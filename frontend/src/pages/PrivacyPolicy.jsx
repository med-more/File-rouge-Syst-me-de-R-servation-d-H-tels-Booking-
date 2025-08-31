import React from "react"
import { Shield, Lock, User, Globe, Mail } from "lucide-react"

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Background Spots - Style premium */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="container-custom py-8 relative z-10 w-full">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-10 rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up border border-blue-200/40">
            {/* Internal Spots */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <Shield className="h-10 w-10 text-blue-600 mr-2" />
                <h1 className="text-4xl font-extrabold text-black drop-shadow-lg">Privacy Policy</h1>
              </div>
              <p className="text-lg text-blue-700/80 mb-8 text-center animate-fade-in delay-100">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information when you use our hotel booking platform.
              </p>

              <section className="mb-8 animate-fade-in-up">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-4"><User className="h-6 w-6 mr-2 text-blue-400"/> Information We Collect</h2>
                <ul className="list-disc pl-8 text-gray-700 space-y-2">
                  <li>Personal details (name, email, phone number, address)</li>
                  <li>Booking information (dates, hotels, preferences)</li>
                  <li>Payment details (handled securely by our payment partners)</li>
                  <li>Usage data (pages visited, actions on the site)</li>
                </ul>
              </section>

              <section className="mb-8 animate-fade-in-up delay-100">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-4"><Lock className="h-6 w-6 mr-2 text-blue-400"/> How We Use Your Information</h2>
                <ul className="list-disc pl-8 text-gray-700 space-y-2">
                  <li>To process bookings and provide our services</li>
                  <li>To communicate with you about your reservations</li>
                  <li>To improve our platform and personalize your experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8 animate-fade-in-up delay-200">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-4"><Globe className="h-6 w-6 mr-2 text-blue-400"/> Data Sharing & International Transfers</h2>
                <ul className="list-disc pl-8 text-gray-700 space-y-2">
                  <li>We never sell your personal data to third parties</li>
                  <li>We may share data with trusted partners (hotels, payment providers) to fulfill your booking</li>
                  <li>Your data may be processed outside your country, always with strong protection</li>
                </ul>
              </section>

              <section className="mb-8 animate-fade-in-up delay-300">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-4"><Mail className="h-6 w-6 mr-2 text-blue-400"/> Your Rights</h2>
                <ul className="list-disc pl-8 text-gray-700 space-y-2">
                  <li>Access, correct, or delete your personal data at any time</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request a copy of your data or restrict its processing</li>
                </ul>
              </section>

              <section className="mb-8 animate-fade-in-up delay-400">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-4"><Shield className="h-6 w-6 mr-2 text-blue-400"/> Security</h2>
                <p className="text-gray-700">
                  We use industry-standard security measures to protect your data, including encryption, secure servers, and regular audits. Your privacy and trust are our top priorities.
                </p>
              </section>

              <div className="text-center mt-10 animate-fade-in-up delay-500">
                <p className="text-gray-500 text-sm mb-2">Last updated: March 2024</p>
                <a href="/" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-200">Back to Home</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy 
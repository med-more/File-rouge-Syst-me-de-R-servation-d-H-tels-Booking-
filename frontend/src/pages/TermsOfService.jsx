import React from "react"
import { Shield, FileText, CheckCircle, AlertTriangle } from "lucide-react"

const TermsOfService = () => {
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
                <FileText className="h-10 w-10 text-blue-600 mr-2" />
                <h1 className="text-4xl font-extrabold text-black drop-shadow-lg">Terms of Service</h1>
              </div>
              <p className="text-lg text-blue-700/80 mb-8 text-center animate-fade-in delay-100">
                Please read these terms and conditions carefully before using our hotel booking platform.
              </p>

              <section className="mb-8 animate-fade-in-up">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-4"><CheckCircle className="h-6 w-6 mr-2 text-blue-400"/> Acceptance of Terms</h2>
                <p className="text-gray-700">
                  By accessing or using our platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services.
                </p>
              </section>

              <section className="mb-8 animate-fade-in-up delay-100">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-4"><Shield className="h-6 w-6 mr-2 text-blue-400"/> User Responsibilities</h2>
                <ul className="list-disc pl-8 text-gray-700 space-y-2">
                  <li>You must provide accurate and complete information when booking.</li>
                  <li>You are responsible for maintaining the confidentiality of your account.</li>
                  <li>Use the platform only for lawful purposes and in accordance with these terms.</li>
                </ul>
              </section>

              <section className="mb-8 animate-fade-in-up delay-200">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-4"><AlertTriangle className="h-6 w-6 mr-2 text-yellow-400"/> Booking & Cancellation</h2>
                <ul className="list-disc pl-8 text-gray-700 space-y-2">
                  <li>All bookings are subject to availability and confirmation by the hotel.</li>
                  <li>Cancellation policies vary by hotel and booking type. Please review them before booking.</li>
                  <li>We are not responsible for changes or cancellations made by hotels.</li>
                </ul>
              </section>

              <section className="mb-8 animate-fade-in-up delay-300">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-4"><FileText className="h-6 w-6 mr-2 text-blue-400"/> Limitation of Liability</h2>
                <p className="text-gray-700">
                  We strive to provide accurate information, but we do not guarantee the completeness or accuracy of hotel listings. We are not liable for any damages arising from your use of the platform.
                </p>
              </section>

              <section className="mb-8 animate-fade-in-up delay-400">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-4"><Shield className="h-6 w-6 mr-2 text-blue-400"/> Changes to Terms</h2>
                <p className="text-gray-700">
                  We may update these Terms of Service from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.
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

export default TermsOfService 
"use client"

import { useState } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"

const ContactSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  subject: Yup.string().required("Subject is required"),
  message: Yup.string().required("Message is required").min(10, "Message must be at least 10 characters"),
})

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true)
    try {
      await axios.post("/api/contact", values)
      toast.success("Message sent successfully! We'll get back to you soon.")
      resetForm()
    } catch (error) {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-32 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Spots - Style VerifyEmail */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="container-custom py-8 relative z-10 w-full">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
              {/* Internal Spots - Style VerifyEmail */}
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
              <div className="relative z-10 text-center">
                <h1 className="text-4xl font-extrabold mb-4 text-black drop-shadow-lg">Contact Us</h1>
                <p className="text-xl text-gray-600">
              We're here to help and answer any questions you might have
            </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
                <p className="text-gray-600 mb-8">
                  We're here to help you with any questions about our hotel booking platform. Whether you're a traveler
                  looking for the perfect stay or a hotel owner wanting to list your property, we're ready to assist.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="bg-primary-100 rounded-lg p-3">
                        <MapPin className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                      <p className="text-gray-600">
                        123 Hotel Street
                        <br />
                        Business District
                        <br />
                        New York, NY 10001
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="bg-primary-100 rounded-lg p-3">
                        <Phone className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                      <p className="text-gray-600">+1 (555) 987-6543</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="bg-primary-100 rounded-lg p-3">
                        <Mail className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">info@hotelbook.com</p>
                      <p className="text-gray-600">support@hotelbook.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="bg-primary-100 rounded-lg p-3">
                        <Clock className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                      <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                      <p className="text-gray-600">Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form Section */}
              <section className="mt-12">
                <div className="bg-white p-8 rounded-2xl shadow-lg relative overflow-hidden max-w-xl mx-auto">
                  {/* Internal Spots - Style VerifyEmail */}
                  <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                  <div className="relative z-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Send us a Message</h2>
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
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Your Name
                              </label>
                              <Field
                                type="text"
                                id="name"
                                name="name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                placeholder="John Doe"
                              />
                              <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            <div>
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                              </label>
                              <Field
                                type="email"
                                id="email"
                                name="email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                placeholder="john@example.com"
                              />
                              <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                              Subject
                            </label>
                            <Field
                              type="text"
                              id="subject"
                              name="subject"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                              placeholder="How can we help you?"
                            />
                            <ErrorMessage name="subject" component="div" className="mt-1 text-sm text-red-600" />
                          </div>
                          <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                              Message
                            </label>
                            <Field
                              as="textarea"
                              id="message"
                              name="message"
                              rows={6}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                              placeholder="Your message here..."
                            />
                            <ErrorMessage name="message" component="div" className="mt-1 text-sm text-red-600" />
                          </div>
                          <div className="flex justify-center">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-xl hover:from-blue-700 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmitting ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Sending...
                                </div>
                              ) : (
                                <>
                                  Send Message
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
              </section>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find answers to common questions about our hotel booking platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I cancel my booking?</h3>
                <p className="text-gray-600 mb-6">
                  You can cancel your booking by going to "My Bookings" in your account dashboard. Cancellation policies
                  vary by hotel and booking type.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my payment information secure?</h3>
                <p className="text-gray-600 mb-6">
                  Yes, we use industry-standard encryption and work with trusted payment processors like Stripe to ensure
                  your payment information is completely secure.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I modify my booking dates?</h3>
                <p className="text-gray-600">
                  Booking modifications depend on the hotel's policy and availability. Contact us or the hotel directly to
                  request changes to your reservation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I list my hotel on the platform?</h3>
                <p className="text-gray-600 mb-6">
                  Hotel owners can contact our partnership team to discuss listing requirements and get started with our
                  platform. We'll guide you through the entire process.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">What if I need help during my stay?</h3>
                <p className="text-gray-600 mb-6">
                  For issues during your stay, contact the hotel directly first. If you need additional assistance, our
                  customer support team is available 24/7 to help resolve any problems.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer group booking discounts?</h3>
                <p className="text-gray-600">
                  Yes, we offer special rates for group bookings. Contact our sales team with your requirements, and we'll
                  help you find the best deals for your group.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Contact

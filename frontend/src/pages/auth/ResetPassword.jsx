"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Mail, ArrowLeft } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import Lottie from "lottie-react"
import resetPasswordAnimation from "../../data/reset-password.json"

const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
})

const ResetPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await axios.post("/api/auth/reset-password", values)
      setIsSubmitted(true)
      toast.success("Password reset link sent to your email!")
    } catch (error) {
      setFieldError("email", error.response?.data?.message || "Failed to send reset email")
    }
    setSubmitting(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Check your email</h2>
            <p className="mt-2 text-sm text-gray-600">We've sent a password reset link to your email address.</p>
            <div className="mt-6">
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Back to sign in
              </Link>
            </div>
          </div>
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
                <Link to="/login" className="flex items-center text-primary-600 hover:text-primary-500 mb-6">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <Formik initialValues={{ email: "" }} validationSchema={ResetPasswordSchema} onSubmit={handleSubmit}>
                {({ isSubmitting }) => (
                  <Form className="mt-8 space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1 relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Field
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="Enter your email"
                        />
                      </div>
                      <ErrorMessage name="email" component="div" className="mt-2 text-sm text-red-600" />
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {isSubmitting ? "Sending..." : "Send reset link"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
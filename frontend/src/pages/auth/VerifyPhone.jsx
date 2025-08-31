"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Phone, CheckCircle, XCircle } from "lucide-react"
import axios from "axios"
import Lottie from "lottie-react"
import verifyPhoneAnimation from "../../data/verify-phone.json"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

const VerifyPhoneSchema = Yup.object().shape({
  code: Yup.string()
    .required("Verification code is required")
    .matches(/^\d{6}$/, "Code must be 6 digits"),
})

const VerifyPhone = () => {
  const [status, setStatus] = useState("pending") // pending, success, error
  const [message, setMessage] = useState("")
  const location = useLocation()
  const phone = location.state?.phone

  const handleVerifyCode = async (values, { setSubmitting, setFieldError }) => {
    try {
      const response = await axios.post("/api/auth/verify-phone", {
        phone,
        code: values.code,
      })
      setStatus("success")
      setMessage(response.data.message)
    } catch (error) {
      setFieldError("code", error.response?.data?.message || "Invalid verification code")
    }
    setSubmitting(false)
  }

  const resendVerification = async () => {
    try {
      await axios.post("/api/auth/resend-phone-verification", { phone })
      setMessage("Verification code sent successfully!")
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to resend verification code")
    }
  }

  return (
    <div className="min-h-screen pt-32 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="max-w-6xl w-full flex items-center justify-between gap-16 relative z-10">
        <div className="hidden lg:block w-1/3">
          <div className="w-64 mx-auto">
            <Lottie animationData={verifyPhoneAnimation} loop={true} />
          </div>
        </div>
        <div className="w-full lg:w-2/3">
          <div className="bg-white p-8 rounded-2xl shadow-lg relative overflow-hidden max-w-xl mx-auto">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="relative z-10 text-center">
              {status === "success" ? (
                <>
                  <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Phone Verified!</h2>
                  <p className="mt-2 text-sm text-gray-600">{message || "Your phone number has been successfully verified."}</p>
                  <div className="mt-6">
                    <Link
                      to="/login"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                    >
                      Continue to Sign In
                    </Link>
                  </div>
                </>
              ) : status === "error" ? (
                <>
                  <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verification Failed</h2>
                  <p className="mt-2 text-sm text-gray-600">{message}</p>
                  <div className="mt-6 space-y-4">
                    <button
                      onClick={resendVerification}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                    >
                      Resend Verification Code
                    </button>
                    <div>
                      <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        Back to Sign In
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verify your phone</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    We've sent a verification code to {phone}. Please enter the code below to verify your phone number.
                  </p>
                  <Formik
                    initialValues={{ code: "" }}
                    validationSchema={VerifyPhoneSchema}
                    onSubmit={handleVerifyCode}
                  >
                    {({ isSubmitting }) => (
                      <Form className="mt-8 space-y-6">
                        <div>
                          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                            Verification Code
                          </label>
                          <div className="mt-1">
                            <Field
                              id="code"
                              name="code"
                              type="text"
                              maxLength="6"
                              className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center tracking-widest"
                              placeholder="Enter 6-digit code"
                            />
                          </div>
                          <ErrorMessage name="code" component="div" className="mt-2 text-sm text-red-600" />
                        </div>

                        <div className="space-y-4">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {isSubmitting ? "Verifying..." : "Verify Code"}
                          </button>
                          <button
                            type="button"
                            onClick={resendVerification}
                            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                          >
                            Resend Code
                          </button>
                          <div>
                            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                              Back to Sign In
                            </Link>
                          </div>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyPhone

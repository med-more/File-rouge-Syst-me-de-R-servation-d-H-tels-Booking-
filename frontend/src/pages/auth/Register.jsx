"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Shield, Gift, Clock, ChevronDown, Search } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import countriesData from "../../data/countries.json"
import Lottie from "lottie-react"
import registerAnimation from "../../data/register.json"

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  countryCode: Yup.string().required("Country code is required"),
  phone: Yup.string()
    .matches(/^[0-9]{9,15}$/, "Phone number must be between 9 and 15 digits")
    .required("Phone number is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
  agreeToTerms: Yup.boolean()
    .oneOf([true], "You must agree to the terms and conditions")
    .required("You must agree to the terms and conditions"),
})

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showCountryList, setShowCountryList] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(
    countriesData.countries.find(country => country.code === "+212") || countriesData.countries[0]
  )
  const [countrySearchTerm, setCountrySearchTerm] = useState("")
  const countryDropdownRef = useRef(null)
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const filteredCountries = countriesData.countries.filter(country =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
    country.code.includes(countrySearchTerm)
  )

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryList(false)
        setCountrySearchTerm("")
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile")
    }
  }, [isAuthenticated, navigate])

  const handleCountrySelect = (country, setFieldValue) => {
    setSelectedCountry(country)
    setFieldValue("countryCode", country.code)
    setShowCountryList(false)
    setCountrySearchTerm("")
  }

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    const result = await register(values.name, values.email, values.countryCode, values.phone, values.password)
    if (result.success) {
      navigate("/verify-email", { 
        state: { email: values.email },
        replace: true 
      })
    } else {
      setFieldError("email", result.error)
    }
    setSubmitting(false)
  }

  /* const handleGoogleSignIn = () => {
  } */

  const benefits = [
    {
      icon: Gift,
      title: "Welcome Bonus",
      description: "Get 10% off your first booking",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Your payment information is always protected",
    },
    {
      icon: Clock,
      title: "Instant Confirmation",
      description: "Get booking confirmations in seconds",
    },
  ]

  return (
    <div className="min-h-screen bg-white flex -mt-16 pt-32 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
      </div>

      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-8">
        <div className="max-w-md w-full -mt-56">
          <Lottie animationData={registerAnimation} loop={true} />
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200">
            <div className="text-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-full p-2 sm:p-3 w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg">
                <User className="h-6 sm:h-8 w-6 sm:w-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Create Account</h2>
              <p className="text-sm sm:text-base text-gray-600">Join thousands of happy travelers</p>
            </div>

            <Formik
              initialValues={{
                name: "",
                email: "",
                countryCode: selectedCountry.code,
                phone: "",
                password: "",
                confirmPassword: "",
                agreeToTerms: false,
              }}
              validationSchema={RegisterSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, setFieldValue }) => (
                <Form className="space-y-3 sm:space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs sm:text-sm">
                      <span className="px-2 bg-white text-gray-500">Sign up with Email</span>
                    </div>
                  </div>

                  {/* <button
                    type="button"
                    onClick={() => handleGoogleSignIn()}
                    className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign up with Google
                  </button> */}

                  {/* <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs sm:text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div> */}

                  <div>
                    <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      <Field
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <ErrorMessage name="name" component="div" className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your email"
                      />
                    </div>
                    <ErrorMessage name="email" component="div" className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Phone Number
                    </label>
                    <div className="relative flex">
                      <div className="relative" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setShowCountryList(!showCountryList)}
                          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 sm:py-3 bg-white border border-gray-300 rounded-l-lg text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[90px] sm:min-w-[100px]"
                        >
                          <span className="text-base sm:text-lg leading-none">{selectedCountry.flag}</span>
                          <span className="text-xs sm:text-sm font-medium">{selectedCountry.code}</span>
                          <ChevronDown className={`h-3 sm:h-4 w-3 sm:w-4 transition-transform duration-200 ${showCountryList ? 'rotate-180' : ''}`} />
                        </button>
                        {showCountryList && (
                          <div className="absolute z-50 mt-1 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[200px] overflow-hidden">
                            <div className="bg-gray-50 px-2 sm:px-3 py-2 border-b border-gray-200">
                              <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search countries..."
                                  value={countrySearchTerm}
                                  onChange={(e) => setCountrySearchTerm(e.target.value)}
                                  className="w-full pl-7 sm:pl-8 pr-2 sm:pr-3 py-1.5 text-xs sm:text-sm bg-white rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            <div className="overflow-y-auto max-h-[150px] bg-white">
                              {filteredCountries.length > 0 ? (
                                filteredCountries.map((country, index) => (
                                  <button
                                    key={country.code + index}
                                    type="button"
                                    onClick={() => handleCountrySelect(country, setFieldValue)}
                                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left hover:bg-blue-50 flex items-center space-x-2 transition-colors duration-200 border-b border-gray-50 last:border-b-0 ${
                                      selectedCountry.code === country.code ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                                  >
                                    <span className="text-sm sm:text-base flex-shrink-0 leading-none">{country.flag}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{country.name}</div>
                                      <div className="text-xs text-gray-500">{country.code}</div>
                                    </div>
                                    {selectedCountry.code === country.code && (
                                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-4 text-center text-gray-500 text-xs sm:text-sm">
                                  No countries found matching "{countrySearchTerm}"
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 relative">
                        <Phone className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        <Field
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-r-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    <ErrorMessage name="phone" component="div" className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      <Field
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      <Field
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Confirm your password"
                      />
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-red-600" />
                  </div>

                  <div className="flex items-start pt-1 sm:pt-2">
                    <Field
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      className="mt-0.5 sm:mt-1 h-3 sm:h-4 w-3 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="agreeToTerms" className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-700">
                      I agree to the{" "}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  <ErrorMessage name="agreeToTerms" component="div" className="text-xs sm:text-sm text-red-600" />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-lg hover:shadow-xl mt-4 sm:mt-6"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 sm:h-5 w-4 sm:w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-1.5 sm:ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
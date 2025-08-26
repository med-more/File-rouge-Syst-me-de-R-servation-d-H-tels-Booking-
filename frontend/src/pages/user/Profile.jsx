"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { User, Mail, Phone, Lock, Camera, Shield, Bell, CreditCard, Eye, EyeOff } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import axios from "axios"
// Utiliser le logout du contexte d'authentification

const ProfileSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
})

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string().min(6, "Password must be at least 6 characters").required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
})

const Profile = () => {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("profile")
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null)
  const [notifications, setNotifications] = useState({
    emailBookingConfirmation: true,
    emailPromotions: false,
    smsBookingReminders: true,
    smsPromotions: false,
  })

  useEffect(() => {
    if (user) {
      setImagePreview(user.profileImage)
    }
  }, [user])

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        profileImage: imagePreview || user?.profileImage || ""
      }
      const result = await updateProfile(payload)
      if (result.success) {
        toast.success("Profile updated successfully!")
      }
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success("Password changed successfully!")
      resetForm()
    } finally {
      setSubmitting(false)
    }
  }

  const handleNotificationChange = async (key, value) => {
    const updatedSettings = { ...notifications, [key]: value }
    setNotifications(updatedSettings)
    toast.info("Préférences enregistrées localement")
  }

  const handleVerifyPhone = () => {
    navigate("/verify-phone", { state: { phone: user.phone } })
  }

  const handleDeleteAccount = () => {
    const toastId = toast.info(
      (
        <div className="space-y-3">
          <p className="text-sm text-gray-800">
            Are you sure you want to delete your account? This action is irreversible.
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-md text-white bg-red-600 hover:bg-red-700 text-sm"
              onClick={async () => {
                try {
                  await axios.delete('http://localhost:5000/api/profile')
                  toast.update(toastId, {
                    render: 'Account deleted successfully',
                    type: 'success',
                    autoClose: 2000,
                    closeOnClick: true,
                  })
                  logout()
                  navigate('/')
                } catch (error) {
                  toast.update(toastId, {
                    render: 'Failed to delete account',
                    type: 'error',
                    autoClose: 3000,
                    closeOnClick: true,
                  })
                }
              }}
            >
              Confirm
            </button>
            <button
              className="px-3 py-1.5 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm"
              onClick={() => toast.dismiss(toastId)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
        closeButton: false,
      }
    )
  }

  const tabs = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Background Spots - Style premium */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="container-custom py-8 relative z-10 w-full">
        <div className="max-w-5xl mx-auto">
          {/* Header Card */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl relative overflow-hidden mb-8 border border-blue-200/40 animate-fade-in-up">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            <div className="relative z-10 text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold text-black drop-shadow-lg mb-2">Account Settings</h1>
              <p className="text-lg text-blue-700/80">Manage your account information and preferences</p>
            </div>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in-up">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
              <nav className="space-y-2 bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-blue-200/30 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-base font-semibold rounded-xl transition-all duration-200 mb-2 last:mb-0 focus:outline-none ${
                    activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg scale-105"
                        : "text-blue-700 hover:bg-blue-50 hover:scale-105"
                  }`}
                >
                    <tab.icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? "text-white" : "text-blue-400"}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-blue-200/40 relative overflow-hidden animate-fade-in-up">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
                <div className="relative z-10">
              {/* Profile Information Tab */}
              {activeTab === "profile" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

                  {/* Profile Image */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-4">Profile Picture</label>
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg?height=100&width=100"}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                        />
                        <label className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-colors">
                          <Camera className="h-4 w-4 text-white" />
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Upload a new profile picture. JPG, PNG or GIF. Max size 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <Formik
                    initialValues={{
                      name: user.name || "",
                      email: user.email || "",
                      phone: user.phone || "",
                    }}
                    validationSchema={ProfileSchema}
                    onSubmit={handleProfileSubmit}
                    enableReinitialize
                  >
                    {({ isSubmitting }) => (
                      <Form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Field
                                id="name"
                                name="name"
                                type="text"
                                className="input-field pl-10"
                                placeholder="Enter your full name"
                              />
                            </div>
                            <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Field
                                id="email"
                                name="email"
                                type="email"
                                className="input-field pl-10"
                                placeholder="Enter your email"
                              />
                              {user.emailVerified && (
                                <div className="absolute right-3 top-3">
                                  <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded">
                                    Verified
                                  </span>
                                </div>
                              )}
                            </div>
                            <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Field
                              id="phone"
                              name="phone"
                              type="tel"
                              className="input-field pl-10 pr-20"
                              placeholder="Enter your phone number"
                            />
                            {user.phoneVerified ? (
                              <div className="absolute right-3 top-3">
                                <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded">Verified</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleVerifyPhone}
                                className="absolute right-3 top-2 text-xs text-primary-600 hover:text-primary-700"
                              >
                                Verify
                              </button>
                            )}
                          </div>
                          <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? "Updating..." : "Update Profile"}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

                  {/* Change Password */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                    <Formik
                      initialValues={{
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      }}
                      validationSchema={PasswordSchema}
                      onSubmit={handlePasswordSubmit}
                    >
                      {({ isSubmitting }) => (
                        <Form className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Field
                                name="currentPassword"
                                type={showPasswords.current ? "text" : "password"}
                                className="input-field pl-10 pr-10"
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                              >
                                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                            <ErrorMessage
                              name="currentPassword"
                              component="div"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Field
                                name="newPassword"
                                type={showPasswords.new ? "text" : "password"}
                                className="input-field pl-10 pr-10"
                                placeholder="Enter new password"
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                              >
                                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                            <ErrorMessage name="newPassword" component="div" className="mt-1 text-sm text-red-600" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Field
                                name="confirmPassword"
                                type={showPasswords.confirm ? "text" : "password"}
                                className="input-field pl-10 pr-10"
                                placeholder="Confirm new password"
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                              >
                                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                            <ErrorMessage
                              name="confirmPassword"
                              component="div"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmitting ? "Changing..." : "Change Password"}
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>

                  {/* Account Actions */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Delete Account</h4>
                          <p className="text-sm text-gray-600">
                            Permanently delete your account and all associated data
                          </p>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Booking Confirmations</h4>
                            <p className="text-sm text-gray-600">Receive email confirmations for your bookings</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.emailBookingConfirmation}
                              onChange={(e) => handleNotificationChange("emailBookingConfirmation", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Promotions & Offers</h4>
                            <p className="text-sm text-gray-600">Receive emails about special deals and promotions</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.emailPromotions}
                              onChange={(e) => handleNotificationChange("emailPromotions", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Booking Reminders</h4>
                            <p className="text-sm text-gray-600">Receive SMS reminders about upcoming bookings</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.smsBookingReminders}
                              onChange={(e) => handleNotificationChange("smsBookingReminders", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Promotional SMS</h4>
                            <p className="text-sm text-gray-600">Receive SMS about special deals and offers</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.smsPromotions}
                              onChange={(e) => handleNotificationChange("smsPromotions", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === "billing" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
                      <p className="text-gray-600 mb-4">Manage your saved payment methods for faster checkout.</p>
                      <button className="btn-primary">Add Payment Method</button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Billing History</h3>
                      <p className="text-gray-600 mb-4">View and download your booking receipts and invoices.</p>
                      <button className="btn-secondary">View Billing History</button>
                    </div>
                  </div>
                </div>
              )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { AuthProvider } from "./contexts/AuthContext"
import { BookingProvider } from "./contexts/BookingContext"

import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"

import Home from "./pages/Home"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ResetPassword from "./pages/auth/ResetPassword"
import VerifyEmail from "./pages/auth/VerifyEmail"
import VerifyPhone from "./pages/auth/VerifyPhone"
import Hotels from "./pages/Hotels"
import HotelDetails from "./pages/HotelDetails"
import AboutUs from "./pages/AboutUs"
import Contact from "./pages/Contact"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsOfService from "./pages/TermsOfService"
import FAQ from "./pages/FAQ"
import Favorites from "./pages/Favorites"

import Profile from "./pages/user/Profile"
import MyBookings from "./pages/user/MyBookings"
import PaymentPage from "./pages/PaymentPage"

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard"
import ManageHotels from "./pages/admin/ManageHotels"
import ManageRooms from "./pages/admin/ManageRooms"
import ManageUsers from "./pages/admin/ManageUsers"
import ManagePayments from "./pages/admin/ManagePayments"

// Route Protection
import ProtectedRoute from "./components/auth/ProtectedRoute"
import AdminRoute from "./components/auth/AdminRoute"

const toastStyles = {
  success: {
    style: {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #86efac",
    },
    progressStyle: {
      background: "#22c55e",
    },
  },
  error: {
    style: {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fca5a5",
    },
    progressStyle: {
      background: "#ef4444",
    },
  },
}

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-phone" element={<VerifyPhone />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/hotels/:id" element={<HotelDetails />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/favorites" element={<Favorites />} />

                {/* Protected User Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/hotels"
                  element={
                    <AdminRoute>
                      <ManageHotels />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/rooms"
                  element={
                    <AdminRoute>
                      <ManageRooms />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <ManageUsers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <AdminRoute>
                      <ManagePayments />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
            <ToastContainer
              position="bottom-left"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              toastStyle={toastStyles.success.style}
              progressStyle={toastStyles.success.progressStyle}
            />
          </div>
        </Router>
      </BookingProvider>
    </AuthProvider>
  )
}

// Fonction utilitaire pour afficher les notifications
export const showToast = (type, message) => {
  const options = {
    position: "bottom-left",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: type === "success" ? toastStyles.success.style : toastStyles.error.style,
    progressStyle: type === "success" ? toastStyles.success.progressStyle : toastStyles.error.progressStyle,
  }

  if (type === "success") {
    toast.success(message, options)
  } else if (type === "error") {
    toast.error(message, options)
  }
}

export default App
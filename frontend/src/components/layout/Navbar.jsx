"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, User, LogOut, Settings, Calendar, Shield, ChevronDown, Bell, Heart } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showNavbar, setShowNavbar] = useState(true)
  const scrollTimeout = useRef(null)
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      setShowNavbar(true)
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
      scrollTimeout.current = setTimeout(() => {
        setShowNavbar(false)
      }, 1500)
      lastScrollY = window.scrollY
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    navigate("/")
  }

  const isActivePath = (path) => {
    return location.pathname === path
  }

  const navLinks = [
    { name: "Hotels", href: "/hotels" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  const userMenuItems = [
    { name: "My Profile", href: "/profile", icon: User },
    { name: "My Bookings", href: "/my-bookings", icon: Calendar },
    { name: "Settings", href: "/profile", icon: Settings },
  ]

  if (isAdmin) {
    userMenuItems.push({ name: "Admin Dashboard", href: "/admin", icon: Shield })
  }

  return (
    <nav
      className={`fixed w-[95%] left-1/2 -translate-x-1/2 top-4 z-50 transition-all duration-500 rounded-2xl backdrop-blur-2xl
        ${scrolled
          ? "bg-gradient-to-r from-yellow-100/80 via-white/80 to-yellow-100/80 shadow-lg border-b border-yellow-200/30" 
          : "bg-gradient-to-r from-yellow-500/30 via-primary-800/80 to-yellow-500/30 border-b border-yellow-400/20"}
        ${showNavbar ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0 pointer-events-none"}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-2 group-hover:from-primary-700 group-hover:to-primary-800 transition-all duration-200">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">H</span>
              </div>
            </div>
            <span
              className={`text-2xl font-bold transition-colors duration-200 ${
                scrolled ? "text-gray-900" : "text-white"
              }`}
            >
              HotelBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`font-medium transition-all duration-200 relative group ${
                  isActivePath(link.href)
                    ? scrolled
                      ? "text-primary-600"
                      : "text-yellow-300"
                    : scrolled
                      ? "text-gray-700 hover:text-primary-600"
                      : "text-white/90 hover:text-white"
                }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-200 group-hover:w-full ${
                    isActivePath(link.href)
                      ? scrolled
                        ? "bg-primary-600 w-full"
                        : "bg-yellow-300 w-full"
                      : scrolled
                        ? "bg-primary-600"
                        : "bg-white"
                  }`}
                ></span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button
                  className={`p-2 rounded-xl transition-all duration-200 relative ${
                    scrolled
                      ? "text-gray-600 hover:text-primary-600 hover:bg-gray-100"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                {/* Favorites */}
                <button
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    scrolled
                      ? "text-gray-600 hover:text-primary-600 hover:bg-gray-100"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Heart className="h-5 w-5" />
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center space-x-3 p-2 rounded-xl transition-all duration-200 ${
                      scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="font-medium">{user?.name}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-hard border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>

                      {userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <item.icon className="h-4 w-4 mr-3 text-gray-500" />
                          {item.name}
                        </Link>
                      ))}

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`font-medium px-4 py-2 rounded-xl transition-all duration-200 ${
                    scrolled ? "text-gray-700 hover:text-primary-600 hover:bg-gray-100" : "text-white hover:bg-white/10"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold px-6 py-2 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                scrolled ? "text-gray-600 hover:text-primary-600 hover:bg-gray-100" : "text-white hover:bg-white/10"
              }`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md rounded-2xl mt-2 shadow-soft border border-gray-100">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors ${
                    isActivePath(link.href)
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center px-3 py-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>

                  {userMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                    >
                      <item.icon className="h-5 w-5 mr-3 text-gray-500" />
                      {item.name}
                    </Link>
                  ))}

                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors mt-2"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-xl text-base font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

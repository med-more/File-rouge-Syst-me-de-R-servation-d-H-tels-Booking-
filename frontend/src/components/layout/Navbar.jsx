"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, User, LogOut, Settings, Calendar, Shield, ChevronDown, Bell, Heart, Crown } from "lucide-react"
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

  // Debug log pour vérifier l'état admin
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Navbar - Auth state:', {
        user: user?.name,
        userRole: user?.role,
        isAdmin,
        isAuthenticated
      })
    }
  }, [isAuthenticated, user, isAdmin])

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

  // Fermer le menu mobile quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.mobile-menu')) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    setIsOpen(false)
    navigate("/")
  }

  const isActivePath = (path) => {
    return location.pathname === path
  }

  // Liens de navigation pour tous les utilisateurs
  const publicNavLinks = [
    { name: "Hotels", href: "/hotels", icon: null },
    { name: "About", href: "/about", icon: null },
    { name: "Contact", href: "/contact", icon: null },
  ]

  // Liens de navigation pour les utilisateurs connectés
  const authenticatedNavLinks = [
    { name: "Hotels", href: "/hotels", icon: null },
    { name: "Mes Réservations", href: "/my-bookings", icon: Calendar },
    { name: "About", href: "/about", icon: null },
    { name: "Contact", href: "/contact", icon: null },
  ]

  // Menu utilisateur normal
  const userMenuItems = [
    { name: "Mon Profil", href: "/profile", icon: User },
    { name: "Mes Réservations", href: "/my-bookings", icon: Calendar },
    { name: "Paramètres", href: "/profile", icon: Settings },
  ]

  // Menu admin séparé
  const adminMenuItems = [
    { name: "Dashboard Admin", href: "/admin", icon: Shield },
    { name: "Gestion Hôtels", href: "/admin/hotels", icon: Settings },
    { name: "Gestion Utilisateurs", href: "/admin/users", icon: User },
    { name: "Gestion Paiements", href: "/admin/payments", icon: Calendar },
  ]

  // Masquer la navbar pour les admins
  if (isAdmin) {
    return null
  }

  return (
    <nav
      className={`fixed w-[95%] left-1/2 -translate-x-1/2 top-2 sm:top-4 z-50 transition-all duration-500 rounded-xl sm:rounded-2xl backdrop-blur-2xl
        ${scrolled
          ? "bg-gradient-to-r from-yellow-100/90 via-white/90 to-yellow-100/90 shadow-lg border border-yellow-200/30" 
          : "bg-gradient-to-r from-yellow-500/40 via-primary-800/90 to-yellow-500/40 border border-yellow-400/20"}
        ${showNavbar ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0 pointer-events-none"}
      `}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg sm:rounded-xl p-1.5 sm:p-2 group-hover:from-primary-700 group-hover:to-primary-800 transition-all duration-200">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-md sm:rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-bold text-sm sm:text-lg">H</span>
              </div>
            </div>
            <span
              className={`text-lg sm:text-xl lg:text-2xl font-bold transition-colors duration-200 ${
                scrolled ? "text-gray-900" : "text-white"
              }`}
            >
              HotelBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {/* Navigation normale - masquée pour les admins */}
            {!isAdmin && (isAuthenticated ? authenticatedNavLinks : publicNavLinks).map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`font-medium transition-all duration-200 relative group text-sm xl:text-base flex items-center space-x-1.5 ${
                  isActivePath(link.href)
                    ? scrolled
                      ? "text-primary-600"
                      : "text-yellow-300"
                    : scrolled
                      ? "text-gray-700 hover:text-primary-600"
                      : "text-white/90 hover:text-white"
                }`}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                <span>{link.name}</span>
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

            {/* Admin Navigation Links - Visible seulement pour les admins */}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className={`font-medium transition-all duration-200 relative group flex items-center space-x-1.5 sm:space-x-2 text-sm xl:text-base ${
                    isActivePath("/admin")
                      ? scrolled
                        ? "text-yellow-600"
                        : "text-yellow-300"
                      : scrolled
                        ? "text-gray-700 hover:text-yellow-600"
                        : "text-white/90 hover:text-yellow-300"
                  }`}
                >
                  <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Dashboard</span>
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-200 group-hover:w-full ${
                      isActivePath("/admin")
                        ? scrolled
                          ? "bg-yellow-600 w-full"
                          : "bg-yellow-300 w-full"
                        : scrolled
                          ? "bg-yellow-600"
                          : "bg-yellow-300"
                    }`}
                  ></span>
                </Link>
                <Link
                  to="/admin/hotels"
                  className={`font-medium transition-all duration-200 relative group flex items-center space-x-1.5 sm:space-x-2 text-sm xl:text-base ${
                    isActivePath("/admin/hotels")
                      ? scrolled
                        ? "text-yellow-600"
                        : "text-yellow-300"
                      : scrolled
                        ? "text-gray-700 hover:text-yellow-600"
                        : "text-white/90 hover:text-yellow-300"
                  }`}
                >
                  <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Hôtels</span>
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-200 group-hover:w-full ${
                      isActivePath("/admin/hotels")
                        ? scrolled
                          ? "bg-yellow-600 w-full"
                          : "bg-yellow-300 w-full"
                        : scrolled
                          ? "bg-yellow-600"
                          : "bg-yellow-300"
                    }`}
                  ></span>
                </Link>
                <Link
                  to="/admin/users"
                  className={`font-medium transition-all duration-200 relative group flex items-center space-x-1.5 sm:space-x-2 text-sm xl:text-base ${
                    isActivePath("/admin/users")
                      ? scrolled
                        ? "text-yellow-600"
                        : "text-yellow-300"
                      : scrolled
                        ? "text-gray-700 hover:text-yellow-600"
                        : "text-white/90 hover:text-yellow-300"
                  }`}
                >
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Utilisateurs</span>
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-200 group-hover:w-full ${
                      isActivePath("/admin/users")
                        ? scrolled
                          ? "bg-yellow-600 w-full"
                          : "bg-yellow-300 w-full"
                        : scrolled
                          ? "bg-yellow-600"
                          : "bg-yellow-300"
                    }`}
                  ></span>
                </Link>
                <Link
                  to="/admin/payments"
                  className={`font-medium transition-all duration-200 relative group flex items-center space-x-1.5 sm:space-x-2 text-sm xl:text-base ${
                    isActivePath("/admin/payments")
                      ? scrolled
                        ? "text-yellow-600"
                        : "text-yellow-300"
                      : scrolled
                        ? "text-gray-700 hover:text-yellow-600"
                        : "text-white/90 hover:text-yellow-300"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Paiements</span>
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-200 group-hover:w-full ${
                      isActivePath("/admin/payments")
                        ? scrolled
                          ? "bg-yellow-600 w-full"
                          : "bg-yellow-300 w-full"
                        : scrolled
                          ? "bg-yellow-600"
                          : "bg-yellow-300"
                    }`}
                  ></span>
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications et Favorites - masqués pour les admins */}
                {!isAdmin && (
                  <>
                

                    {/* Favorites */}
                    <Link
                      to="/favorites"
                      className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200 ${
                        scrolled
                          ? "text-gray-600 hover:text-primary-600 hover:bg-gray-100"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                      }`}
                      title="Mes favoris"
                    >
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200 ${
                      scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
                    }`}
                  >
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="avatar"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/40"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    ) : (
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                        isAdmin 
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600" 
                          : "bg-gradient-to-r from-primary-500 to-primary-600"
                      }`}>
                        <span className="text-white font-semibold text-xs sm:text-sm">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <span className="font-medium text-sm sm:text-base hidden xl:block">{user?.name}</span>
                      {isAdmin && <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />}
                    </div>
                    <ChevronDown
                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl sm:rounded-2xl shadow-hard border border-gray-100 py-1 z-50 max-h-[70vh] overflow-y-auto">
                      <div className="px-3 sm:px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                          {isAdmin && <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>

                      {/* Menu utilisateur normal - masqué pour les admins */}
                      {!isAdmin && (
                        <div className="py-1">
                          <p className="px-3 sm:px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Mon Compte
                          </p>
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <item.icon className="h-4 w-4 mr-2.5 text-gray-500" />
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Menu admin - seulement pour les admins */}
                      {isAdmin && (
                        <div className="py-1 border-t border-gray-100">
                          <p className="px-3 sm:px-4 py-1.5 text-xs font-semibold text-yellow-600 uppercase tracking-wider flex items-center">
                            <Crown className="h-3 w-3 mr-2" />
                            Admin
                          </p>
                          {adminMenuItems.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 transition-colors"
                            >
                              <item.icon className="h-4 w-4 mr-2.5 text-yellow-500" />
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      )}

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-3 sm:px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-2.5" />
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  to="/login"
                  className={`font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base ${
                    scrolled ? "text-gray-700 hover:text-primary-600 hover:bg-gray-100" : "text-white hover:bg-white/10"
                  }`}
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200 ${
                scrolled ? "text-gray-600 hover:text-primary-600 hover:bg-gray-100" : "text-white hover:bg-white/10"
              }`}
            >
              {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl mt-2 shadow-soft border border-gray-100 max-h-[80vh] overflow-y-auto">
              {/* Navigation normale - masquée pour les admins */}
              {!isAdmin && (isAuthenticated ? authenticatedNavLinks : publicNavLinks).map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors flex items-center space-x-2 ${
                    isActivePath(link.href)
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  }`}
                >
                  {link.icon && <link.icon className="h-4 w-4 sm:h-5 sm:w-5" />}
                  <span>{link.name}</span>
                </Link>
              ))}

              {/* Admin Navigation Links Mobile - Visible seulement pour les admins */}
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors flex items-center space-x-2 ${
                      isActivePath("/admin")
                        ? "text-yellow-600 bg-yellow-50"
                        : "text-gray-700 hover:text-yellow-600 hover:bg-yellow-50"
                    }`}
                  >
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/admin/hotels"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors flex items-center space-x-2 ${
                      isActivePath("/admin/hotels")
                        ? "text-yellow-600 bg-yellow-50"
                        : "text-gray-700 hover:text-yellow-600 hover:bg-yellow-50"
                    }`}
                  >
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Hôtels</span>
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors flex items-center space-x-2 ${
                      isActivePath("/admin/users")
                        ? "text-yellow-600 bg-yellow-50"
                        : "text-gray-700 hover:text-yellow-600 hover:bg-yellow-50"
                    }`}
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Utilisateurs</span>
                  </Link>
                  <Link
                    to="/admin/payments"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors flex items-center space-x-2 ${
                      isActivePath("/admin/payments")
                        ? "text-yellow-600 bg-yellow-50"
                        : "text-gray-700 hover:text-yellow-600 hover:bg-yellow-50"
                    }`}
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Paiements</span>
                  </Link>
                </>
              )}

              {isAuthenticated ? (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center px-3 py-3 mb-3">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="avatar"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover mr-3 border border-gray-200"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    ) : (
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-3 ${
                        isAdmin 
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600" 
                          : "bg-gradient-to-r from-primary-500 to-primary-600"
                      }`}>
                        <span className="text-white font-semibold text-sm sm:text-base">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        {isAdmin && <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Administrateur
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu utilisateur mobile - masqué pour les admins */}
                  {!isAdmin && (
                    <div className="mb-2">
                      <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Mon Compte
                      </p>
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-3 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                        >
                          <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2.5 text-gray-500" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Menu admin mobile */}
                  {isAdmin && (
                    <div className="mb-2 border-t border-gray-200 pt-2">
                      <p className="px-3 py-1.5 text-xs font-semibold text-yellow-600 uppercase tracking-wider flex items-center">
                        <Crown className="h-3 w-3 mr-2" />
                        Admin
                      </p>
                      {adminMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-3 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                        >
                          <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2.5 text-yellow-500" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
                  >
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2.5" />
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200"
                  >
                    S'inscrire
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

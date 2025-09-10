"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { 
  Shield, 
  Settings, 
  Users, 
  Calendar, 
  LogOut, 
  Menu, 
  X,
  Crown,
  ChevronLeft,
  ChevronRight,
  Home
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true) // Par défaut collapsed
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Fermer le menu mobile sur resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fermer le menu mobile quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileOpen && !event.target.closest('.admin-sidebar')) {
        setIsMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileOpen])

  const handleLogout = () => {
    logout()
    setIsMobileOpen(false)
    navigate("/")
  }

  const isActivePath = (path) => {
    return location.pathname === path
  }

  const adminMenuItems = [
    { 
      name: "Dashboard", 
      href: "/admin", 
      icon: Shield,
      description: "Vue d'ensemble",
      color: "from-blue-500 to-blue-600"
    },
    { 
      name: "Hôtels", 
      href: "/admin/hotels", 
      icon: Settings,
      description: "Gestion des hôtels",
      color: "from-green-500 to-green-600"
    },
    { 
      name: "Utilisateurs", 
      href: "/admin/users", 
      icon: Users,
      description: "Gestion des utilisateurs",
      color: "from-purple-500 to-purple-600"
    },
    { 
      name: "Paiements", 
      href: "/admin/payments", 
      icon: Calendar,
      description: "Gestion des paiements",
      color: "from-orange-500 to-orange-600"
    },
  ]

  const SidebarContent = () => (
    <div className={`admin-sidebar h-full flex flex-col bg-white border-r border-gray-200 shadow-xl transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-2 shadow-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">Admin</h1>
                <p className="text-xs text-gray-500">HotelBook</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center w-full">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-2 shadow-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
            title={isCollapsed ? "Étendre" : "Réduire"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-primary-200 shadow-sm"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-primary-500 to-primary-600 shadow-sm">
              <span className="text-white font-semibold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              <span className="inline-block mt-1 px-1.5 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                Admin
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 space-y-1">
        {adminMenuItems.map((item) => (
          <div key={item.name} className="relative group">
            <Link
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActivePath(item.href)
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Background gradient on hover */}
              {!isActivePath(item.href) && hoveredItem === item.name && (
                <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 rounded-xl`} />
              )}
              
              <div className="relative z-10 flex items-center space-x-3 w-full">
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isActivePath(item.href) 
                    ? "bg-white/20" 
                    : "bg-gray-100 group-hover:bg-white group-hover:shadow-sm"
                }`}>
                  <item.icon className={`h-4 w-4 ${
                    isActivePath(item.href) ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                  }`} />
                </div>
                
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs opacity-75">{item.description}</p>
                  </div>
                )}
              </div>

              {/* Active indicator */}
              {isActivePath(item.href) && (
                <div className="absolute right-2 w-1 h-6 bg-white rounded-full" />
              )}
            </Link>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                {item.name}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Se déconnecter" : undefined}
        >
          <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-red-100 transition-colors">
            <LogOut className="h-4 w-4" />
          </div>
          {!isCollapsed && <span className="text-sm font-medium">Se déconnecter</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl shadow-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 group"
      >
        <Menu className="h-5 w-5 group-hover:scale-110 transition-transform" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm" />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="relative h-full">
          <SidebarContent />
          <button
            onClick={() => setIsMobileOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <SidebarContent />
      </div>
    </>
  )
}

export default AdminSidebar

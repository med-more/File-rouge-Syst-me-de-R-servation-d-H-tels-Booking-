"use client"

import { useAuth } from "../../contexts/AuthContext"
import { Navigate } from "react-router-dom"
import AdminSidebar from "./AdminSidebar"

const AdminLayout = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Rediriger vers la page de connexion si pas authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Rediriger vers la page d'accueil si pas admin
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0 overflow-hidden">
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Download,
  Plus,
  ChevronDown,
  AlertTriangle,
  X,
} from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import AdminLayout from "../../components/layout/AdminLayout"

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editForm, setEditForm] = useState({
    role: '',
    isActive: true
  })

  const roles = [
    { value: "all", label: "All Roles" },
    { value: "user", label: "Users" },
    { value: "admin", label: "Admins" },
  ]

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "verified", label: "Verified" },
    { value: "unverified", label: "Unverified" },
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('http://localhost:5000/api/admin/users', {
        params: {
          search: searchTerm,
          role: filterRole !== 'all' ? filterRole : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined
        }
      })
      
      if (data.success) {
        setUsers(data.users || [])
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error)
      toast.error(error.response?.data?.message || "Erreur lors du chargement des utilisateurs")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Refetch users when filters change
  useEffect(() => {
    fetchUsers()
  }, [searchTerm, filterRole, filterStatus])

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, { role: newRole })
      
      if (data.success) {
        toast.success("User role updated successfully")
        fetchUsers()
      } else {
        toast.error("Failed to update user role")
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error(error.response?.data?.message || "Failed to update user role")
    }
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, { status: newStatus })
      
      if (data.success) {
        toast.success("User status updated successfully")
        fetchUsers()
      } else {
        toast.error("Failed to update user status")
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      toast.error(error.response?.data?.message || "Failed to update user status")
    }
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setEditForm({
      role: user.role || 'user',
      isActive: user.isActive !== false
    })
    setShowEditModal(true)
  }

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    try {
      // Mettre à jour le rôle et le statut séparément
      const roleResponse = await axios.put(`http://localhost:5000/api/admin/users/${selectedUser._id}/role`, {
        role: editForm.role
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const statusResponse = await axios.put(`http://localhost:5000/api/admin/users/${selectedUser._id}/status`, {
        status: editForm.isActive ? 'active' : 'inactive'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (roleResponse.data.success && statusResponse.data.success) {
        toast.success("User updated successfully")
        setShowEditModal(false)
        fetchUsers() // Refresh the users list
      } else {
        toast.error("Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error(error.response?.data?.message || "Failed to update user")
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const { data } = await axios.delete(`http://localhost:5000/api/admin/users/${userToDelete._id}`)
      
      if (data.success) {
        toast.success("User deleted successfully")
        setShowDeleteModal(false)
        setUserToDelete(null)
        fetchUsers()
      } else {
        toast.error("Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      
      if (error.response?.data?.code === 'ACTIVE_BOOKINGS_EXIST') {
        toast.error(`Cannot delete user with ${error.response.data.activeBookings} active bookings`)
      } else {
        toast.error(error.response?.data?.message || "Failed to delete user")
      }
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first")
      return
    }

    try {
      const { data } = await axios.post("http://localhost:5000/api/admin/users/bulk-action", {
        userIds: selectedUsers,
        action,
      })
      
      if (data.success) {
        toast.success(`Bulk action completed successfully`)
        setSelectedUsers([])
        fetchUsers()
      } else {
        toast.error("Failed to perform bulk action")
      }
    } catch (error) {
      console.error("Error performing bulk action:", error)
      toast.error(error.response?.data?.message || "Failed to perform bulk action")
    }
  }

  const exportUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users/export", {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "users-export.csv")
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success("Users exported successfully")
    } catch (error) {
      console.error("Error exporting users:", error)
      toast.error(error.response?.data?.message || "Failed to export users")
    }
  }

  const filteredUsers = (users || []).filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === "all" || user.role === filterRole

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.status === "active") ||
      (filterStatus === "inactive" && user.status === "inactive") ||
      (filterStatus === "verified" && user.emailVerified) ||
      (filterStatus === "unverified" && !user.emailVerified)

    return matchesSearch && matchesRole && matchesStatus
  })

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const toggleSelectAll = () => {
    setSelectedUsers((prev) => (prev.length === filteredUsers.length ? [] : filteredUsers.map((user) => user._id)))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-16 bg-gray-300 rounded-2xl"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen pt-8 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Background Spots - Style premium */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="container-custom py-8 relative z-10 w-full">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl relative overflow-hidden mb-8 border border-blue-200/40 animate-fade-in-up">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-black drop-shadow-lg mb-2">Manage Users</h1>
                <p className="text-lg text-blue-700/80">View and manage user accounts</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={exportUsers}
                  className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-xl font-semibold flex items-center gap-2 px-6 py-3 shadow hover:from-blue-200 hover:to-blue-300 transition-all duration-200 animate-fade-in-up"
            >
                  <Download className="h-5 w-5 mr-2" />
              Export
            </button>
                <button className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900 rounded-xl font-semibold flex items-center gap-2 px-6 py-3 shadow hover:from-yellow-300 hover:to-yellow-200 transition-all duration-200 animate-fade-in-up">
                  <Plus className="h-5 w-5 mr-2" />
              Add User
            </button>
              </div>
          </div>
        </div>

        {/* Filters and Search */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 p-6 mb-8 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="relative">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

              <div className="flex items-center text-sm text-blue-700 font-semibold">
              <Filter className="h-4 w-4 mr-2" />
              {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                  <span className="text-blue-700 font-medium">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors text-sm"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border-2 border-blue-200/30 overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
                <tbody className="bg-white divide-y divide-blue-50">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                      className="hover:bg-blue-50 transition-colors animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: "fadeInUp 0.4s ease-out forwards",
                    }}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-700 font-bold">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-400">ID: {user._id?.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-4 w-4 mr-2 text-blue-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-4 w-4 mr-2 text-blue-200" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="text-sm border border-blue-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                            user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status === "active" ? (
                            <UserCheck className="h-3 w-3 mr-1" />
                          ) : (
                            <UserX className="h-3 w-3 mr-1" />
                          )}
                          {user.status}
                        </div>
                        <select
                          value={user.status || 'active'}
                          onChange={(e) => handleStatusChange(user._id, e.target.value)}
                          className="text-sm border border-blue-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <div
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                            user.isEmailVerified ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.isEmailVerified ? "Verified" : "Unverified"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View User"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setUserToDelete(user)
                            setShowDeleteModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-blue-200" />
              </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>

        {/* Delete User Modal */}
        {showDeleteModal && userToDelete && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0 animate-fade-in"></div>
              <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-blue-200/60 p-8 animate-fade-in-up">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                    <h3 className="text-2xl font-extrabold text-blue-700 mb-2">Delete User</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete {userToDelete.name}? This action cannot be undone.
                </p>
              </div>

                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <div className="text-sm text-blue-700 space-y-1">
                  <div>Name: {userToDelete.name}</div>
                  <div>Email: {userToDelete.email}</div>
                  <div>Role: {userToDelete.role}</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                      className="flex-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white rounded-xl transition-colors font-semibold"
                >
                  Delete User
                </button>
                  </div>
              </div>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedUser.name || selectedUser.firstName + ' ' + selectedUser.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <p className="text-gray-900 capitalize">{selectedUser.role || 'User'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-gray-900 capitalize">{selectedUser.isActive !== false ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created At</label>
                  <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={selectedUser.name || selectedUser.firstName + ' ' + selectedUser.lastName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Name cannot be changed</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => handleEditFormChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => handleEditFormChange('isActive', e.target.value === 'active')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}

export default ManageUsers

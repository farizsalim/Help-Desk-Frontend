import { create } from 'zustand'
import axios from 'axios'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  loading: true,
  error: '',
  success: '',

  // Actions
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  clearMessages: () => set({ error: '', success: '' }),

  getAuthHeaders: () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }),

  loadUser: async (navigate) => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      navigate('/login')
      return null
    }
    
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const userData = response.data.data
      set({ user: userData, loading: false })
      return userData
    } catch (err) {
      toast.error('Session Expired', {
        description: 'Please login again.',
        duration: 4000,
      })
      get().logout(navigate)
      return null
    }
  },

  logout: (navigate) => {
    localStorage.removeItem('token')
    set({ user: null, loading: false })
    navigate('/login')
  },

  changeUserRole: async (userId, newRole) => {
    try {
      await axios.put(
        `${API_URL}/users/${userId}`,
        { role: newRole },
        get().getAuthHeaders()
      )
      set({ success: 'User role updated!' })
      setTimeout(() => set({ success: '' }), 3000)
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update role' })
      return false
    }
  }
}))

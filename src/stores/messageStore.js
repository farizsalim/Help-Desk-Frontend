import { create } from 'zustand'
import axios from 'axios'
import { useAuthStore } from './authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useMessageStore = create((set, get) => ({
  // State
  newMessage: '',
  selectedImage: null,
  imagePreview: null,
  uploadingImage: false,
  previewImage: null,
  typingUsers: [],

  // Refs (stored as mutable object)
  refs: {
    socketRef: { current: null },
    messagesEndRef: { current: null },
    typingTimeoutRef: { current: null },
    fileInputRef: { current: null },
  },

  // Actions - Setters
  setNewMessage: (newMessage) => set({ newMessage }),
  setSelectedImage: (selectedImage) => set({ selectedImage }),
  setImagePreview: (imagePreview) => set({ imagePreview }),
  setUploadingImage: (uploadingImage) => set({ uploadingImage }),
  setPreviewImage: (previewImage) => set({ previewImage }),
  setTypingUsers: (typingUsers) => set({ typingUsers }),
  
  setSocketRef: (socketRef) => set((state) => ({ 
    refs: { ...state.refs, socketRef: { current: socketRef } }
  })),

  // Actions
  handleImageSelect: (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Hanya file gambar yang diizinkan (JPEG, PNG, GIF, WEBP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    set({ selectedImage: file })
    
    const reader = new FileReader()
    reader.onloadend = () => set({ imagePreview: reader.result })
    reader.readAsDataURL(file)
  },

  clearSelectedImage: () => {
    set({ selectedImage: null, imagePreview: null })
    const { fileInputRef } = get().refs
    if (fileInputRef.current) fileInputRef.current.value = ''
  },

  sendMessage: async (conversationId) => {
    const { newMessage, selectedImage, refs } = get()
    
    if ((!newMessage.trim() && !selectedImage) || !conversationId) return false

    try {
      set({ uploadingImage: true })
      
      // Stop typing
      refs.socketRef.current?.emit('stop_typing', { conversationId })
      if (refs.typingTimeoutRef.current) clearTimeout(refs.typingTimeoutRef.current)

      const formData = new FormData()
      formData.append('conversation_id', conversationId)
      formData.append('isi_pesan', newMessage.trim())
      if (selectedImage) formData.append('image', selectedImage)

      await axios.post(`${API_URL}/messages`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      set({ newMessage: '', selectedImage: null, imagePreview: null })
      return true
    } catch (err) {
      useAuthStore.setState({ error: 'Failed to send message' })
      console.error('Send message error:', err)
      return false
    } finally {
      set({ uploadingImage: false })
    }
  },

  // Socket handlers
  handleUserTyping: (data, currentUserId) => {
    if (data.userId !== currentUserId) {
      set((state) => ({
        typingUsers: [...state.typingUsers.filter(u => u.userId !== data.userId), data]
      }))
    }
  },

  handleUserStopTyping: (data) => {
    set((state) => ({
      typingUsers: state.typingUsers.filter(u => u.userId !== data.userId)
    }))
  },

  emitTyping: (conversationId) => {
    const { refs } = get()
    refs.socketRef.current?.emit('typing', { conversationId })
    
    if (refs.typingTimeoutRef.current) clearTimeout(refs.typingTimeoutRef.current)
    refs.typingTimeoutRef.current = setTimeout(() => {
      refs.socketRef.current?.emit('stop_typing', { conversationId })
    }, 3000)
  }
}))

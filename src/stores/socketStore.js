import { create } from 'zustand'
import { io } from 'socket.io-client'
import { useAuthStore } from './authStore'
import { useConversationStore } from './conversationStore'
import { useMessageStore } from './messageStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (user) => {
    const token = localStorage.getItem('token')
    if (!token || !user) return

    const socket = io(API_URL, { auth: { token } })
    
    socket.on('connect', () => {
      set({ isConnected: true, socket })
    })

    socket.on('disconnect', () => {
      set({ isConnected: false })
    })

    // Message events
    socket.on('new_message', (data) => {
      useConversationStore.getState().handleNewMessage(data, user._id)
    })

    // Ticket events
    socket.on('ticket_closed', (data) => {
      useConversationStore.getState().handleTicketClosed(data, user._id, user.role)
    })

    socket.on('it_staff_added', (data) => {
      useConversationStore.getState().handleITStaffAdded(data, user._id, user.role)
    })

    socket.on('new_ticket', (data) => {
      useConversationStore.getState().handleNewTicket(data, user.role)
    })

    // Typing events
    socket.on('user_typing', (data) => {
      useMessageStore.getState().handleUserTyping(data, user._id)
    })

    socket.on('user_stop_typing', (data) => {
      useMessageStore.getState().handleUserStopTyping(data)
    })

    set({ socket })
    
    // Update messageStore socket ref
    useMessageStore.getState().setSocketRef(socket)

    return socket
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.off('new_message')
      socket.off('ticket_closed')
      socket.off('it_staff_added')
      socket.off('new_ticket')
      socket.off('user_typing')
      socket.off('user_stop_typing')
      socket.disconnect()
    }
    set({ socket: null, isConnected: false })
  },

  joinConversation: (conversationId) => {
    const { socket } = get()
    socket?.emit('join_conversation', conversationId)
  },

  emitTyping: (conversationId) => {
    const { socket } = get()
    socket?.emit('typing', { conversationId })
  },

  emitStopTyping: (conversationId) => {
    const { socket } = get()
    socket?.emit('stop_typing', { conversationId })
  }
}))

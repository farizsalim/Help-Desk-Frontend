import { create } from 'zustand'
import { io } from 'socket.io-client'
import { useAuthStore } from './authStore'
import { useConversationStore } from './conversationStore'
import { useMessageStore } from './messageStore'
import {
  requestNotificationPermission,
  notifyNewMessage,
  notifyTicketClosed,
  notifyITStaffAdded,
  notifyNewTicket
} from '../utils/notificationService'

const API_URL = import.meta.env.VITE_API_URL

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (user) => {
    const token = localStorage.getItem('token')
    if (!token || !user) return

    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: true
    })
    
    socket.on('connect', () => {
      set({ isConnected: true, socket })
      requestNotificationPermission()
    })

    socket.on('disconnect', () => {
      set({ isConnected: false })
    })

    // Message events
    socket.on('new_message', (data) => {
      useConversationStore.getState().handleNewMessage(data, user._id)

      if (data.message?.sender_id?._id !== user._id) {
        const senderName = data.message?.sender_id?.nama || 'Pengguna'
        const senderRole = data.message?.sender_id?.role || 'user'
        const messagePreview = data.message?.isi_pesan?.substring(0, 50) || 'Anda memiliki pesan baru'
        const conversationId = data.message?.conversation_id

        notifyNewMessage(senderName, senderRole, conversationId, messagePreview)
      }
    })

    // Ticket events
    socket.on('ticket_closed', (data) => {
      useConversationStore.getState().handleTicketClosed(data, user._id, user.role)

      if (data.created_by !== user._id) {
        const ticketTitle = data.judul_tiket || data.conversation?.subject || 'Tiket'
        const closedByName = data.closed_by_nama || data.closedBy?.nama || 'Admin'

        notifyTicketClosed(data.id, ticketTitle, closedByName)
      }
    })

    socket.on('it_staff_added', (data) => {
      useConversationStore.getState().handleITStaffAdded(data, user._id, user.role)

      const staffName = data.it_staff_nama || data.itStaff?.nama || 'IT Staff'
      const staffRole = data.it_staff_role || data.itStaff?.role || 'it_staff'
      const conversationId = data.conversation_id || data.conversation?._id

      notifyITStaffAdded(staffName, staffRole, conversationId)
    })

    socket.on('new_ticket', (data) => {
      useConversationStore.getState().handleNewTicket(data, user.role)

      if (user.role === 'admin' || user.role === 'it_staff') {
        const ticketTitle = data.judul_tiket || data.subject || 'Tiket Baru'
        const userName = data.pengguna_nama || data.createdBy?.nama || 'Pengguna'
        const userRole = data.pengguna_role || data.createdBy?.role || 'user'

        notifyNewTicket(ticketTitle, userName, userRole)
      }
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

import { useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuthStore, useConversationStore, useMessageStore, useSocketStore } from '../stores'
import { initializeFCM } from '../utils/notificationService'

export function useDashboard() {
  const navigate = useNavigate()
  const { ticketId: routeTicketId } = useParams()
  const [searchParams] = useSearchParams()

  const auth = useAuthStore()
  const conversation = useConversationStore()
  const message = useMessageStore()
  const socket = useSocketStore()

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const selectedConvRef = useRef(null)

  const openChat = (conv, replace = false) => {
    conversation.setSelectedConversation(conv)
    conversation.setShowChatModal(true)
    navigate(`/dashboard/ticket/${conv._id}`, { replace })
  }

  const closeChat = () => {
    conversation.setShowChatModal(false)
    conversation.setSelectedConversation(null)
    navigate('/dashboard')
  }

  useEffect(() => {
    const init = async () => {
      const userData = await auth.loadUser(navigate)
      if (userData) {
        if (userData.role === 'admin') conversation.setFilter('open')
        else if (userData.role === 'it_staff') conversation.setFilter('in_progress')

        await conversation.fetchData(userData.role, navigate)
      }
    }

    init()
  }, [])

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault()
      return false
    }

    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  useEffect(() => {
    if (!auth.user) return

    socket.connect(auth.user)

    initializeFCM(auth.user).then((token) => {
      if (token) {
        console.log('[DASHBOARD] FCM initialized successfully, token:', token)
      } else {
        console.log('[DASHBOARD] FCM initialization skipped or failed')
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [auth.user])

  useEffect(() => {
    const onNotificationClick = (event) => {
      const ticketId = event.detail?.ticketId
      if (!ticketId) return

      const targetConv = conversation.conversations.find((conv) => conv._id === ticketId)
      if (targetConv) {
        openChat(targetConv)
      }

      try {
        window.focus()
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener('app:notification-click', onNotificationClick)
    return () => window.removeEventListener('app:notification-click', onNotificationClick)
  }, [conversation.conversations])

  useEffect(() => {
    selectedConvRef.current = conversation.selectedConversation
    if (conversation.selectedConversation) {
      conversation.fetchMessages(conversation.selectedConversation._id)
      socket.joinConversation(conversation.selectedConversation._id)
    }
  }, [conversation.selectedConversation])

  useEffect(() => {
    const ticketId = routeTicketId || searchParams.get('ticket')
    const notifType = searchParams.get('notif')

    console.log('[DASHBOARD] URL params check:', {
      ticketId,
      notifType,
      hasConversations: conversation.conversations.length > 0,
      conversationsCount: conversation.conversations.length
    })

    if (!ticketId) return
    if (!conversation.conversations.length) {
      console.log('[DASHBOARD] Waiting for conversations to load before opening ticket...')
      return
    }

    const targetConv = conversation.conversations.find((conv) => conv._id === ticketId)

    if (!targetConv) {
      console.warn('[DASHBOARD] Ticket not found in conversations:', ticketId, 'Available tickets:', conversation.conversations.map((conv) => conv._id))
      return
    }

    console.log('[DASHBOARD] Opening conversation from notification:', {
      ticketId,
      notifType,
      conversation: targetConv
    })

    const openTimer = setTimeout(() => {
      openChat(targetConv, true)
    }, 300)

    return () => clearTimeout(openTimer)
  }, [routeTicketId, searchParams, conversation.conversations])

  // Ensure we are joined to all conversation rooms so socket emits arrive
  // even when a conversation/chat is not actively opened. This enables
  // browser notifications for unread messages from other tickets.
  useEffect(() => {
    try {
      if (!socket?.isConnected) return
      if (!conversation.conversations?.length) return

      console.log('[DASHBOARD] Joining all conversation rooms for notifications')
      conversation.conversations.forEach((conv) => {
        if (conv?._id) socket.joinConversation(conv._id)
      })
    } catch (err) {
      console.error('[DASHBOARD] Error joining conversations:', err)
    }
  }, [socket?.isConnected, conversation.conversations])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages])

  const handleLogout = () => auth.logout(navigate)

  const handleCreateTicket = async (ticketSubject) => {
    const newTicket = await conversation.createTicket(ticketSubject, navigate)
    if (newTicket) {
      openChat(newTicket)
      await conversation.fetchData(auth.user?.role, navigate)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const success = await message.sendMessage(conversation.selectedConversation?._id)
    if (success) {
      conversation.fetchMessages(conversation.selectedConversation._id)
    }
  }

  const handleCloseTicket = async (conversationId) => {
    const success = await conversation.closeTicket(conversationId)
    if (success) await conversation.fetchData(auth.user?.role, navigate)
  }

  const handleAddITStaff = async (e) => {
    e.preventDefault()
    const success = await conversation.assignITStaff()
    if (success) await conversation.fetchData(auth.user?.role, navigate)
  }

  const handleChangeRole = async (userId, newRole) => {
    const success = await auth.changeUserRole(userId, newRole)
    if (success) await conversation.fetchData(auth.user?.role, navigate)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return {
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    success: auth.success,
    conversations: conversation.conversations,
    users: conversation.users,
    itStaff: conversation.itStaff,
    selectedConversation: conversation.selectedConversation,
    selectedConvForAssign: conversation.selectedConvForAssign,
    selectedITStaff: conversation.selectedITStaff,
    messages: conversation.messages,
    filter: conversation.filter,
    activeTab: conversation.activeTab,
    searchTerm: conversation.searchTerm,
    dateFilter: conversation.dateFilter,
    userFilter: conversation.userFilter,
    sortBy: conversation.sortBy,
    sortOrder: conversation.sortOrder,
    itemsPerPage: conversation.itemsPerPage,
    currentPage: conversation.currentPage,
    userCurrentPage: conversation.userCurrentPage,
    selectedUser: conversation.selectedUser,
    showUserDetail: conversation.showUserDetail,
    showCreateModal: conversation.showCreateModal,
    showChatModal: conversation.showChatModal,
    showAssignModal: conversation.showAssignModal,
    newMessage: message.newMessage,
    selectedImage: message.selectedImage,
    imagePreview: message.imagePreview,
    uploadingImage: message.uploadingImage,
    previewImage: message.previewImage,
    typingUsers: message.typingUsers,
    openTickets: conversation.openTickets,
    activeTickets: conversation.activeTickets,
    closedTickets: conversation.closedTickets,
    socketRef: message.refs.socketRef,
    messagesEndRef,
    typingTimeoutRef: message.refs.typingTimeoutRef,
    fileInputRef,
    selectedConvRef,
    setSelectedConversation: conversation.setSelectedConversation,
    setSelectedConvForAssign: conversation.setSelectedConvForAssign,
    setSelectedITStaff: conversation.setSelectedITStaff,
    setNewMessage: message.setNewMessage,
    setShowCreateModal: conversation.setShowCreateModal,
    setShowChatModal: conversation.setShowChatModal,
    setShowAssignModal: conversation.setShowAssignModal,
    setFilter: conversation.setFilter,
    setActiveTab: conversation.setActiveTab,
    setSearchTerm: conversation.setSearchTerm,
    setDateFilter: conversation.setDateFilter,
    setPreviewImage: message.setPreviewImage,
    setUserFilter: conversation.setUserFilter,
    setSortBy: conversation.setSortBy,
    setSortOrder: conversation.setSortOrder,
    setItemsPerPage: conversation.setItemsPerPage,
    setCurrentPage: conversation.setCurrentPage,
    setUserCurrentPage: conversation.setUserCurrentPage,
    setSelectedUser: conversation.setSelectedUser,
    setShowUserDetail: conversation.setShowUserDetail,
    handleLogout,
    handleCreateTicket,
    handleSendMessage,
    handleImageSelect: message.handleImageSelect,
    clearSelectedImage: message.clearSelectedImage,
    handleCloseTicket,
    handleAddITStaff,
    handleChangeRole,
    openChat,
    closeChat,
    formatDate
  }
}

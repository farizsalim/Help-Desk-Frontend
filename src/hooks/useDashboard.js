import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useConversationStore, useMessageStore, useSocketStore } from '../stores'

export function useDashboard() {
  const navigate = useNavigate()
  
  // Stores
  const auth = useAuthStore()
  const conversation = useConversationStore()
  const message = useMessageStore()
  const socket = useSocketStore()
  
  // Refs for DOM manipulation
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const selectedConvRef = useRef(null)

  // Load user on mount
  useEffect(() => {
    const init = async () => {
      const userData = await auth.loadUser(navigate)
      if (userData) {
        // Set default filter based on role
        if (userData.role === 'admin') conversation.setFilter('open')
        else if (userData.role === 'it_staff') conversation.setFilter('in_progress')
        
        // Fetch initial data
        await conversation.fetchData(userData.role, navigate)
      }
    }
    init()
  }, [])

  // Disable right-click context menu
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault()
      return false
    }
    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  // Socket setup - only after user is loaded
  useEffect(() => {
    if (!auth.user) return
    
    socket.connect(auth.user)
    
    return () => {
      socket.disconnect()
    }
  }, [auth.user])

  // Fetch messages when conversation selected
  useEffect(() => {
    selectedConvRef.current = conversation.selectedConversation
    if (conversation.selectedConversation) {
      conversation.fetchMessages(conversation.selectedConversation._id)
      socket.joinConversation(conversation.selectedConversation._id)
    }
  }, [conversation.selectedConversation])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages])

  // Action handlers
  const handleLogout = () => auth.logout(navigate)
  
  const handleCreateTicket = async (ticketSubject) => {
    const newTicket = await conversation.createTicket(ticketSubject, navigate)
    if (newTicket) {
      conversation.setSelectedConversation(newTicket)
      conversation.setShowChatModal(true)
      await conversation.fetchData(auth.user?.role, navigate)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const success = await message.sendMessage(conversation.selectedConversation?._id)
    if (success) {
      // Refresh messages
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

  const openChat = (conv) => {
    conversation.setSelectedConversation(conv)
    conversation.setShowChatModal(true)
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
    // Auth state
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    success: auth.success,
    
    // Conversation state
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
    
    // Message state
    newMessage: message.newMessage,
    selectedImage: message.selectedImage,
    imagePreview: message.imagePreview,
    uploadingImage: message.uploadingImage,
    previewImage: message.previewImage,
    typingUsers: message.typingUsers,
    
    // Computed
    openTickets: conversation.openTickets,
    activeTickets: conversation.activeTickets,
    closedTickets: conversation.closedTickets,
    
    // Refs
    socketRef: message.refs.socketRef,
    messagesEndRef,
    typingTimeoutRef: message.refs.typingTimeoutRef,
    fileInputRef,
    selectedConvRef,
    
    // Setters
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
    
    // Actions
    handleLogout,
    handleCreateTicket,
    handleSendMessage,
    handleImageSelect: message.handleImageSelect,
    clearSelectedImage: message.clearSelectedImage,
    handleCloseTicket,
    handleAddITStaff,
    handleChangeRole,
    openChat,
    formatDate
  }
}

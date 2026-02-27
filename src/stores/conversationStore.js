import { create } from 'zustand'
import axios from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from './authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useConversationStore = create((set, get) => ({
  // State
  conversations: [],
  users: [],
  itStaff: [],
  messages: [],
  selectedConversation: null,
  selectedConvForAssign: '',
  selectedITStaff: '',
  
  // Filter & Pagination State
  filter: 'all',
  activeTab: 'tickets',
  searchTerm: '',
  dateFilter: { start: '', end: '' },
  userFilter: 'all',
  sortBy: 'nama',
  sortOrder: 'asc',
  itemsPerPage: 10,
  currentPage: 1,
  userCurrentPage: 1,
  
  // UI State
  selectedUser: null,
  showUserDetail: false,
  showCreateModal: false,
  showChatModal: false,
  showAssignModal: false,

  // Computed
  get openTickets() {
    return get().conversations.filter(c => c.status === 'open')
  },
  get activeTickets() {
    return get().conversations.filter(c => c.status === 'in_progress')
  },
  get closedTickets() {
    return get().conversations.filter(c => c.status === 'closed')
  },

  // Actions - Setters
  setConversations: (conversations) => set({ conversations }),
  setUsers: (users) => set({ users }),
  setItStaff: (itStaff) => set({ itStaff }),
  setMessages: (messages) => set({ messages }),
  setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
  setSelectedConvForAssign: (selectedConvForAssign) => set({ selectedConvForAssign }),
  setSelectedITStaff: (selectedITStaff) => set({ selectedITStaff }),
  setFilter: (filter) => set({ filter }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setDateFilter: (dateFilter) => set({ dateFilter }),
  setUserFilter: (userFilter) => set({ userFilter }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setItemsPerPage: (itemsPerPage) => set({ itemsPerPage }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setUserCurrentPage: (userCurrentPage) => set({ userCurrentPage }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setShowUserDetail: (showUserDetail) => set({ showUserDetail }),
  setShowCreateModal: (showCreateModal) => set({ showCreateModal }),
  setShowChatModal: (showChatModal) => set({ showChatModal }),
  setShowAssignModal: (showAssignModal) => set({ showAssignModal }),

  // Actions - API Calls
  fetchData: async (role, navigate) => {
    try {
      const authHeaders = useAuthStore.getState().getAuthHeaders()
      const [convResponse, usersResponse, itStaffResponse] = await Promise.all([
        axios.get(`${API_URL}/conversations`, authHeaders),
        role === 'admin' ? axios.get(`${API_URL}/users`, authHeaders) : Promise.resolve({ data: { data: [] } }),
        role === 'admin' ? axios.get(`${API_URL}/users/role/it_staff`, authHeaders) : Promise.resolve({ data: { data: [] } })
      ])
      
      set({ 
        conversations: convResponse.data.data,
        users: role === 'admin' ? usersResponse.data.data : [],
        itStaff: role === 'admin' ? itStaffResponse.data.data : []
      })
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
      useAuthStore.setState({ error: 'Failed to load data' })
    }
  },

  fetchMessages: async (conversationId) => {
    try {
      const authHeaders = useAuthStore.getState().getAuthHeaders()
      const response = await axios.get(`${API_URL}/messages/${conversationId}`, authHeaders)
      set({ messages: response.data.data })
    } catch (err) {
      useAuthStore.setState({ error: 'Failed to load messages' })
    }
  },

  createTicket: async (ticketSubject, navigate) => {
    if (!ticketSubject.trim()) return null
    
    try {
      const authHeaders = useAuthStore.getState().getAuthHeaders()
      const response = await axios.post(
        `${API_URL}/conversations`,
        { subject: ticketSubject },
        authHeaders
      )
      
      set({ showCreateModal: false })
      toast.success('✅ Ticket Created', {
        description: 'Your ticket has been created successfully.',
        duration: 4000,
      })
      
      return response.data.data
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create ticket'
      useAuthStore.setState({ error: errorMsg })
      toast.error('❌ Failed to Create Ticket', {
        description: errorMsg,
        duration: 4000,
      })
      return null
    }
  },

  closeTicket: async (conversationId) => {
    if (!confirm('Are you sure you want to close this ticket?')) return false
    
    try {
      const authHeaders = useAuthStore.getState().getAuthHeaders()
      await axios.post(`${API_URL}/conversations/${conversationId}/close`, {}, authHeaders)
      useAuthStore.setState({ success: 'Ticket closed successfully!' })
      setTimeout(() => useAuthStore.setState({ success: '' }), 3000)
      return true
    } catch (err) {
      useAuthStore.setState({ error: err.response?.data?.message || 'Failed to close ticket' })
      return false
    }
  },

  assignITStaff: async () => {
    const { selectedConvForAssign, selectedITStaff } = get()
    
    if (!selectedConvForAssign || !selectedITStaff) {
      useAuthStore.setState({ error: 'Please select both conversation and IT staff' })
      return false
    }
    
    try {
      const authHeaders = useAuthStore.getState().getAuthHeaders()
      await axios.post(
        `${API_URL}/conversations/${selectedConvForAssign}/add-it-staff`,
        { it_staff_id: selectedITStaff },
        authHeaders
      )
      
      useAuthStore.setState({ success: 'IT Staff assigned successfully!' })
      set({ 
        showAssignModal: false,
        selectedConvForAssign: '',
        selectedITStaff: ''
      })
      setTimeout(() => useAuthStore.setState({ success: '' }), 3000)
      return true
    } catch (err) {
      useAuthStore.setState({ error: err.response?.data?.message || 'Failed to add IT staff' })
      return false
    }
  },

  openChat: (conv) => {
    set({ 
      selectedConversation: conv,
      showChatModal: true
    })
  },

  // Socket Event Handlers
  handleNewMessage: (data, currentUserId) => {
    const { selectedConversation } = get()
    
    if (selectedConversation?._id === data.message.conversation_id) {
      set((state) => ({
        messages: state.messages.find(m => m._id === data.message._id) 
          ? state.messages 
          : [...state.messages, data.message]
      }))
    }
    
    if (data.message.sender_id?._id !== currentUserId) {
      toast.message(`💬 New message from ${data.message.sender_id?.nama}`, {
        description: data.message.isi_pesan.substring(0, 50) + (data.message.isi_pesan.length > 50 ? '...' : ''),
        duration: 5000,
      })
    }
  },

  handleTicketClosed: (data, currentUserId, currentUserRole) => {
    set((state) => ({
      conversations: state.conversations.map(c => 
        c._id === data.conversation._id 
          ? { ...c, status: 'closed', closed_at: data.conversation.closed_at, closed_by: data.closedBy } 
          : c
      )
    }))
    
    const { selectedConversation } = get()
    if (selectedConversation?._id === data.conversation._id) {
      set({ showChatModal: false, selectedConversation: null })
    }
    
    const isTicketCreator = data.conversation.participants?.[0]?._id === currentUserId
    if (isTicketCreator && currentUserRole === 'user') {
      toast.success('✅ Ticket Closed', {
        description: `Your ticket "${data.conversation.subject}" has been closed by ${data.closedBy?.nama}`,
        duration: 6000,
      })
    }
    
    if (currentUserRole === 'it_staff') {
      toast.info('🔒 Ticket Closed', {
        description: `"${data.conversation.subject}" has been closed`,
        duration: 5000,
      })
    }
  },

  handleITStaffAdded: (data, currentUserId, currentUserRole) => {
    set((state) => ({
      conversations: state.conversations.map(c => 
        c._id === data.conversation._id 
          ? { ...c, status: 'in_progress', participants: [...c.participants, data.itStaff] } 
          : c
      )
    }))
    
    if (currentUserRole === 'admin') {
      toast.info('👨‍💻 IT Staff Assigned', {
        description: `${data.itStaff?.nama} assigned to "${data.conversation.subject}"`,
        duration: 5000,
      })
    }
    
    if (currentUserRole === 'it_staff' && data.itStaff?._id === currentUserId) {
      toast.success('📋 You Are Assigned', {
        description: `You have been assigned to "${data.conversation.subject}"`,
        duration: 6000,
      })
    }
  },

  handleNewTicket: (data, currentUserRole) => {
    if (currentUserRole === 'admin' || currentUserRole === 'it_staff') {
      set((state) => ({
        conversations: state.conversations.find(c => c._id === data.conversation._id)
          ? state.conversations
          : [data.conversation, ...state.conversations]
      }))
    }
    
    if (currentUserRole === 'admin') {
      toast.warning('🎫 New Ticket Created', {
        description: `"${data.conversation.subject}" by ${data.createdBy?.nama}`,
        duration: 6000,
      })
    }
    
    if (currentUserRole === 'it_staff') {
      toast.info('🎫 New Ticket Available', {
        description: `"${data.conversation.subject}" needs attention`,
        duration: 6000,
      })
    }
  }
}))

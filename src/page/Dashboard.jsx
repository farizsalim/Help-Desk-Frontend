import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'
import { toast } from 'sonner'
import { 
  Header, 
  TicketList, 
  UserList, 
  CreateTicketModal, 
  ChatModal, 
  UserDashboard,
  TicketStats,
  AssignModal
} from '../components/dashboard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [users, setUsers] = useState([])
  const [itStaff, setItStaff] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [selectedConvForAssign, setSelectedConvForAssign] = useState('')
  const [selectedITStaff, setSelectedITStaff] = useState('')
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('tickets')
  const [searchTerm, setSearchTerm] = useState('')
  const [typingUsers, setTypingUsers] = useState([])
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [userFilter, setUserFilter] = useState('all')
  const [sortBy, setSortBy] = useState('nama')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [userCurrentPage, setUserCurrentPage] = useState(1)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const selectedConvRef = useRef(null)
  const fileInputRef = useRef(null)

  const getAuthHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  })

  // Fetch user data from backend (security: no user data in localStorage)
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      
      if (!token) {
        navigate('/login')
        return
      }
      
      try {
        // Fetch user data from backend
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const userData = response.data.data
        setUser(userData)
        
        // Set default filter based on role
        if (userData.role === 'admin') {
          setFilter('open')
        } else if (userData.role === 'it_staff') {
          setFilter('in_progress')
        }
        
        fetchData(userData.role)
      } catch (err) {
        // Token invalid or server error
        toast.error('Session Expired', {
          description: 'Please login again.',
          duration: 4000,
        })
        handleLogout()
      }
    }
    
    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Disable right-click context menu
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault()
      return false
    }
    
    document.addEventListener('contextmenu', handleContextMenu)
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  // Socket setup - only after user is loaded
  useEffect(() => {
    if (!user) return
    
    const token = localStorage.getItem('token')
    if (!token) return

    socketRef.current = io(API_URL, { auth: { token } })
    const socket = socketRef.current

    socket.on('new_message', (data) => {
      // Only add message if currently viewing this conversation
      if (selectedConvRef.current?._id === data.message.conversation_id) {
        setMessages(prev => {
          // Only add if not already exists (prevent duplicates)
          if (prev.find(m => m._id === data.message._id)) return prev
          return [...prev, data.message]
        })
      }
      // Show notification if message is from other user
      if (data.message.sender_id?._id !== user?._id) {
        toast.message(`💬 New message from ${data.message.sender_id?.nama}`, {
          description: data.message.isi_pesan.substring(0, 50) + (data.message.isi_pesan.length > 50 ? '...' : ''),
          duration: 5000,
        })
      }
    })

    socket.on('ticket_closed', (data) => {
      setConversations(prev => prev.map(c => 
        c._id === data.conversation._id ? { ...c, status: 'closed', closed_at: data.conversation.closed_at, closed_by: data.closedBy } : c
      ))
      if (selectedConvRef.current?._id === data.conversation._id) {
        setShowChatModal(false)
        setSelectedConversation(null)
      }
      // Notify user that their ticket is closed
      const isTicketCreator = data.conversation.participants?.[0]?._id === user?._id
      if (isTicketCreator && user?.role === 'user') {
        toast.success('✅ Ticket Closed', {
          description: `Your ticket "${data.conversation.subject}" has been closed by ${data.closedBy?.nama}`,
          duration: 6000,
        })
      }
      // Notify IT Staff that ticket is closed
      if (user?.role === 'it_staff') {
        toast.info('🔒 Ticket Closed', {
          description: `"${data.conversation.subject}" has been closed`,
          duration: 5000,
        })
      }
    })

    socket.on('it_staff_added', (data) => {
      setConversations(prev => prev.map(c => 
        c._id === data.conversation._id ? { ...c, status: 'in_progress', participants: [...c.participants, data.itStaff] } : c
      ))
      // Notify admin that IT staff was added
      if (user?.role === 'admin') {
        toast.info('👨‍💻 IT Staff Assigned', {
          description: `${data.itStaff?.nama} assigned to "${data.conversation.subject}"`,
          duration: 5000,
        })
      }
      // Notify IT Staff that they are assigned
      if (user?.role === 'it_staff' && data.itStaff?._id === user?._id) {
        toast.success('📋 You Are Assigned', {
          description: `You have been assigned to "${data.conversation.subject}"`,
          duration: 6000,
        })
      }
    })

    // New ticket notification for admin and it_staff
    socket.on('new_ticket', (data) => {
      // Add new ticket to conversations list for admin and it_staff
      if (user?.role === 'admin' || user?.role === 'it_staff') {
        setConversations(prev => {
          // Check if already exists
          if (prev.find(c => c._id === data.conversation._id)) return prev
          return [data.conversation, ...prev]
        })
      }
      // Notify admin
      if (user?.role === 'admin') {
        toast.warning('🎫 New Ticket Created', {
          description: `"${data.conversation.subject}" by ${data.createdBy?.nama}`,
          duration: 6000,
        })
      }
      // Notify it_staff about new open ticket
      if (user?.role === 'it_staff') {
        toast.info('🎫 New Ticket Available', {
          description: `"${data.conversation.subject}" needs attention`,
          duration: 6000,
        })
      }
    })

    socket.on('user_typing', (data) => {
      if (data.userId !== user?._id) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data])
      }
    })

    socket.on('user_stop_typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
    })

    return () => {
      socket.off('new_message')
      socket.off('ticket_closed')
      socket.off('it_staff_added')
      socket.off('new_ticket')
      socket.off('user_typing')
      socket.off('user_stop_typing')
      socket.disconnect()
    }
  }, [user])

  useEffect(() => {
    selectedConvRef.current = selectedConversation
    if (selectedConversation) {
      fetchMessages(selectedConversation._id)
      socketRef.current?.emit('join_conversation', selectedConversation._id)
    }
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchData = async (role) => {
    try {
      // All roles fetch conversations from the same endpoint
      const [convResponse, usersResponse, itStaffResponse] = await Promise.all([
        axios.get(`${API_URL}/conversations`, getAuthHeaders()),
        role === 'admin' ? axios.get(`${API_URL}/users`, getAuthHeaders()) : Promise.resolve({ data: { data: [] } }),
        role === 'admin' ? axios.get(`${API_URL}/users/role/it_staff`, getAuthHeaders()) : Promise.resolve({ data: { data: [] } })
      ])
      setConversations(convResponse.data.data)
      if (role === 'admin') {
        setUsers(usersResponse.data.data)
        setItStaff(itStaffResponse.data.data)
      }
      setLoading(false)
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
      setError('Failed to load data')
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(
        `${API_URL}/messages/${conversationId}`,
        getAuthHeaders()
      )
      setMessages(response.data.data)
    } catch (err) {
      setError('Failed to load messages')
    }
  }

  const handleCreateTicket = async (ticketSubject) => {
    if (!ticketSubject.trim()) return

    try {
      const response = await axios.post(
        `${API_URL}/conversations`,
        { subject: ticketSubject },
        getAuthHeaders()
      )
      setShowCreateModal(false)
      fetchData(user?.role)
      setSelectedConversation(response.data.data)
      setShowChatModal(true)
      toast.success('✅ Ticket Created', {
        description: 'Your ticket has been created successfully.',
        duration: 4000,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket')
      toast.error('❌ Failed to Create Ticket', {
        description: err.response?.data?.message || 'Please try again.',
        duration: 4000,
      })
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedImage) || !selectedConversation) return

    try {
      setUploadingImage(true)
      // Stop typing before sending
      socketRef.current?.emit('stop_typing', { conversationId: selectedConversation._id })
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

      // Prepare form data for potential image upload
      const formData = new FormData()
      formData.append('conversation_id', selectedConversation._id)
      formData.append('isi_pesan', newMessage.trim())
      
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      await axios.post(
        `${API_URL}/messages`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      setNewMessage('')
      setSelectedImage(null)
      setImagePreview(null)
    } catch (err) {
      setError('Failed to send message')
      console.error('Send message error:', err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Hanya file gambar yang diizinkan (JPEG, PNG, GIF, WEBP)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    setSelectedImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCloseTicket = async (conversationId) => {
    if (!confirm('Are you sure you want to close this ticket?')) return

    try {
      await axios.post(
        `${API_URL}/conversations/${conversationId}/close`,
        {},
        getAuthHeaders()
      )
      setSuccess('Ticket closed successfully!')
      fetchData(user?.role)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close ticket')
    }
  }

  const handleAddITStaff = async (e) => {
    e.preventDefault()
    if (!selectedConvForAssign || !selectedITStaff) {
      setError('Please select both conversation and IT staff')
      return
    }

    try {
      await axios.post(
        `${API_URL}/conversations/${selectedConvForAssign}/add-it-staff`,
        { it_staff_id: selectedITStaff },
        getAuthHeaders()
      )
      setSuccess('IT Staff assigned successfully!')
      setShowAssignModal(false)
      setSelectedConvForAssign('')
      setSelectedITStaff('')
      fetchData(user?.role)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add IT staff')
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axios.put(
        `${API_URL}/users/${userId}`,
        { role: newRole },
        getAuthHeaders()
      )
      setSuccess('User role updated!')
      fetchData(user?.role)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role')
    }
  }

  const openChat = (conv) => {
    setSelectedConversation(conv)
    setShowChatModal(true)
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-white/60 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  const openTickets = conversations.filter(c => c.status === 'open')
  const activeTickets = conversations.filter(c => c.status === 'in_progress')
  const closedTickets = conversations.filter(c => c.status === 'closed')
  const hasActiveTicket = openTickets.length > 0 || activeTickets.length > 0





  // Render based on role
  const renderUserDashboard = () => (
    <UserDashboard
      conversations={conversations}
      onOpenChat={openChat}
      onCreateTicket={() => setShowCreateModal(true)}
      formatDate={formatDate}
    />
  )

  const renderStaffDashboard = () => (
    <div className="flex-1 p-4 sm:p-6 overflow-auto">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {user?.role === 'admin' ? 'Admin Dashboard' : 'Ticket Management'}
        </h2>
        <p className="text-white/60 text-sm sm:text-base">
          {user?.role === 'admin' ? 'Manage tickets, users, and IT staff' : 'View and manage all support tickets'}
        </p>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-slideIn">
          <p className="text-red-300 font-medium text-sm sm:text-base">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-lg animate-slideIn">
          <p className="text-green-300 font-medium text-sm sm:text-base">{success}</p>
        </div>
      )}

      <TicketStats
        openTickets={openTickets.length}
        activeTickets={activeTickets.length}
        closedTickets={closedTickets.length}
        totalTickets={conversations.length}
      />

      {/* Tabs for Admin */}
      {user?.role === 'admin' && (
        <div className="flex gap-2 mb-4 sm:mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 sm:px-6 py-2 sm:py-3 font-medium transition-colors relative text-sm sm:text-base ${
              activeTab === 'tickets' ? 'text-orange-400' : 'text-white/60 hover:text-white'
            }`}
          >
            Tickets
            {activeTab === 'tickets' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-400"></span>}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'users' ? 'text-orange-400' : 'text-white/60 hover:text-white'
            }`}
          >
            Users
            {activeTab === 'users' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-400"></span>}
          </button>
        </div>
      )}

      {/* Tickets Tab */}
      {(activeTab === 'tickets' || user?.role === 'it_staff') && (
        <TicketList
          conversations={conversations}
          user={user}
          filter={filter}
          setFilter={setFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onOpenChat={openChat}
          onCloseTicket={handleCloseTicket}
          onAssignTicket={(convId) => {
            setSelectedConvForAssign(convId)
            setShowAssignModal(true)
          }}
          formatDate={formatDate}
        />
      )}

      {/* Users Tab (Admin Only) */}
      {user?.role === 'admin' && activeTab === 'users' && (
        <UserList
          users={users}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={(val) => {
            setItemsPerPage(val)
            setUserCurrentPage(1)
          }}
          currentPage={userCurrentPage}
          setCurrentPage={setUserCurrentPage}
          onChangeRole={handleChangeRole}
          onViewUser={(u) => {
            setSelectedUser(u)
            setShowUserDetail(true)
          }}
          formatDate={formatDate}
        />
      )}

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button 
                onClick={() => setShowUserDetail(false)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white text-2xl font-bold">
                {selectedUser.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">{selectedUser.nama}</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                  selectedUser.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                  selectedUser.role === 'it_staff' ? 'bg-blue-500/20 text-blue-300' : 
                  'bg-green-500/20 text-green-300'
                }`}>
                  {selectedUser.role}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-white/50 mb-1">Email</p>
                <p className="text-white font-medium">{selectedUser.email}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-white/50 mb-1">Work ID</p>
                <p className="text-orange-400 font-medium">{selectedUser.work_id}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-white/50 mb-1">Member Since</p>
                <p className="text-white">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40 text-center">User ID: {selectedUser._id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <Header user={user} onLogout={handleLogout} />

      {/* Main Content */}
      {user?.role === 'user' ? renderUserDashboard() : renderStaffDashboard()}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTicket}
        />
      )}

      {/* Chat Modal */}
      {showChatModal && selectedConversation && (
        <ChatModal
          conversation={selectedConversation}
          messages={messages}
          user={user}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          onClose={() => setShowChatModal(false)}
          formatDate={formatDate}
          messagesEndRef={messagesEndRef}
          typingUsers={typingUsers}
          socketRef={socketRef}
          typingTimeoutRef={typingTimeoutRef}
          selectedImage={selectedImage}
          imagePreview={imagePreview}
          uploadingImage={uploadingImage}
          onImageSelect={handleImageSelect}
          clearSelectedImage={clearSelectedImage}
          fileInputRef={fileInputRef}
          previewImage={previewImage}
          setPreviewImage={setPreviewImage}
        />
      )}

      <AssignModal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSubmit={handleAddITStaff}
        itStaff={itStaff}
        selectedITStaff={selectedITStaff}
        setSelectedITStaff={setSelectedITStaff}
      />



      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Dashboard
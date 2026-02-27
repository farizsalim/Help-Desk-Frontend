import { 
  Header, 
  UserDashboard,
  StaffDashboard,
  CreateTicketModal, 
  ChatModal, 
  AssignModal
} from '../components/dashboard'
import { useDashboard } from '../hooks/useDashboard'

function Dashboard() {
  const {
    user, conversations, users, itStaff,
    selectedConversation, setSelectedConversation,
    selectedConvForAssign, setSelectedConvForAssign,
    selectedITStaff, setSelectedITStaff,
    messages, newMessage, setNewMessage,
    showCreateModal, setShowCreateModal,
    showChatModal, setShowChatModal,
    showAssignModal, setShowAssignModal,
    loading, error, success,
    filter, setFilter,
    activeTab, setActiveTab,
    searchTerm, setSearchTerm,
    typingUsers,
    dateFilter, setDateFilter,
    selectedImage, imagePreview, uploadingImage,
    previewImage, setPreviewImage,
    userFilter, setUserFilter,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    selectedUser, setSelectedUser,
    showUserDetail, setShowUserDetail,
    itemsPerPage, setItemsPerPage,
    currentPage, setCurrentPage,
    userCurrentPage, setUserCurrentPage,
    messagesEndRef, fileInputRef,
    openTickets, activeTickets, closedTickets,
    handleLogout, handleCreateTicket, handleSendMessage,
    handleImageSelect, clearSelectedImage, handleCloseTicket,
    handleAddITStaff, handleChangeRole, openChat, formatDate
  } = useDashboard()

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header user={user} onLogout={handleLogout} />

      {user?.role === 'user' ? (
        <UserDashboard
          conversations={conversations}
          onOpenChat={openChat}
          onCreateTicket={() => setShowCreateModal(true)}
          formatDate={formatDate}
        />
      ) : (
        <StaffDashboard
          user={user}
          conversations={conversations}
          users={users}
          itStaff={itStaff}
          openTickets={openTickets}
          activeTickets={activeTickets}
          closedTickets={closedTickets}
          error={error}
          success={success}
          filter={filter}
          setFilter={setFilter}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          userCurrentPage={userCurrentPage}
          setUserCurrentPage={setUserCurrentPage}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          showUserDetail={showUserDetail}
          setShowUserDetail={setShowUserDetail}
          onOpenChat={openChat}
          onCloseTicket={handleCloseTicket}
          onAssignTicket={(convId) => {
            setSelectedConvForAssign(convId)
            setShowAssignModal(true)
          }}
          onChangeRole={handleChangeRole}
          formatDate={formatDate}
        />
      )}

      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTicket}
        />
      )}

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

import { TicketList, UserList, TicketStats } from './index'

function StaffDashboard({
  user,
  conversations,
  users,
  itStaff,
  openTickets,
  activeTickets,
  closedTickets,
  error,
  success,
  filter,
  setFilter,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  userCurrentPage,
  setUserCurrentPage,
  userFilter,
  setUserFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedUser,
  setSelectedUser,
  showUserDetail,
  setShowUserDetail,
  onOpenChat,
  onCloseTicket,
  onAssignTicket,
  onChangeRole,
  formatDate
}) {
  return (
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
          onOpenChat={onOpenChat}
          onCloseTicket={onCloseTicket}
          onAssignTicket={onAssignTicket}
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
          onChangeRole={onChangeRole}
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
}

export default StaffDashboard

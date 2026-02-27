import React from 'react'

const TicketList = ({
  conversations,
  user,
  filter,
  setFilter,
  dateFilter,
  setDateFilter,
  searchTerm,
  setSearchTerm,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  onOpenChat,
  onCloseTicket,
  onAssignTicket,
  formatDate
}) => {
  const filteredConversations = conversations
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => {
      if (!dateFilter.start && !dateFilter.end) return true
      const ticketDate = new Date(c.createdAt)
      const start = dateFilter.start ? new Date(dateFilter.start) : null
      const end = dateFilter.end ? new Date(dateFilter.end) : null
      if (start && ticketDate < start) return false
      if (end && ticketDate > new Date(end.setHours(23, 59, 59))) return false
      return true
    })
    .filter(c => 
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.participants?.[0]?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.participants?.[0]?.work_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage)
  const paginatedConversations = filteredConversations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <>
      {/* Search */}
      <div className="mb-3 sm:mb-4">
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm sm:text-base"
        />
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
        {['all', 'open', 'in_progress', 'closed'].map((status) => (
          <button
            key={status}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
              filter === status
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
            }`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Date Filter */}
      <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 text-white/60 text-sm flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Date Range:</span>
            <span className="sm:hidden">Date:</span>
          </div>
          <div className="flex flex-col sm:flex-row flex-1 gap-2">
            <div className="flex flex-1 gap-2 items-center">
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                className="flex-1 min-w-0 px-2 sm:px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm focus:border-orange-500 outline-none"
              />
              <span className="text-white/40 text-sm flex-shrink-0">to</span>
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                className="flex-1 min-w-0 px-2 sm:px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm focus:border-orange-500 outline-none"
              />
            </div>
            {(dateFilter.start || dateFilter.end) && (
              <button
                onClick={() => setDateFilter({ start: '', end: '' })}
                className="px-3 py-2 text-red-400 hover:bg-red-500/10 rounded text-sm flex-shrink-0 self-start sm:self-center"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Items Per Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs sm:text-sm">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm focus:border-orange-500 outline-none"
          >
            <option value={5} className="bg-slate-800">5</option>
            <option value={10} className="bg-slate-800">10</option>
            <option value={20} className="bg-slate-800">20</option>
            <option value={40} className="bg-slate-800">40</option>
            <option value={80} className="bg-slate-800">80</option>
          </select>
          <span className="text-white/60 text-xs sm:text-sm hidden sm:inline">entries</span>
        </div>
        <p className="text-white/60 text-xs sm:text-sm">
          {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredConversations.length)} of {filteredConversations.length}
        </p>
      </div>

      {/* Tickets List */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
        {filteredConversations.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-white/60 text-sm">No tickets found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {paginatedConversations.map(conv => (
              <div key={conv._id} className="px-3 sm:px-6 py-3 sm:py-4 hover:bg-white/5 transition-colors">
                <div className="flex flex-col gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <h4 className="font-semibold text-white text-sm sm:text-base truncate">{conv.subject}</h4>
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                        conv.status === 'open' ? 'bg-green-500/20 text-green-300' :
                        conv.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {conv.status === 'open' ? 'Open' : conv.status === 'in_progress' ? 'In Progress' : 'Closed'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/50">
                      {conv.status === 'closed'
                        ? <>
                            Created {formatDate(conv.createdAt)} by <span className="text-orange-400 font-medium">{conv.participants?.[0]?.nama || 'Unknown'}</span>
                            {conv.closed_at && (
                              <>
                                <span className="hidden sm:inline"><br/></span>
                                <span className="sm:hidden"> • </span>
                                Closed {formatDate(conv.closed_at)} by <span className="text-orange-400 font-medium">{conv.closed_by?.nama || 'Unknown'}</span>
                              </>
                            )}
                          </>
                        : <>
                            Created {formatDate(conv.createdAt)} by <span className="text-orange-400 font-medium">{conv.participants?.[0]?.nama || 'Unknown'}</span>
                          </>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <button
                      onClick={() => onOpenChat(conv)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-yellow-600 transition-all text-xs sm:text-sm"
                    >
                      Open Chat
                    </button>
                    {(user?.role === 'admin' || user?.role === 'it_staff') && conv.status !== 'closed' && (
                      <button
                        onClick={() => onCloseTicket(conv._id)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-medium hover:bg-red-500/20 transition-colors text-xs sm:text-sm"
                      >
                        Close
                      </button>
                    )}
                    {user?.role === 'admin' && conv.status !== 'closed' && (
                      <button
                        onClick={() => onAssignTicket(conv._id)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg font-medium hover:bg-blue-500/20 transition-colors text-xs sm:text-sm"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredConversations.length > 0 && (
        <div className="flex items-center justify-between mt-3 sm:mt-4 gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">←</span>
          </button>
          <div className="flex gap-0.5 sm:gap-1 overflow-x-auto max-w-[50%] sm:max-w-none scrollbar-hide">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page =>
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-1.5 sm:px-3 py-1.5 sm:py-2 text-white/40 text-xs sm:text-sm">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">→</span>
          </button>
        </div>
      )}
    </>
  )
}

export default TicketList

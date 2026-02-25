import React from 'react'

const UserDashboard = ({
  conversations,
  onOpenChat,
  onCreateTicket,
  formatDate
}) => {
  const openTickets = conversations.filter(c => c.status === 'open')
  const activeTickets = conversations.filter(c => c.status === 'in_progress')
  const hasActiveTicket = openTickets.length > 0 || activeTickets.length > 0

  const handleOpenChat = () => {
    const activeTicket = [...openTickets, ...activeTickets].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0]
    if (activeTicket) onOpenChat(activeTicket)
  }

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Tickets</h2>
          <p className="text-white/60 text-sm sm:text-base">Create and manage your support tickets</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {hasActiveTicket ? (
            <button
              onClick={handleOpenChat}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 transform transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Open Chat
            </button>
          ) : (
            <button
              onClick={onCreateTicket}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/25 transform transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Ticket
            </button>
          )}
        </div>
      </div>

      {hasActiveTicket && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg animate-slideIn">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-300 font-medium">You have an active ticket</p>
              <p className="text-green-200/60 text-sm mt-1">
                Click "Open Chat" to continue your conversation. You can create a new ticket after this one is closed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ticket History */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="font-semibold text-white">Ticket History</h3>
        </div>
        {conversations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white/60">No tickets yet</p>
            <p className="text-white/40 text-sm mt-2">Create your first ticket to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {conversations.map(conv => (
              <div key={conv._id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white truncate">{conv.subject}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                        conv.status === 'open' ? 'bg-green-500/20 text-green-300' : 
                        conv.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' : 
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {conv.status === 'open' ? 'Open' : conv.status === 'in_progress' ? 'In Progress' : 'Closed'}
                      </span>
                    </div>
                    <p className="text-sm text-white/50">
                      Created {formatDate(conv.createdAt)}
                      {conv.closed_at && `  Closed ${formatDate(conv.closed_at)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenChat(conv)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-yellow-600 transition-all text-sm flex-shrink-0"
                  >
                    Open Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDashboard

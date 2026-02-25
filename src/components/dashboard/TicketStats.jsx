import React from 'react'

const TicketStats = ({ openTickets, activeTickets, closedTickets, totalTickets }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white/10">
        <p className="text-white/60 text-xs sm:text-sm">Open</p>
        <p className="text-xl sm:text-3xl font-bold text-green-400">{openTickets}</p>
      </div>
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white/10">
        <p className="text-white/60 text-xs sm:text-sm">In Progress</p>
        <p className="text-xl sm:text-3xl font-bold text-orange-400">{activeTickets}</p>
      </div>
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white/10">
        <p className="text-white/60 text-xs sm:text-sm">Closed</p>
        <p className="text-xl sm:text-3xl font-bold text-red-400">{closedTickets}</p>
      </div>
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white/10">
        <p className="text-white/60 text-xs sm:text-sm">Total</p>
        <p className="text-xl sm:text-3xl font-bold text-blue-400">{totalTickets}</p>
      </div>
    </div>
  )
}

export default TicketStats

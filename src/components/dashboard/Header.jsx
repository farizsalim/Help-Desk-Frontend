import React from 'react'

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-white/5 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Help Desk</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                {user?.nama?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-white text-sm">{user?.nama}</p>
                <p className="text-xs text-white/50">{user?.work_id}  {user?.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-medium hover:bg-red-500/20 transition-colors text-xs sm:text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

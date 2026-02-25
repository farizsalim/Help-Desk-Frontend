import React, { useState } from 'react'

const CreateTicketModal = ({ onClose, onSubmit }) => {
  const [subject, setSubject] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (subject.trim()) {
      onSubmit(subject)
      setSubject('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-slate-800 border-r border-white/10 shadow-2xl animate-slideInLeft">
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h3 className="text-xl font-bold text-white">Create New Ticket</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Subject / Problem Description</label>
                <textarea
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  rows="6"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-white/20 text-white/60 rounded-lg hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-bold hover:from-orange-600 hover:to-yellow-600 shadow-lg shadow-orange-500/25"
              >
                Create Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateTicketModal

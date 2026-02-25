import React from 'react'

const AssignModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  itStaff, 
  selectedITStaff, 
  setSelectedITStaff 
}) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Assign IT Staff to Ticket</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Select IT Staff</label>
            <select
              value={selectedITStaff}
              onChange={(e) => setSelectedITStaff(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 outline-none"
            >
              <option value="" className="bg-slate-800">-- Select IT Staff --</option>
              {itStaff.map(staff => (
                <option key={staff._id} value={staff._id} className="bg-slate-800">
                  {staff.nama} ({staff.work_id})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-bold shadow-lg shadow-orange-500/25"
            >
              Assign
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssignModal

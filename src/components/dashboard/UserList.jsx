import React from 'react'

const UserList = ({
  users,
  searchTerm,
  setSearchTerm,
  userFilter,
  setUserFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  onChangeRole,
  onViewUser,
  formatDate
}) => {
  const filteredUsers = users.filter(u =>
    u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.work_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const processedUsers = filteredUsers
    .filter(u => userFilter === 'all' || u.role === userFilter)
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'nama') comparison = a.nama.localeCompare(b.nama)
      else if (sortBy === 'work_id') comparison = a.work_id.localeCompare(b.work_id)
      else if (sortBy === 'role') comparison = a.role.localeCompare(b.role)
      else if (sortBy === 'createdAt') comparison = new Date(a.createdAt) - new Date(b.createdAt)
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const totalUsers = processedUsers.length
  const totalPages = Math.ceil(totalUsers / itemsPerPage)
  const paginatedUsers = processedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <>
      {/* User Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm">Total Users</p>
          <p className="text-3xl font-bold text-blue-400">{users.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm">Admin</p>
          <p className="text-3xl font-bold text-red-400">{users.filter(u => u.role === 'admin').length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm">IT Staff</p>
          <p className="text-3xl font-bold text-blue-400">{users.filter(u => u.role === 'it_staff').length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm">Users</p>
          <p className="text-3xl font-bold text-green-400">{users.filter(u => u.role === 'user').length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
        />
      </div>

      {/* Role Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'admin', 'it_staff', 'user'].map((role) => (
          <button
            key={role}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
              userFilter === role
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
            }`}
            onClick={() => setUserFilter(role)}
          >
            {role === 'all' ? 'All Roles' : role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Sort & Items Per Page */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
          <span className="text-white/60 text-sm">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-orange-500 outline-none"
          >
            <option value="nama" className="bg-slate-800">Name</option>
            <option value="work_id" className="bg-slate-800">Work ID</option>
            <option value="role" className="bg-slate-800">Role</option>
            <option value="createdAt" className="bg-slate-800">Date Created</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors"
          >
            <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-orange-500 outline-none"
          >
            <option value={5} className="bg-slate-800">5</option>
            <option value={10} className="bg-slate-800">10</option>
            <option value={20} className="bg-slate-800">20</option>
            <option value={40} className="bg-slate-800">40</option>
            <option value={80} className="bg-slate-800">80</option>
          </select>
          <span className="text-white/60 text-sm">entries</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-white/60">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase hidden sm:table-cell">Work ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase hidden md:table-cell">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white/60 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedUsers.map(u => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold">
                          {u.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm">{u.nama}</h4>
                          <p className="text-xs text-white/40">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs font-medium">
                        {u.work_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        u.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                        u.role === 'it_staff' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50 hidden md:table-cell">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewUser(u)}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <select
                          value={u.role}
                          onChange={(e) => onChangeRole(u._id, e.target.value)}
                          className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:border-orange-500 outline-none"
                        >
                          <option value="user" className="bg-slate-800">User</option>
                          <option value="it_staff" className="bg-slate-800">IT Staff</option>
                          <option value="admin" className="bg-slate-800">Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {totalUsers > 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-3 bg-white/5 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <p className="text-white/60 text-sm">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(page =>
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                              )
                              .map((page, index, array) => (
                                <React.Fragment key={page}>
                                  {index > 0 && array[index - 1] !== page - 1 && (
                                    <span className="px-2 py-1.5 text-white/40">...</span>
                                  )}
                                  <button
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-2.5 py-1.5 rounded-lg text-sm font-medium ${
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
                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default UserList

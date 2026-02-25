import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    work_id: '',
    nama: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/auth/register`, formData)
      
      // Save only token to localStorage (security best practice)
      localStorage.setItem('token', response.data.token)
      
      // Redirect to dashboard - user data will be fetched from backend
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8 transform transition-all duration-300 hover:shadow-orange-500/20">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="text-white/60 mt-2">Join our support platform</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-slideIn">
            <p className="text-red-300 font-medium text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">Work ID</label>
            <input
              type="text"
              name="work_id"
              value={formData.work_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-200"
              placeholder="Enter your work ID"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">Full Name</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-200"
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-200"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-200"
              placeholder="Min 6 characters"
            />
          </div>

          <button 
            type="submit" 
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transform transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-orange-500/25 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-white/60">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <style>{`
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

export default Register
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './page/Login'
import Register from './page/Register'
import Dashboard from './page/Dashboard'
import { PublicOnlyRoute, PrivateRoute } from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Only Routes - Redirect if already logged in */}
        <Route path="/login" element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } />
        <Route path="/register" element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        } />

        {/* Dashboard Route - For all authenticated users (role-based inside) */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App

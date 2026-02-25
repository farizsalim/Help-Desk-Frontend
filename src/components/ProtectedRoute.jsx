import { Navigate } from 'react-router-dom'

// Check if user is authenticated (only check token)
const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

// Route yang hanya bisa diakses kalau BELUM login (Login, Register)
export const PublicOnlyRoute = ({ children }) => {
  if (isAuthenticated()) {
    // Redirect ke dashboard - role check akan dilakukan di Dashboard
    return <Navigate to="/dashboard" replace />
  }
  return children
}

// Route yang hanya bisa diakses kalau SUDAH login
export const PrivateRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Route khusus User (bukan admin/it_staff) - Deprecated, use PrivateRoute
export const UserOnlyRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Route khusus Admin dan IT Staff - Deprecated, use PrivateRoute
export const StaffOnlyRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Route khusus Admin saja - Deprecated, use PrivateRoute
export const AdminOnlyRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}
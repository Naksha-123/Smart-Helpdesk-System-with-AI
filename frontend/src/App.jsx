import React from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TicketDetail from './pages/TicketDetail'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/Navbar'


const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role === 'user') return <Navigate to="/dashboard" replace />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
  <NotificationProvider>
    <AppRoutes />
  </NotificationProvider>
</SocketProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
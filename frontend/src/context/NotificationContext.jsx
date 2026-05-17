import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSocket } from './SocketContext'
import { useAuth } from './AuthContext'
import api from '../api/axios'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch existing unread notifications on login
  useEffect(() => {
    if (!user) return
    const fetchTickets = async () => {
      try {
        const { data } = await api.get('/tickets', { params: { limit: 50 } })
        // Count tickets with recent activity as "notifications"
        const recent = data.tickets.filter(t => {
          const lastMsg = t.messages?.[t.messages.length - 1]
          if (!lastMsg) return false
          const isRecent = new Date() - new Date(lastMsg.createdAt) < 24 * 60 * 60 * 1000
          const notMine = lastMsg.sender !== user._id && lastMsg.senderRole !== 'ai'
          return isRecent && notMine
        })
        setUnreadCount(recent.length)
      } catch {}
    }
    fetchTickets()
  }, [user])

  // Listen for real-time new messages
  useEffect(() => {
    if (!socket) return
    socket.on('new_message', ({ ticket }) => {
      const lastMsg = ticket?.messages?.[ticket.messages.length - 1]
      if (!lastMsg) return

      // Don't notify for own messages or AI messages
      if (lastMsg.sender === user?._id) return

      const newNotif = {
        id: Date.now(),
        ticketId: ticket._id,
        ticketRef: ticket.ticketId,
        title: ticket.title,
        message: `${lastMsg.senderName}: ${lastMsg.content.slice(0, 60)}${lastMsg.content.length > 60 ? '...' : ''}`,
        time: new Date(),
        read: false,
      }

      setNotifications(prev => [newNotif, ...prev.slice(0, 19)])
      setUnreadCount(prev => prev + 1)
    })

    return () => socket.off('new_message')
  }, [socket, user])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const markOneRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, markAllRead, markOneRead, clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Trash2, MessageSquare } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markOneRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const [shake, setShake] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const prevCount = useRef(unreadCount)

  // Shake bell when new notification arrives
  useEffect(() => {
    if (unreadCount > prevCount.current) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
    prevCount.current = unreadCount
  }, [unreadCount])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNotifClick = (notif) => {
    markOneRead(notif.id)
    setOpen(false)
    navigate(`/tickets/${notif.ticketId}`)
  }

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div ref={dropdownRef} style={styles.wrapper}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead() }}
        style={styles.bellBtn}
        title="Notifications"
      >
        <Bell
          size={18}
          color={unreadCount > 0 ? '#4f8ef7' : '#8b9cc4'}
          style={{
            transition: 'all 0.2s',
            animation: shake ? 'bellShake 0.6s ease' : 'none',
          }}
        />
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={styles.dropdown} className="animate-fade">
          {/* Header */}
          <div style={styles.dropHeader}>
            <span style={styles.dropTitle}>Notifications</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {notifications.length > 0 && (
                <>
                  <button onClick={markAllRead} style={styles.actionBtn} title="Mark all read">
                    <Check size={13} />
                  </button>
                  <button onClick={clearAll} style={styles.actionBtn} title="Clear all">
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>
                <Bell size={28} color="#1e2a42" />
                <p style={{ color: '#4a5568', fontSize: '0.82rem', marginTop: 8 }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  style={{
                    ...styles.notifItem,
                    background: notif.read ? 'transparent' : 'rgba(79,142,247,0.06)',
                    borderLeft: notif.read ? '3px solid transparent' : '3px solid #4f8ef7',
                  }}
                >
                  <div style={styles.notifIcon}>
                    <MessageSquare size={14} color="#4f8ef7" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.notifRef}>{notif.ticketRef}</div>
                    <div style={styles.notifTitle}>{notif.title}</div>
                    <div style={styles.notifMsg}>{notif.message}</div>
                    <div style={styles.notifTime}>{timeAgo(notif.time)}</div>
                  </div>
                  {!notif.read && <div style={styles.unreadDot} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bellShake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-15deg); }
          40% { transform: rotate(15deg); }
          60% { transform: rotate(-10deg); }
          80% { transform: rotate(10deg); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  wrapper: { position: 'relative' },
  bellBtn: {
    position: 'relative',
    background: 'transparent',
    border: '1px solid #1e2a42',
    borderRadius: 8,
    padding: '6px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.15s',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    background: '#ef4444',
    color: '#fff',
    fontSize: '0.6rem',
    fontWeight: 700,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
    border: '2px solid #0a0d14',
  },
  dropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 340,
    background: '#111623',
    border: '1px solid #1e2a42',
    borderRadius: 14,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    zIndex: 999,
    overflow: 'hidden',
  },
  dropHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid #1e2a42',
  },
  dropTitle: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#e8edf5',
    fontFamily: 'var(--font-heading)',
  },
  actionBtn: {
    background: 'transparent',
    border: '1px solid #1e2a42',
    borderRadius: 6,
    color: '#8b9cc4',
    padding: '4px 6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  list: {
    maxHeight: 380,
    overflowY: 'auto',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
  },
  notifItem: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #1e2a42',
    transition: 'background 0.15s',
  },
  notifIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'rgba(79,142,247,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  notifRef: { fontSize: '0.68rem', color: '#4a5568', fontFamily: 'monospace', fontWeight: 700 },
  notifTitle: { fontSize: '0.82rem', fontWeight: 600, color: '#e8edf5', marginTop: 2 },
  notifMsg: { fontSize: '0.75rem', color: '#8b9cc4', marginTop: 3, lineHeight: 1.4 },
  notifTime: { fontSize: '0.68rem', color: '#4a5568', marginTop: 4 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#4f8ef7',
    flexShrink: 0,
    marginTop: 6,
  },
}
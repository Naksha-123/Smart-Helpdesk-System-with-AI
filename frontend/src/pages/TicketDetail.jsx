import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import StarRating from '../components/StarRating'
import { useSocket } from '../context/SocketContext'

import {
  ArrowLeft, Send, Sparkles, User, Clock, Tag,
  CheckCircle, AlertCircle, RefreshCw, ChevronDown, Paperclip
} from 'lucide-react'

const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed']
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent']
const statusClass = { 'Open': 'badge-open', 'In Progress': 'badge-progress', 'Resolved': 'badge-resolved', 'Closed': 'badge-closed' }
const priorityClass = { 'Low': 'badge-low', 'Medium': 'badge-medium', 'High': 'badge-high', 'Urgent': 'badge-urgent' }

export default function TicketDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState(false)
  const messagesEndRef = useRef(null)
  const { socket } = useSocket()
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  const [typingUser, setTypingUser] = useState(null)
  const [uploading, setUploading] = useState(false)
const fileInputRef = useRef(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/tickets/${id}`)
        setTicket(data.ticket)
      } catch { navigate('/dashboard') }
      finally { setLoading(false) }
    }
    fetch()
  }, [id])

  useEffect(() => { scrollToBottom() }, [ticket?.messages])

  // Join ticket room on mount, leave on unmount
useEffect(() => {
  if (!socket || !id) return
  socket.emit('join_ticket', id)
  return () => socket.emit('leave_ticket', id)
}, [socket, id])

// Listen for new messages in real time
useEffect(() => {
  if (!socket) return
  socket.on('new_message', ({ ticketId, ticket: updatedTicket }) => {
    if (ticketId === id) {
      setTicket(updatedTicket)
    }
  })
  return () => socket.off('new_message')
}, [socket, id])

// Listen for typing indicator
useEffect(() => {
  if (!socket) return
  socket.on('user_typing', ({ userName, isTyping }) => {
    setTypingUser(isTyping ? userName : null)
  })
  return () => socket.off('user_typing')
}, [socket])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || sending) return
    setSending(true)
    try {
      const { data } = await api.post(`/tickets/${id}/message`, { content: message })
      setTicket(data.ticket)
      setMessage('')
    } catch (err) {
      console.error(err)
    } finally { setSending(false) }
  }

  const updateTicket = async (field, value) => {
    setUpdating(true)
    try {
      const { data } = await api.patch(`/tickets/${id}`, { [field]: value })
      setTicket(data.ticket)
    } catch (err) {
      console.error(err)
    } finally { setUpdating(false) }
  }

  const handleFileUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  setUploading(true)
  try {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post(`/tickets/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    setTicket(data.ticket)
  } catch (err) {
    alert('File upload failed. Max size is 5MB.')
  } finally {
    setUploading(false)
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
}
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )

  if (!ticket) return null

  const isAdminOrAgent = user?.role === 'admin' || user?.role === 'agent'

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: 20, padding: '8px 16px' }}>
          <ArrowLeft size={16} />Back
        </button>

        <div style={styles.layout}>
          {/* LEFT: Messages */}
          <div style={styles.mainCol}>
            {/* Ticket Header */}
            <div style={styles.ticketHeader}>
              <div style={styles.ticketMeta}>
                <span style={styles.ticketId}>{ticket.ticketId}</span>
                <span className={`badge ${statusClass[ticket.status]}`}>{ticket.status}</span>
                <span className={`badge ${priorityClass[ticket.priority]}`}>{ticket.priority}</span>
              </div>
              <h1 style={styles.ticketTitle}>{ticket.title}</h1>
              <div style={styles.ticketInfo}>
                <span style={styles.infoItem}><User size={13} />{ticket.createdBy?.name}</span>
                <span style={styles.infoItem}><Tag size={13} />{ticket.category}</span>
                <span style={styles.infoItem}><Clock size={13} />{new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Messages */}
            <div style={styles.messagesBox}>
              <div style={styles.messagesInner}>
                {ticket.messages.map((msg, i) => {
                  const isAI = msg.isAI
                  const isMe = msg.sender?._id === user?._id || msg.sender === user?._id
                  const isSystem = !isAI && !isMe

                  return (
                    <div key={i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      {!isMe && (
                        <div style={{
                          ...styles.avatar,
                          background: isAI ? 'linear-gradient(135deg, #4f8ef7, #a855f7)' : '#1e2a42'
                        }}>
                          {isAI ? <Sparkles size={14} color="#fff" /> : <User size={14} color="#8b9cc4" />}
                        </div>
                      )}
                      <div style={{ maxWidth: '72%' }}>
                        <div style={styles.msgSender}>
                          {isAI ? '✨ AI Assistant' : msg.senderName}
                          {isAI && <span style={styles.aiTag}>Automated</span>}
                        </div>
                        <div style={{
  ...styles.msgBubble,
  background: isMe ? '#1a3a6e' : isAI ? 'rgba(79,142,247,0.08)' : '#161c2d',
  border: isMe ? '1px solid rgba(79,142,247,0.4)' : isAI ? '1px solid rgba(79,142,247,0.2)' : '1px solid #1e2a42',
  color: isMe ? '#c8d8f8' : '#e8edf5',
}}>
  {msg.content.split('\n').map((line, j) => (
    <React.Fragment key={j}>
      {line}
      {j < msg.content.split('\n').length - 1 && <br />}
    </React.Fragment>
  ))}
  {msg.attachments?.length > 0 && (
    <div style={{ marginTop: 8 }}>
      {msg.attachments.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noreferrer">
          <img
            src={url}
            alt="attachment"
            style={{
              maxWidth: '100%',
              maxHeight: 220,
              borderRadius: 8,
              marginTop: 6,
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              display: 'block',
            }}
          />
        </a>
      ))}
    </div>
  )}
</div>
                        <div style={styles.msgTime}>
                          {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {typingUser && !sending && (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
    <div style={{ ...styles.avatar, background: '#1e2a42' }}>
      <User size={14} color="#8b9cc4" />
    </div>
    <div style={{ ...styles.msgBubble, background: '#161c2d', border: '1px solid #1e2a42', padding: '10px 14px' }}>
      <span style={{ fontSize: '0.78rem', color: '#8b9cc4' }}>
        <strong style={{ color: '#e8edf5' }}>{typingUser}</strong> is typing...
      </span>
    </div>
  </div>
)}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            {ticket.status !== 'Closed' && (
              <>
              <input
  type="file"
  ref={fileInputRef}
  onChange={handleFileUpload}
  accept="image/*"
  style={{ display: 'none' }}
/>

              <form onSubmit={sendMessage} style={styles.inputRow}>
                <textarea
                  className="form-input"
                  style={{ flex: 1, resize: 'none', minHeight: 52, maxHeight: 120, paddingTop: 14 }}
                  placeholder="Type your reply... (Press Enter to send)"
                  value={message}
                  onChange={e => {
  setMessage(e.target.value)
  if (socket) {
    socket.emit('typing', {
      ticketId: id,
      userName: user?.name,
      isTyping: e.target.value.length > 0,
    })
  }
}}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }}
                  disabled={sending}
                />
                  {/* Paperclip button ← ADD THIS */}
  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    className="btn btn-ghost"
    style={{ padding: '14px 16px', alignSelf: 'flex-end' }}
    disabled={uploading}
    title="Attach image"
  >
    {uploading
      ? <div className="spinner" style={{ width: 18, height: 18 }} />
      : <Paperclip size={18} />}
  </button>
                <button type="submit" className="btn btn-primary"
                  style={{ padding: '14px 20px', alignSelf: 'flex-end' }}
                  disabled={!message.trim() || sending}>
                  {sending ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <Send size={18} />}
                </button>
              </form>
              </>
            )}
            {ticket.status === 'Closed' && (
              <div style={styles.closedBanner}>
                <CheckCircle size={16} color="#22c55e" />
                <span>This ticket is closed. Open a new ticket if you need further assistance.</span>
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <div style={styles.sidebar}>
            {/* Status management (admin/agent only) */}
            {isAdminOrAgent && (
              <div style={styles.sideCard}>
                <h3 style={styles.sideTitle}>Manage Ticket</h3>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={ticket.status}
                    onChange={e => updateTicket('status', e.target.value)} disabled={updating}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">Priority</label>
                  <select className="form-input" value={ticket.priority}
                    onChange={e => updateTicket('priority', e.target.value)} disabled={updating}>
                    {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {updating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: '0.8rem', color: '#4f8ef7' }}>
                    <RefreshCw size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
                    Saving changes...
                  </div>
                )}
              </div>
            )}

            {/* Ticket Details */}
            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>Ticket Details</h3>
              {[
                { label: 'Ticket ID', value: ticket.ticketId, mono: true },
                { label: 'Category', value: ticket.category },
                { label: 'Created By', value: ticket.createdBy?.name },
                { label: 'Assigned To', value: ticket.assignedTo?.name || 'Unassigned' },
                { label: 'Created', value: new Date(ticket.createdAt).toLocaleDateString() },
                { label: 'Updated', value: new Date(ticket.updatedAt).toLocaleDateString() },
                ...(ticket.resolvedAt ? [{ label: 'Resolved', value: new Date(ticket.resolvedAt).toLocaleDateString() }] : []),
              ].map(({ label, value, mono }) => (
                <div key={label} style={styles.detailRow}>
                  <span style={styles.detailLabel}>{label}</span>
                  <span style={{ ...styles.detailValue, fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Rating */}
<StarRating ticket={ticket} onRated={() => {}} />

            {/* AI Suggestion */}
            {ticket.aiSuggestion && (
              <div style={styles.aiCard}>
                <div style={styles.aiCardHeader}>
                  <Sparkles size={15} color="#4f8ef7" />
                  <span style={styles.aiCardTitle}>AI Suggestion</span>
                </div>
                <p style={styles.aiCardText}>{ticket.aiSuggestion.slice(0, 200)}{ticket.aiSuggestion.length > 200 ? '...' : ''}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0d14', paddingBottom: 60 },
  container: { maxWidth: 1280, margin: '0 auto', padding: '28px 24px' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' },
  mainCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  ticketHeader: {
    background: '#111623', border: '1px solid #1e2a42', borderRadius: 14, padding: '22px',
  },
  ticketMeta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  ticketId: { fontFamily: 'monospace', fontSize: '0.78rem', color: '#4a5568', fontWeight: 700, letterSpacing: '0.06em' },
  ticketTitle: { fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: '#e8edf5', marginBottom: 14, lineHeight: 1.3 },
  ticketInfo: { display: 'flex', gap: 18, flexWrap: 'wrap' },
  infoItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#8b9cc4' },
  messagesBox: {
    background: '#111623', border: '1px solid #1e2a42', borderRadius: 14,
    height: 460, overflowY: 'auto',
  },
  messagesInner: { padding: '20px', display: 'flex', flexDirection: 'column', gap: 18, minHeight: '100%' },
  msgRow: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  avatar: {
    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginTop: 18,
  },
  msgSender: { fontSize: '0.75rem', color: '#4a5568', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 },
  aiTag: { background: 'rgba(79,142,247,0.15)', color: '#4f8ef7', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 10, fontWeight: 600 },
  msgBubble: {
    padding: '12px 16px', borderRadius: 12, fontSize: '0.875rem',
    lineHeight: 1.65, wordBreak: 'break-word',
  },
  msgTime: { fontSize: '0.68rem', color: '#4a5568', marginTop: 4, paddingLeft: 4 },
  typingDots: {
    display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0',
  },
  inputRow: { display: 'flex', gap: 12, alignItems: 'flex-end' },
  closedBanner: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
    borderRadius: 10, padding: '14px 18px', fontSize: '0.85rem', color: '#22c55e',
  },
  sidebar: { display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 },
  sideCard: {
    background: '#111623', border: '1px solid #1e2a42', borderRadius: 12, padding: '18px',
  },
  sideTitle: { fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700, color: '#e8edf5', marginBottom: 16 },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e2a42' },
  detailLabel: { fontSize: '0.75rem', color: '#4a5568', fontWeight: 500 },
  detailValue: { fontSize: '0.8rem', color: '#e8edf5', fontWeight: 500, textAlign: 'right', maxWidth: 140, wordBreak: 'break-word' },
  aiCard: {
    background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 12, padding: '16px',
  },
  aiCardHeader: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 },
  aiCardTitle: { fontSize: '0.82rem', fontWeight: 600, color: '#4f8ef7' },
  aiCardText: { fontSize: '0.8rem', color: '#8b9cc4', lineHeight: 1.6 },
}
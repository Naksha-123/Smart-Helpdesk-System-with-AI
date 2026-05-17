import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, User, MessageSquare } from 'lucide-react'

const statusClass = {
  'Open': 'badge-open',
  'In Progress': 'badge-progress',
  'Resolved': 'badge-resolved',
  'Closed': 'badge-closed'
}
const priorityClass = {
  'Low': 'badge-low',
  'Medium': 'badge-medium',
  'High': 'badge-high',
  'Urgent': 'badge-urgent'
}
const categoryColors = {
  'Technical': '#4f8ef7',
  'Billing': '#f59e0b',
  'General': '#22c55e',
  'Account': '#a855f7',
  'Feature Request': '#ec4899',
}

export default function TicketCard({ ticket }) {
  const navigate = useNavigate()

  // Safety check
  if (!ticket) return null

  const msgCount = ticket?.messages?.length || 0
  const catColor = categoryColors[ticket?.category] || '#8b9cc4'

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/tickets/${ticket._id}`)}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#243048'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1e2a42'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.idRow}>
          <span style={{ ...styles.catDot, background: catColor }} />
          <span style={styles.ticketId}>{ticket.ticketId}</span>
          <span style={styles.category}>{ticket.category}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className={`badge ${statusClass[ticket.status] || ''}`}>{ticket.status}</span>
          <span className={`badge ${priorityClass[ticket.priority] || ''}`}>{ticket.priority}</span>
        </div>
      </div>

      {/* Title */}
      <h3 style={styles.title}>{ticket.title}</h3>
      <p style={styles.desc}>
        {ticket.description && ticket.description.length > 100
          ? ticket.description.slice(0, 100) + '...'
          : ticket.description}
      </p>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerLeft}>
          <div style={styles.metaItem}>
            <User size={12} />
            <span>{ticket.createdBy?.name || 'Unknown'}</span>
          </div>
          <div style={styles.metaItem}>
            <MessageSquare size={12} />
            <span>{msgCount} message{msgCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div style={styles.metaItem}>
          <Clock size={12} />
          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  idRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  ticketId: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
    letterSpacing: '0.06em',
  },
  category: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: 1.4,
    fontFamily: 'var(--font-heading)',
  },
  desc: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTop: '1px solid var(--border)',
    marginTop: 2,
  },
  footerLeft: {
    display: 'flex',
    gap: 14,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
}
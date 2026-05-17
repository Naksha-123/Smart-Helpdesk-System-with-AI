import React, { useState } from 'react'
import { Star } from 'lucide-react'
import api from '../api/axios'

const labels = { 1: 'Terrible', 2: 'Poor', 3: 'Okay', 4: 'Good', 5: 'Excellent!' }

export default function StarRating({ ticket, onRated }) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!selected) { setError('Please select a rating.'); return }
    setSubmitting(true); setError('')
    try {
      await api.post(`/tickets/${ticket._id}/rate`, { score: selected, feedback })
      setSubmitted(true)
      onRated && onRated(selected)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating.')
    } finally {
      setSubmitting(false)
    }
  }

  // Already rated
  if (ticket.rating?.score) {
    return (
      <div style={styles.box}>
        <p style={styles.title}>Your Rating</p>
        <div style={{ display: 'flex', gap: 4, margin: '8px 0' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={22}
              fill={i <= ticket.rating.score ? '#f59e0b' : 'transparent'}
              color={i <= ticket.rating.score ? '#f59e0b' : '#1e2a42'} />
          ))}
        </div>
        {ticket.rating.feedback && (
          <p style={styles.feedbackText}>"{ticket.rating.feedback}"</p>
        )}
        <p style={styles.thankyou}>✅ Thank you for your feedback!</p>
      </div>
    )
  }

  // Just submitted
  if (submitted) {
    return (
      <div style={{ ...styles.box, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>🎉</div>
        <p style={styles.title}>Thank you for rating!</p>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', margin: '8px 0' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={22}
              fill={i <= selected ? '#f59e0b' : 'transparent'}
              color={i <= selected ? '#f59e0b' : '#1e2a42'} />
          ))}
        </div>
        <p style={{ fontSize: '0.8rem', color: '#8b9cc4' }}>Your feedback helps us improve.</p>
      </div>
    )
  }

  // Only show rating if ticket is resolved/closed
  if (ticket.status !== 'Resolved' && ticket.status !== 'Closed') {
    return null
  }

  return (
    <div style={styles.box}>
      <p style={styles.title}>Rate your experience</p>
      <p style={styles.sub}>How satisfied are you with the support you received?</p>

      {/* Stars */}
      <div style={{ display: 'flex', gap: 6, margin: '12px 0 4px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} style={styles.starBtn}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(i)}>
            <Star size={28}
              fill={i <= (hovered || selected) ? '#f59e0b' : 'transparent'}
              color={i <= (hovered || selected) ? '#f59e0b' : '#2d3a52'}
              strokeWidth={1.5}
              style={{ transition: 'all 0.15s', transform: i <= (hovered || selected) ? 'scale(1.15)' : 'scale(1)' }}
            />
          </button>
        ))}
      </div>

      {/* Label */}
      {(hovered || selected) > 0 && (
        <p style={styles.label}>{labels[hovered || selected]}</p>
      )}

      {/* Feedback text */}
      {selected > 0 && (
        <textarea
          className="form-input"
          style={{ marginTop: 10, resize: 'none', fontSize: '0.82rem' }}
          rows={3}
          placeholder="Optional: Tell us more about your experience..."
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
        />
      )}

      {error && <p style={styles.error}>{error}</p>}

      {selected > 0 && (
        <button className="btn btn-primary"
          style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
          onClick={handleSubmit} disabled={submitting}>
          {submitting
            ? <><div className="spinner" style={{ width: 16, height: 16 }} />Submitting...</>
            : '⭐ Submit Rating'}
        </button>
      )}
    </div>
  )
}

const styles = {
  box: {
    background: 'rgba(245,158,11,0.06)',
    border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: 12, padding: '18px',
  },
  title: { fontSize: '0.9rem', fontWeight: 700, color: '#e8edf5', fontFamily: 'var(--font-heading)' },
  sub: { fontSize: '0.78rem', color: '#8b9cc4', marginTop: 4 },
  starBtn: {
    background: 'transparent', border: 'none',
    cursor: 'pointer', padding: 2, display: 'flex',
  },
  label: {
    fontSize: '0.8rem', fontWeight: 600,
    color: '#f59e0b', marginTop: 2,
  },
  feedbackText: {
    fontSize: '0.82rem', color: '#8b9cc4',
    fontStyle: 'italic', marginTop: 6,
  },
  thankyou: { fontSize: '0.8rem', color: '#22c55e', marginTop: 6 },
  error: { fontSize: '0.8rem', color: '#ef4444', marginTop: 8 },
}
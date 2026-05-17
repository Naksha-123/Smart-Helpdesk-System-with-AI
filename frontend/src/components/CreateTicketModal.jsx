import React, { useState } from 'react'
import { X, Ticket, Sparkles } from 'lucide-react'
import api from '../api/axios'

const categories = ['Technical', 'Billing', 'General', 'Account', 'Feature Request']
const priorities = ['Low', 'Medium', 'High', 'Urgent']

export default function CreateTicketModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'Technical', priority: 'Medium' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.'); return
    }
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/tickets', form)
      onCreated(data.ticket)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} className="animate-fade">
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={styles.iconBox}><Ticket size={18} color="#4f8ef7" /></div>
            <div>
              <h2 style={styles.title}>New Support Ticket</h2>
              <p style={styles.subtitle}>AI will respond instantly</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Issue Title</label>
            <input
              className="form-input"
              placeholder="Brief description of your issue..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Category + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-input"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
              >
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={5}
              placeholder="Describe your issue in detail. The more info you provide, the better our AI can help..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ resize: 'vertical', minHeight: 120 }}
            />
          </div>

          {/* AI hint */}
          <div style={styles.aiHint}>
            <Sparkles size={14} color="#4f8ef7" />
            <span>Our AI assistant will analyze your ticket and provide an instant response.</span>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Submitting...</> : <><Ticket size={16} />Submit Ticket</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 24,
  },
  modal: {
    background: '#111623',
    border: '1px solid #1e2a42',
    borderRadius: 16,
    width: '100%', maxWidth: 560,
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #1e2a42',
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 10,
    background: 'rgba(79,142,247,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: '1rem', fontWeight: 700, color: '#e8edf5', fontFamily: 'var(--font-heading)' },
  subtitle: { fontSize: '0.78rem', color: '#8b9cc4' },
  closeBtn: {
    background: 'transparent', border: '1px solid #1e2a42', borderRadius: 8,
    color: '#8b9cc4', padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center',
  },
  form: { padding: 24, display: 'flex', flexDirection: 'column', gap: 18 },
  error: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8, padding: '12px 16px', fontSize: '0.85rem', color: '#ef4444',
  },
  aiHint: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)',
    borderRadius: 8, padding: '10px 14px',
    fontSize: '0.8rem', color: '#8b9cc4',
  },
  actions: { display: 'flex', gap: 12, justifyContent: 'flex-end' },
}
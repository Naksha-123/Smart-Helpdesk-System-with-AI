import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff, Mail, Lock, User, Shield } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')
    try {
      await register(form.name, form.email, form.password, form.role)
      navigate(form.role !== 'user' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.card} className="animate-fade">
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}><Zap size={22} color="#fff" /></div>
          <h1 style={styles.logoText}>SmartDesk</h1>
        </div>

        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.subtitle}>Join the AI-powered helpdesk platform</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={styles.inputWrap}>
              <User size={15} style={styles.inputIcon} />
              <input className="form-input" style={{ paddingLeft: 40 }}
                placeholder="John Doe" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={styles.inputWrap}>
              <Mail size={15} style={styles.inputIcon} />
              <input className="form-input" style={{ paddingLeft: 40 }}
                type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={styles.inputWrap}>
              <Lock size={15} style={styles.inputIcon} />
              <input className="form-input" style={{ paddingLeft: 40, paddingRight: 40 }}
                type={showPw ? 'text' : 'password'} placeholder="Min 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
              <button type="button" onClick={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div style={styles.roleGrid}>
              {[
                { value: 'user', label: 'User', desc: 'Submit & track tickets' },
                { value: 'agent', label: 'Agent', desc: 'Manage & resolve tickets' },
                { value: 'admin', label: 'Admin', desc: 'Full system access' },
              ].map(r => (
                <button
                  key={r.value} type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  style={{
                    ...styles.roleBtn,
                    ...(form.role === r.value ? styles.roleBtnActive : {}),
                  }}
                >
                  <Shield size={13} color={form.role === r.value ? '#4f8ef7' : '#4a5568'} />
                  <span style={styles.roleLabel}>{r.label}</span>
                  <span style={styles.roleDesc}>{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 4 }}
            disabled={loading}>
            {loading
              ? <><div className="spinner" style={{ width: 18, height: 18 }} />Creating account...</>
              : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 24, position: 'relative',
  },
  bg: {
    position: 'fixed', inset: 0, zIndex: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(168,85,247,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1,
    background: '#111623', border: '1px solid #1e2a42',
    borderRadius: 20, padding: '36px',
    width: '100%', maxWidth: 440,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  logoArea: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: 'linear-gradient(135deg, #4f8ef7, #a855f7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'var(--font-heading)', fontSize: '1.3rem',
    fontWeight: 800, color: '#e8edf5',
  },
  title: { fontSize: '1.25rem', fontWeight: 700, color: '#e8edf5', fontFamily: 'var(--font-heading)', marginBottom: 6 },
  subtitle: { fontSize: '0.85rem', color: '#8b9cc4', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  error: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8, padding: '12px', fontSize: '0.85rem', color: '#ef4444',
  },
  inputWrap: { position: 'relative' },
  inputIcon: {
    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
    color: '#4a5568', pointerEvents: 'none',
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'transparent', border: 'none', color: '#4a5568', cursor: 'pointer',
    display: 'flex', alignItems: 'center',
  },
  roleGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  roleBtn: {
    background: '#0a0d14', border: '1px solid #1e2a42', borderRadius: 10,
    padding: '10px 8px', cursor: 'pointer', display: 'flex',
    flexDirection: 'column', alignItems: 'center', gap: 4,
    transition: 'all 0.15s',
  },
  roleBtnActive: {
    background: 'rgba(79,142,247,0.08)',
    border: '1px solid rgba(79,142,247,0.4)',
  },
  roleLabel: { fontSize: '0.82rem', fontWeight: 600, color: '#e8edf5' },
  roleDesc: { fontSize: '0.68rem', color: '#4a5568', textAlign: 'center', lineHeight: 1.3 },
  footer: { textAlign: 'center', fontSize: '0.85rem', color: '#8b9cc4', marginTop: 20 },
  link: { color: '#4f8ef7', fontWeight: 600 },
}
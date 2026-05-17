import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await login(form.email, form.password)
      navigate(data.user.role !== 'user' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.card} className="animate-fade">
        {/* Logo */}
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}><Zap size={24} color="#fff" /></div>
          <h1 style={styles.logoText}>SmartDesk</h1>
          <p style={styles.tagline}>AI-Powered Helpdesk System</p>
        </div>

        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={styles.inputWrap}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                className="form-input"
                style={{ paddingLeft: 42 }}
                type="email" placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                className="form-input"
                style={{ paddingLeft: 42, paddingRight: 42 }}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} />Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Create one</Link>
        </p>

        {/* Demo hint */}
        <div style={styles.demo}>
          <p style={{ fontSize: '0.78rem', color: '#4a5568', marginBottom: 4, fontWeight: 600 }}>DEMO ACCOUNTS</p>
          <p style={{ fontSize: '0.78rem', color: '#8b9cc4' }}>Register with role: <code style={styles.code}>admin</code> or <code style={styles.code}>agent</code> for elevated access</p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24, position: 'relative',
  },
  bg: {
    position: 'fixed', inset: 0, zIndex: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(79,142,247,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1,
    background: '#111623', border: '1px solid #1e2a42',
    borderRadius: 20, padding: '40px 36px',
    width: '100%', maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  logoArea: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    marginBottom: 32, gap: 8,
  },
  logoIcon: {
    width: 56, height: 56, borderRadius: 16,
    background: 'linear-gradient(135deg, #4f8ef7, #a855f7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(79,142,247,0.4)',
  },
  logoText: {
    fontFamily: 'var(--font-heading)', fontSize: '1.5rem',
    fontWeight: 800, color: '#e8edf5', letterSpacing: '-0.03em',
  },
  tagline: { fontSize: '0.8rem', color: '#8b9cc4' },
  title: { fontSize: '1.3rem', fontWeight: 700, color: '#e8edf5', fontFamily: 'var(--font-heading)', marginBottom: 6 },
  subtitle: { fontSize: '0.85rem', color: '#8b9cc4', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  error: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8, padding: '12px', fontSize: '0.85rem', color: '#ef4444',
  },
  inputWrap: { position: 'relative' },
  inputIcon: {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    color: '#4a5568', pointerEvents: 'none',
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'transparent', border: 'none', color: '#4a5568', cursor: 'pointer',
    display: 'flex', alignItems: 'center',
  },
  footer: { textAlign: 'center', fontSize: '0.85rem', color: '#8b9cc4', marginTop: 20 },
  link: { color: '#4f8ef7', fontWeight: 600, textDecoration: 'none' },
  demo: {
    marginTop: 20, padding: '12px 16px',
    background: 'rgba(255,255,255,0.02)', border: '1px solid #1e2a42', borderRadius: 8,
  },
  code: {
    background: '#1e2a42', color: '#4f8ef7', padding: '2px 6px',
    borderRadius: 4, fontFamily: 'monospace', fontSize: '0.75rem',
  },
}
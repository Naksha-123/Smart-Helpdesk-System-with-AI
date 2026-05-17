import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import TicketCard from '../components/TicketCard'
import CreateTicketModal from '../components/CreateTicketModal'
import { Plus, Search, Filter, Ticket, CheckCircle, Clock, AlertCircle, TrendingUp, Sparkles } from 'lucide-react'

const STATUS_OPTIONS = ['', 'Open', 'In Progress', 'Resolved', 'Closed']
const PRIORITY_OPTIONS = ['', 'Low', 'Medium', 'High', 'Urgent']
const CATEGORY_OPTIONS = ['', 'Technical', 'Billing', 'General', 'Account', 'Feature Request']

export default function Dashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' })
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  const fetchTickets = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 9, ...filters }
      if (search) params.search = search
      const { data } = await api.get('/tickets', { params })
      setTickets(data.tickets)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters, search])

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/tickets/stats')
      setStats(data.stats)
    } catch {}
  }, [])

  useEffect(() => { fetchTickets(1); fetchStats() }, [fetchTickets, fetchStats])

  const handleTicketCreated = (ticket) => {
    setTickets(prev => [ticket, ...prev])
    fetchStats()
  }

  const getStatCount = (key) => {
    if (!stats?.byStatus) return 0
    return stats.byStatus.find(s => s._id === key)?.count || 0
  }

  const statCards = [
    { label: 'Total Tickets', value: stats?.total || 0, icon: Ticket, color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)' },
    { label: 'Open', value: getStatCount('Open'), icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'In Progress', value: getStatCount('In Progress'), icon: Clock, color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
    { label: 'Resolved', value: getStatCount('Resolved'), icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  ]

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div>
            <div style={styles.greeting}>
              <Sparkles size={16} color="#4f8ef7" />
              <span>AI-Powered Support</span>
            </div>
            <h1 style={styles.heroTitle}>
              Hello, {user?.name?.split(' ')[0]}
            </h1>
            <p style={styles.heroSub}>
              {user?.role === 'user'
                ? 'Submit a ticket and get an instant AI-powered response.'
                : `Managing helpdesk as ${user?.role}. ${stats?.total || 0} total tickets.`}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
            <Plus size={18} />New Ticket
          </button>
        </div>
      </div>

      <div style={styles.container}>
        {/* Stats */}
        <div style={styles.statsGrid}>
          {statCards.map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: s.bg }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div>
                <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={styles.filtersRow}>
          <div style={styles.searchWrap}>
            <Search size={15} style={styles.searchIcon} />
            <input
              className="form-input"
              style={{ paddingLeft: 38, maxWidth: 300 }}
              placeholder="Search tickets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchTickets(1)}
            />
          </div>
          <div style={styles.filterSelects}>
            <Filter size={15} color="#4a5568" />
            {[
              { key: 'status', opts: STATUS_OPTIONS, ph: 'Status' },
              { key: 'priority', opts: PRIORITY_OPTIONS, ph: 'Priority' },
              { key: 'category', opts: CATEGORY_OPTIONS, ph: 'Category' },
            ].map(({ key, opts, ph }) => (
              <select
                key={key}
                className="form-input"
                style={{ width: 'auto', minWidth: 120 }}
                value={filters[key]}
                onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
              >
                <option value="">{ph}</option>
                {opts.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
          </div>
        </div>

        {/* Ticket Grid */}
        {loading ? (
          <div style={styles.loader}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
            <p style={{ color: '#8b9cc4', marginTop: 12 }}>Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div style={styles.empty}>
            <Ticket size={48} color="#1e2a42" />
            <h3 style={{ color: '#8b9cc4', fontFamily: 'var(--font-heading)', marginTop: 12 }}>No tickets found</h3>
            <p style={{ color: '#4a5568', fontSize: '0.85rem', marginTop: 4 }}>
              {search || Object.values(filters).some(Boolean)
                ? 'Try adjusting your filters'
                : 'Click "New Ticket" to submit your first support request'}
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: 16 }}>
              <Plus size={16} />New Ticket
            </button>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {tickets.map(ticket => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={styles.pagination}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => fetchTickets(p)}
                    style={{
                      ...styles.pageBtn,
                      ...(p === pagination.page ? styles.pageBtnActive : {}),
                    }}
                  >{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <CreateTicketModal
          onClose={() => setShowModal(false)}
          onCreated={handleTicketCreated}
        />
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0d14' },
  hero: {
    background: 'linear-gradient(135deg, rgba(79,142,247,0.08) 0%, rgba(168,85,247,0.06) 100%)',
    borderBottom: '1px solid #1e2a42',
    padding: '40px 24px',
  },
  heroContent: {
    maxWidth: 1280, margin: '0 auto',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    flexWrap: 'wrap', gap: 20,
  },
  greeting: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: '0.78rem', fontWeight: 600, color: '#4f8ef7',
    background: 'rgba(79,142,247,0.12)', padding: '4px 12px', borderRadius: 20,
    marginBottom: 10, letterSpacing: '0.04em',
  },
  heroTitle: {
    fontFamily: 'var(--font-heading)', fontSize: '2rem',
    fontWeight: 800, color: '#e8edf5', marginBottom: 8,
  },
  heroSub: { color: '#8b9cc4', fontSize: '0.9rem', maxWidth: 480 },
  container: { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 },
  statCard: {
    background: '#111623', border: '1px solid #1e2a42', borderRadius: 12,
    padding: '20px', display: 'flex', alignItems: 'center', gap: 16,
  },
  statIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 },
  statLabel: { fontSize: '0.78rem', color: '#8b9cc4', marginTop: 4, fontWeight: 500 },
  filtersRow: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
    flexWrap: 'wrap',
  },
  searchWrap: { position: 'relative', flex: 1, minWidth: 200 },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5568' },
  filterSelects: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', textAlign: 'center' },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 32 },
  pageBtn: {
    width: 36, height: 36, borderRadius: 8, background: '#111623',
    border: '1px solid #1e2a42', color: '#8b9cc4', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 500,
  },
  pageBtnActive: { background: 'rgba(79,142,247,0.2)', border: '1px solid #4f8ef7', color: '#4f8ef7' },
}
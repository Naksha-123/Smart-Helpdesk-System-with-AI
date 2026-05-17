import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts'
import {
  BarChart2, Users, Ticket, CheckCircle, Clock,
  AlertCircle, Shield, TrendingUp, Search, Eye,
  Trash2, RefreshCw, Star
} from 'lucide-react'

const statusClass = {
  'Open': 'badge-open', 'In Progress': 'badge-progress',
  'Resolved': 'badge-resolved', 'Closed': 'badge-closed'
}
const priorityClass = {
  'Low': 'badge-low', 'Medium': 'badge-medium',
  'High': 'badge-high', 'Urgent': 'badge-urgent'
}
const STATUS_COLORS = {
  'Open': '#f59e0b', 'In Progress': '#a855f7',
  'Resolved': '#22c55e', 'Closed': '#64748b'
}
const PRIORITY_COLORS = {
  'Low': '#22c55e', 'Medium': '#f59e0b',
  'High': '#ef4444', 'Urgent': '#a855f7'
}
const CATEGORY_COLORS = {
  'Technical': '#4f8ef7', 'Billing': '#f59e0b',
  'General': '#22c55e', 'Account': '#a855f7',
  'Feature Request': '#ec4899'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#161c2d', border: '1px solid #1e2a42', borderRadius: 8, padding: '10px 14px' }}>
        {label && <p style={{ color: '#8b9cc4', fontSize: '0.78rem', marginBottom: 4 }}>{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#e8edf5', fontSize: '0.85rem', fontWeight: 600 }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const EmptyChart = () => (
  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5568', fontSize: '0.85rem' }}>
    No data yet — submit some tickets first
  </div>
)

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [deleting, setDeleting] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        api.get('/tickets/stats'),
        api.get('/tickets', { params: { page, limit: 12, status: statusFilter, search } })
      ])
      setStats(statsRes.data.stats)
      setTickets(ticketsRes.data.tickets)
      setPagination(ticketsRes.data.pagination)
      if (user?.role === 'admin') {
        const usersRes = await api.get('/auth/users')
        setUsers(usersRes.data.users)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [page, statusFilter, search, user])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Delete this ticket? This cannot be undone.')) return
    setDeleting(ticketId)
    try {
      await api.delete(`/tickets/${ticketId}`)
      setTickets(prev => prev.filter(t => t._id !== ticketId))
    } catch { alert('Delete failed.') }
    finally { setDeleting(null) }
  }

  const getCount = (arr, key) => arr?.find(s => s._id === key)?.count || 0

  const statusPieData = stats?.byStatus?.map(s => ({
    name: s._id, value: s.count, color: STATUS_COLORS[s._id] || '#8b9cc4'
  })) || []

  const priorityPieData = stats?.byPriority?.map(p => ({
    name: p._id, value: p.count, color: PRIORITY_COLORS[p._id] || '#8b9cc4'
  })) || []

  const categoryBarData = stats?.byCategory?.map(c => ({
    name: c._id, Tickets: c.count, fill: CATEGORY_COLORS[c._id] || '#8b9cc4'
  })) || []

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      fullDate: d.toDateString(),
      Tickets: 0
    }
  })
  tickets.forEach(ticket => {
    const ticketDate = new Date(ticket.createdAt).toDateString()
    const day = last7Days.find(d => d.fullDate === ticketDate)
    if (day) day.Tickets++
  })

  const overviewCards = stats ? [
    { label: 'Total Tickets', value: stats.total, icon: Ticket, color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)' },
    { label: 'Open', value: getCount(stats.byStatus, 'Open'), icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'In Progress', value: getCount(stats.byStatus, 'In Progress'), icon: Clock, color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
    { label: 'Resolved', value: getCount(stats.byStatus, 'Resolved'), icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    { label: 'Closed', value: getCount(stats.byStatus, 'Closed'), icon: Shield, color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
    { label: 'Resolved Today', value: stats.resolvedToday, icon: TrendingUp, color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
    ...(user?.role === 'admin' ? [{ label: 'Total Users', value: users.length, icon: Users, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' }] : []),
  ] : []

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'charts', label: 'Charts', icon: TrendingUp },
    { id: 'tickets', label: 'All Tickets', icon: Ticket },
    ...(user?.role === 'admin' ? [{ id: 'users', label: 'Users', icon: Users }] : []),
  ]

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              <Shield size={22} color="#4f8ef7" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />
              Admin Panel
            </h1>
            <p style={styles.subtitle}>Manage tickets, users, and system analytics</p>
          </div>
          <button onClick={fetchData} className="btn btn-ghost"><RefreshCw size={15} />Refresh</button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ ...styles.tab, ...(activeTab === id ? styles.tabActive : {}) }}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="animate-fade">
            <div style={styles.statsGrid}>
              {overviewCards.map(card => (
                <div key={card.label} style={styles.statCard}>
                  <div style={{ ...styles.statIcon, background: card.bg }}>
                    <card.icon size={20} color={card.color} />
                  </div>
                  <div>
                    <div style={{ ...styles.statValue, color: card.color }}>{card.value}</div>
                    <div style={styles.statLabel}>{card.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Tickets by Status</h3>
                {statusPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                        dataKey="value" labelLine={false} label={renderCustomLabel}>
                        {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={v => <span style={{ color: '#8b9cc4', fontSize: '0.8rem' }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Tickets by Priority</h3>
                {priorityPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={priorityPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                        dataKey="value" labelLine={false} label={renderCustomLabel}>
                        {priorityPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={v => <span style={{ color: '#8b9cc4', fontSize: '0.8rem' }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
            </div>
          </div>
        )}

        {/* ── CHARTS TAB ── */}
        {activeTab === 'charts' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Pie charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>🟡 Tickets by Status</h3>
                <p style={styles.chartSub}>Distribution across all ticket statuses</p>
                {statusPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={110}
                        dataKey="value" labelLine={false} label={renderCustomLabel}>
                        {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={v => <span style={{ color: '#8b9cc4', fontSize: '0.8rem' }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>🔴 Tickets by Priority</h3>
                <p style={styles.chartSub}>Urgency levels across all tickets</p>
                {priorityPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={priorityPieData} cx="50%" cy="50%" outerRadius={110}
                        dataKey="value" labelLine={false} label={renderCustomLabel}>
                        {priorityPieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={v => <span style={{ color: '#8b9cc4', fontSize: '0.8rem' }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
            </div>

            {/* Bar chart: by category */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>📊 Tickets by Category</h3>
              <p style={styles.chartSub}>Number of tickets per support category</p>
              {categoryBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={categoryBarData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2a42" />
                    <XAxis dataKey="name" tick={{ fill: '#8b9cc4', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8b9cc4', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,142,247,0.06)' }} />
                    <Bar dataKey="Tickets" radius={[6, 6, 0, 0]}>
                      {categoryBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>

            {/* Area chart: tickets over last 7 days */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>📈 Tickets Over Last 7 Days</h3>
              <p style={styles.chartSub}>Daily ticket submission trend</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={last7Days} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="ticketGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a42" />
                  <XAxis dataKey="date" tick={{ fill: '#8b9cc4', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b9cc4', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4f8ef7', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="Tickets" stroke="#4f8ef7" strokeWidth={2.5}
                    fill="url(#ticketGradient)"
                    dot={{ fill: '#4f8ef7', r: 4 }}
                    activeDot={{ r: 6, fill: '#4f8ef7', stroke: '#111623', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Summary KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { label: 'Resolution Rate', value: stats?.total > 0 ? `${Math.round((getCount(stats?.byStatus, 'Resolved') / stats?.total) * 100)}%` : '0%', color: '#22c55e', desc: 'Tickets resolved' },
                { label: 'Open Rate', value: stats?.total > 0 ? `${Math.round((getCount(stats?.byStatus, 'Open') / stats?.total) * 100)}%` : '0%', color: '#f59e0b', desc: 'Tickets still open' },
                { label: 'In Progress', value: stats?.total > 0 ? `${Math.round((getCount(stats?.byStatus, 'In Progress') / stats?.total) * 100)}%` : '0%', color: '#a855f7', desc: 'Being worked on' },
                { label: 'Resolved Today', value: stats?.resolvedToday || 0, color: '#ec4899', desc: 'Tickets closed today' },
              ].map(item => (
                <div key={item.label} style={{ ...styles.chartCard, textAlign: 'center', padding: '24px 16px' }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: item.color, fontFamily: 'var(--font-heading)' }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e8edf5', marginTop: 6 }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#4a5568', marginTop: 4 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TICKETS TAB ── */}
        {activeTab === 'tickets' && (
          <div className="animate-fade">
            <div style={styles.filtersRow}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5568' }} />
                <input className="form-input" style={{ paddingLeft: 36 }}
                  placeholder="Search by title or ID..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="form-input" style={{ width: 'auto', minWidth: 140 }}
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <div className="spinner" style={{ width: 36, height: 36 }} />
              </div>
            ) : (
              <>
                <div style={styles.table}>
                  <div style={styles.tableHead}>
                    {['Ticket ID', 'Title', 'Category', 'Status', 'Priority', 'Created By', 'Rating', 'Date', 'Actions'].map(h => (
                      <div key={h} style={styles.th}>{h}</div>
                    ))}
                  </div>
                  {tickets.map(ticket => (
                    <div key={ticket._id} style={styles.tableRow}>
                      <div style={styles.td}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#4a5568', fontWeight: 700 }}>
                          {ticket.ticketId}
                        </span>
                      </div>
                      <div style={{ ...styles.td, maxWidth: 200 }}>
                        <span style={{ fontSize: '0.85rem', color: '#e8edf5', fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.title}
                        </span>
                      </div>
                      <div style={styles.td}><span style={{ fontSize: '0.78rem', color: '#8b9cc4' }}>{ticket.category}</span></div>
                      <div style={styles.td}><span className={`badge ${statusClass[ticket.status]}`}>{ticket.status}</span></div>
                      <div style={styles.td}><span className={`badge ${priorityClass[ticket.priority]}`}>{ticket.priority}</span></div>
                      <div style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <img src={ticket.createdBy?.avatar} alt="" style={{ width: 22, height: 22, borderRadius: '50%' }} />
                          <span style={{ fontSize: '0.78rem', color: '#8b9cc4' }}>{ticket.createdBy?.name}</span>
                        </div>
                      </div>
                      <div style={styles.td}>
  {ticket.rating?.score ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Star size={13} fill="#f59e0b" color="#f59e0b" />
      <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 600 }}>
        {ticket.rating.score}/5
      </span>
    </div>
  ) : (
    <span style={{ fontSize: '0.75rem', color: '#4a5568' }}>—</span>
  )}
</div>
<div style={styles.td}>
  <span style={{ fontSize: '0.78rem', color: '#4a5568' }}>
    {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ ...styles.td, display: 'flex', gap: 6 }}>
                        <button onClick={() => navigate(`/tickets/${ticket._id}`)}
                          className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                          <Eye size={13} />View
                        </button>
                        {user?.role === 'admin' && (
                          <button onClick={() => handleDelete(ticket._id)} disabled={deleting === ticket._id}
                            style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            {deleting === ticket._id ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <Trash2 size={13} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#4a5568' }}>No tickets found.</div>
                  )}
                </div>
                {pagination.pages > 1 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'center' }}>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)} style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: p === page ? 'rgba(79,142,247,0.2)' : '#111623',
                        border: `1px solid ${p === page ? '#4f8ef7' : '#1e2a42'}`,
                        color: p === page ? '#4f8ef7' : '#8b9cc4', cursor: 'pointer', fontSize: '0.82rem',
                      }}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && user?.role === 'admin' && (
          <div className="animate-fade">
            <div style={styles.usersGrid}>
              {users.map(u => (
                <div key={u._id} style={styles.userCard}>
                  <img src={u.avatar} alt={u.name} style={styles.userAvatar} />
                  <div style={{ flex: 1 }}>
                    <div style={styles.userName}>{u.name}</div>
                    <div style={styles.userEmail}>{u.email}</div>
                    <div style={{ marginTop: 8 }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-urgent' : u.role === 'agent' ? 'badge-progress' : 'badge-open'}`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                  <div style={styles.userJoined}>Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0d14', paddingBottom: 60 },
  container: { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 },
  title: { fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: '#e8edf5', marginBottom: 6 },
  subtitle: { color: '#8b9cc4', fontSize: '0.88rem' },
  tabs: { display: 'flex', gap: 4, marginBottom: 28, background: '#111623', border: '1px solid #1e2a42', borderRadius: 12, padding: 4, width: 'fit-content', flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500, color: '#8b9cc4', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' },
  tabActive: { background: 'rgba(79,142,247,0.15)', color: '#4f8ef7' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 },
  statCard: { background: '#111623', border: '1px solid #1e2a42', borderRadius: 12, padding: '18px', display: 'flex', alignItems: 'center', gap: 14 },
  statIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: '1.7rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 },
  statLabel: { fontSize: '0.75rem', color: '#8b9cc4', marginTop: 4 },
  chartCard: { background: '#111623', border: '1px solid #1e2a42', borderRadius: 14, padding: '22px' },
  chartTitle: { fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, color: '#e8edf5', marginBottom: 4 },
  chartSub: { fontSize: '0.78rem', color: '#4a5568', marginBottom: 16 },
  filtersRow: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  table: { background: '#111623', border: '1px solid #1e2a42', borderRadius: 12, overflow: 'auto' },
  tableHead: { display: 'grid', gridTemplateColumns: '100px 1fr 110px 110px 90px 130px 80px 90px 110px', background: '#0a0d14', borderBottom: '1px solid #1e2a42', padding: '10px 16px' },
  th: { fontSize: '0.7rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em' },
  tableRow: { display: 'grid', gridTemplateColumns: '100px 1fr 110px 110px 90px 130px 80px 90px 110px', padding: '12px 16px', borderBottom: '1px solid #1e2a42', alignItems: 'center' },
  td: { fontSize: '0.82rem', color: '#e8edf5', paddingRight: 8 },
  usersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  userCard: { background: '#111623', border: '1px solid #1e2a42', borderRadius: 12, padding: '20px', display: 'flex', gap: 14, alignItems: 'flex-start' },
  userAvatar: { width: 44, height: 44, borderRadius: '50%', border: '2px solid #1e2a42', flexShrink: 0 },
  userName: { fontSize: '0.9rem', fontWeight: 600, color: '#e8edf5' },
  userEmail: { fontSize: '0.78rem', color: '#8b9cc4', marginTop: 2 },
  userJoined: { fontSize: '0.7rem', color: '#4a5568', whiteSpace: 'nowrap' },
}
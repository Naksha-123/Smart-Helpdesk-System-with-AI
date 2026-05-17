import React, { useState } from 'react'
import NotificationBell from './NotificationBell'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Ticket, Shield, LogOut, Menu, X, Zap } from 'lucide-react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => { logout(); navigate('/login') }
  const isActive = (path) => location.pathname === path

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(user?.role !== 'user' ? [{ to: '/admin', label: 'Admin Panel', icon: Shield }] : []),
  ]

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/dashboard" style={styles.logo}>
          <div style={styles.logoIcon}><Zap size={16} color="#fff" /></div>
          <span style={styles.logoText}>SmartDesk</span>
        </Link>

        {/* Desktop Nav */}
        <div style={styles.links}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} style={{ ...styles.link, ...(isActive(to) ? styles.linkActive : {}) }}>
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* User */}
        <div style={styles.userArea}>
           <NotificationBell />
           <button
  onClick={toggleTheme}
  style={styles.themeBtn}
  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
>
  {theme === 'dark'
    ? <Sun size={16} color="#f59e0b" />
    : <Moon size={16} color="#4f8ef7" />}
</button>
          <img src={user?.avatar} alt={user?.name} style={styles.avatar} />
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.name}</span>
            <span style={styles.userRole}>{user?.role}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
            <LogOut size={16} />
          </button>
        </div>

        {/* Mobile toggle */}
        <button style={styles.mobileToggle} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              <Icon size={16} />{label}
            </Link>
          ))}
          <button onClick={handleLogout} style={styles.mobileLinkDanger}>
            <LogOut size={16} />Logout
          </button>
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: {
    background: 'rgba(10,13,20,0.9)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid #1e2a42',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 24px',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    marginRight: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #4f8ef7, #a855f7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: '1.1rem',
    color: '#e8edf5',
    letterSpacing: '-0.02em',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'all 0.15s',
  },
  linkActive: {
    background: 'rgba(79,142,247,0.15)',
    color: '#4f8ef7',
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginLeft: 'auto',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '2px solid #1e2a42',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  userRole: {
    fontSize: '0.68rem',
    color: 'var(--text-secondary)',
    textTransform: 'capitalize',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-secondary)',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.15s',
  },
  mobileToggle: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    color: '#8b9cc4',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  mobileMenu: {
    padding: '12px 24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    borderTop: '1px solid #1e2a42',
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: '0.9rem',
    color: '#8b9cc4',
    textDecoration: 'none',
  },
  mobileLinkDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: '0.9rem',
    color: '#ef4444',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  themeBtn: {
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '6px 8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s',
},
}
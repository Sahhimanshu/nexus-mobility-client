'use client'
import { Bell, Search, ChevronDown } from 'lucide-react'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="topbar" style={{
      height: 66,
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 19,
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
        }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</p>
        )}
      </div>

      {/* Global search */}
      <div style={{ position: 'relative' }} className="hide-mobile">
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="nx-input"
          placeholder="Search anything..."
          style={{ width: 240, paddingLeft: 34, fontSize: 13, height: 38, padding: '0 14px 0 34px' }}
        />
      </div>

      {/* Notifications */}
      <div style={{ position: 'relative', cursor: 'pointer' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: '#EFF3FB',
          border: '1.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = '#DBEAFE')}
          onMouseLeave={e => (e.currentTarget.style.background = '#EFF3FB')}
        >
          <Bell size={16} color="var(--text-secondary)" />
        </div>
        <span style={{
          position: 'absolute', top: -4, right: -4,
          width: 18, height: 18, borderRadius: '50%',
          background: 'linear-gradient(135deg, #DC2626, #EF4444)',
          fontSize: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
          border: '2px solid white',
        }}>3</span>
      </div>

      {/* User */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 12px',
        borderRadius: 10,
        background: '#F8FAFF',
        border: '1.5px solid var(--border)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: 'white',
        }}>SA</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }} className="hide-mobile">Super Admin</span>
        <ChevronDown size={13} color="var(--text-muted)" />
      </div>

      {/* Actions */}
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </header>
  )
}

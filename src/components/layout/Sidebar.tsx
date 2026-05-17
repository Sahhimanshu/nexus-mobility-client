'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Handshake, Users, BookOpen,
  Globe2, FileText, Settings, LogOut,
  CalendarDays, Newspaper, Building2, ChevronRight,
  Sparkles, MapPin
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/', badge: null },
  { icon: Handshake, label: 'Partnerships', href: '/partnerships', badge: { text: '12', color: '#FEF3C7', textColor: '#92400E' } },
  { icon: Users, label: 'Students', href: '/students', badge: null },
  { icon: BookOpen, label: 'Programs', href: '/programs', badge: null },
  { icon: Building2, label: 'University Visits', href: '/visits', badge: null },
  { icon: Globe2, label: 'Countries', href: '/countries', badge: null },
  { icon: FileText, label: 'Documents', href: '/documents', badge: null },
  { icon: CalendarDays, label: 'Events', href: '/events', badge: { text: '2', color: '#DCFCE7', textColor: '#166534' } },
  { icon: Newspaper, label: 'Global News', href: '/news', badge: null },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar-glow sidebar-desktop" style={{
      width: 248,
      minHeight: '100vh',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      padding: '0 10px',
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 8px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
            flexShrink: 0,
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800,
              color: '#FFFFFF', letterSpacing: '-0.02em',
            }}>Intersphere</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: -1 }}>Mobility Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, marginTop: 14, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px 8px', fontWeight: 700 }}>Navigation</div>
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
              <item.icon size={15} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: item.badge.color,
                  color: item.badge.textColor,
                  borderRadius: 5, padding: '2px 6px',
                  lineHeight: 1.4,
                }}>{item.badge.text}</span>
              )}
              {active && !item.badge && (
                <ChevronRight size={13} style={{ opacity: 0.5 }} />
              )}
            </Link>
          )
        })}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '14px 8px' }} />
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px 8px', fontWeight: 700 }}>System</div>
        <Link href="/settings" className="nav-item">
          <Settings size={15} />
          <span style={{ flex: 1 }}>Settings</span>
          <ChevronRight size={13} style={{ opacity: 0.5 }} />
        </Link>
      </nav>

      {/* User Profile */}
      <div style={{
        padding: '12px', margin: '8px 0 12px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        transition: 'background 0.2s',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: 'white', flexShrink: 0,
        }}>SA</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Super Admin</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
            <MapPin size={9} /> Global Mobility Office
          </div>
        </div>
        <LogOut size={13} color="rgba(255,255,255,0.3)" />
      </div>
    </aside>
  )
}

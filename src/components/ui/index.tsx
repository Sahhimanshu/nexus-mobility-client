'use client'
import { ReactNode } from 'react'

// ── Metric Card ──────────────────────
interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  iconBg?: string
  trend?: string
  trendUp?: boolean
}

export function MetricCard({ label, value, sub, icon, iconBg, trend, trendUp }: MetricCardProps) {
  return (
    <div className="glass-card metric-card" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{label}</p>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{value}</p>
          {sub && <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 7 }}>{sub}</p>}
          {trend && (
            <p style={{ fontSize: 12, marginTop: 8, color: trendUp ? '#059669' : '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              {trendUp ? '▲' : '▼'} {trend}
            </p>
          )}
        </div>
        {icon && (
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: iconBg || 'rgba(37,99,235,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Status Badge ──────────────────────
export function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Active': 'badge-active',
    'Expiring': 'badge-expiring',
    'Expired': 'badge-expired',
    'On Exchange': 'badge-exchange',
    'Approved': 'badge-approved',
    'Completed': 'badge-active',
    'Pending': 'badge-expiring',
    'Verified': 'badge-verified',
    'Upcoming': 'badge-exchange',
    'This Week': 'badge-approved',
    'Delegation': 'badge-exchange',
    'Conference': 'badge-exchange',
    'Online': 'badge-approved',
  }
  return (
    <span className={map[status] || 'badge-expiring'} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11.5, fontWeight: 600, padding: '3px 10px',
      borderRadius: 6, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', opacity: 0.9, flexShrink: 0 }} />
      {status}
    </span>
  )
}

// ── Section Card ──────────────────────
export function SectionCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      <div style={{
        padding: '16px 22px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#FAFBFF',
      }}>
        <h2 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

// ── Progress Bar ──────────────────────
export function ProgressBar({ value, max, color = '#2563EB' }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 7, background: '#EFF3FB', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.7s ease' }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 34, textAlign: 'right', fontWeight: 600 }}>{pct}%</span>
    </div>
  )
}

// ── Empty State ──────────────────────
export function EmptyState({ icon, message }: { icon: ReactNode; message: string }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.35 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{message}</p>
    </div>
  )
}

// ── Stat Mini Card ──────────────────────
export function StatMini({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 4, height: 38, borderRadius: 4, background: color, flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{label}</p>
      </div>
    </div>
  )
}

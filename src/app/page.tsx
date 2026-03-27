'use client'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { MetricCard, SectionCard, Badge } from '@/components/ui'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  Handshake, FileCheck, AlertTriangle, Users, Download,
  ArrowRight, Globe, ExternalLink, TrendingUp, CalendarDays,
  Newspaper, Bell, Clock
} from 'lucide-react'
import {
  dashboardStats, studentsByDestination, mobilityTrend,
  partnershipsByCountry, partnerships
} from '@/lib/data'
import Link from 'next/link'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="nx-tooltip">
        <p style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: 12 }}>{label}</p>
        <p style={{ color: '#93C5FD', fontWeight: 700, fontSize: 15 }}>{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

const upcomingEvents = [
  { title: 'Student Mobility Orientation', date: 'Mar 25, 2026', type: 'Orientation', color: '#059669' },
  { title: 'MoU Renewal Summit – Europe', date: 'May 2, 2026', type: 'Summit', color: '#7C3AED' },
  { title: 'International Education Fair', date: 'Apr 15, 2026', type: 'Fair', color: '#2563EB' },
]

const topNews = [
  { title: 'UK Expands Student Visa Opportunities', source: 'BBC Education', date: 'Mar 25', dot: '#059669' },
  { title: 'New Global University Rankings Released', source: 'QS World', date: 'Mar 22', dot: '#2563EB' },
  { title: 'EU Erasmus+ Budget Increased by 15%', source: 'EU Commission', date: 'Mar 20', dot: '#D97706' },
]

export default function DashboardPage() {
  const expiringPartnerships = partnerships.filter(p => p.status === 'Expiring')

  return (
    <AppShell>
      <Topbar
        title="Dashboard Overview"
        subtitle="Welcome back — here's your global mobility summary for today."
        actions={
          <button className="btn-ghost" style={{ fontSize: 13 }}>
            <Download size={14} /> Export Report
          </button>
        }
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }} className="page-enter">

        {/* Hero Banner */}
        <div style={{
          borderRadius: 18,
          background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
          padding: '24px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 8px 32px rgba(37,99,235,0.25)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', right: 60, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6 }}>Academic Year 2025–26</p>
            <h2 style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              124 Global Partnerships Active
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>Across 42 countries · 1,450 students currently on exchange</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <Link href="/partnerships" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'rgba(255,255,255,0.18)', color: '#FFFFFF',
                border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 10,
                padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 7,
              }}>View Partnerships <ArrowRight size={14} /></button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <MetricCard
            label="Total Partnerships"
            value={dashboardStats.totalPartnerships}
            sub="Across 42 countries"
            trend={`${dashboardStats.partnershipGrowth} from last year`}
            trendUp
            icon={<Handshake size={22} color="#2563EB" />}
            iconBg="rgba(37,99,235,0.1)"
          />
          <MetricCard
            label="Active MoUs"
            value={dashboardStats.activeMoUs}
            sub={`${dashboardStats.moUCompliance} compliance`}
            trend="+3 this month"
            trendUp
            icon={<FileCheck size={22} color="#059669" />}
            iconBg="rgba(5,150,105,0.1)"
          />
          <MetricCard
            label="Expiring MoUs"
            value={dashboardStats.expiringMoUs}
            sub="Action required"
            trend="Needs attention"
            trendUp={false}
            icon={<AlertTriangle size={22} color="#D97706" />}
            iconBg="rgba(217,119,6,0.1)"
          />
          <MetricCard
            label="Active Students"
            value={dashboardStats.activeStudents.toLocaleString()}
            sub="On exchange globally"
            trend={`${dashboardStats.studentGrowth} this semester`}
            trendUp
            icon={<Users size={22} color="#7C3AED" />}
            iconBg="rgba(124,58,237,0.1)"
          />
        </div>

        {/* Charts Row */}
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* Students by Destination */}
          <SectionCard title="🌍 Students by Destination" action={
            <Link href="/students" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 11px' }}>
                View All <ArrowRight size={12} />
              </button>
            </Link>
          }>
            <div style={{ padding: '20px 16px 12px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={studentsByDestination} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFF3FB" vertical={false} />
                  <XAxis dataKey="country" tick={{ fontSize: 12, fill: '#8593A8', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#8593A8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.05)', radius: 8 }} />
                  <Bar dataKey="students" fill="url(#barGradLight)" radius={[7, 7, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#818CF8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {/* Mobility Trend */}
          <SectionCard title="📈 Student Mobility Trend" action={
            <span style={{ fontSize: 12, color: '#059669', fontWeight: 700, background: '#D1FAE5', padding: '3px 9px', borderRadius: 6 }}>↑ 9.8% YoY</span>
          }>
            <div style={{ padding: '20px 16px 12px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mobilityTrend}>
                  <defs>
                    <linearGradient id="areaGradLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFF3FB" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#8593A8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#8593A8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="students" stroke="#2563EB" strokeWidth={2.5} fill="url(#areaGradLight)" dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* Bottom Row */}
        <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
          {/* Partnerships by Country */}
          <SectionCard title="🤝 Partnerships by Country">
            <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 13 }}>
              {partnershipsByCountry.map((item, i) => {
                const maxCount = Math.max(...partnershipsByCountry.map(x => x.count))
                const pct = Math.round((item.count / maxCount) * 100)
                const colors = ['#2563EB', '#0891B2', '#7C3AED', '#DB2777', '#D97706', '#059669', '#DC2626', '#8593A8']
                return (
                  <div key={item.country} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', width: 88, flexShrink: 0 }}>{item.country}</span>
                    <div className="stat-bar-track">
                      <div className="stat-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${colors[i]}, ${colors[i]}99)` }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', width: 28, textAlign: 'right' }}>{item.count}</span>
                  </div>
                )
              })}
            </div>
          </SectionCard>

          {/* Right panel stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Expiring Alerts */}
            <SectionCard title="⚠️ Expiring Soon" action={
              <Link href="/partnerships" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
                  View All <ArrowRight size={12} />
                </button>
              </Link>
            }>
              <div>
                {expiringPartnerships.map(p => (
                  <div key={p.id} style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer', transition: 'background 0.18s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FFFBEB')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: 22 }}>{p.flag}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.university}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        {p.renewalDays} days left · Expires {p.expiryYear}
                      </p>
                    </div>
                    <Badge status={p.status} />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Upcoming Events */}
            <SectionCard title="📅 Upcoming Events" action={
              <Link href="/events" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
                  All Events <ArrowRight size={12} />
                </button>
              </Link>
            }>
              <div style={{ padding: '4px 0' }}>
                {upcomingEvents.map((ev, i) => (
                  <div key={i} style={{
                    padding: '11px 20px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    borderBottom: i < upcomingEvents.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: ev.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{ev.date} · {ev.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Global News Snippet */}
            <SectionCard title="📰 Global News" action={
              <Link href="/news" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
                  All News <ExternalLink size={12} />
                </button>
              </Link>
            }>
              <div style={{ padding: '4px 0' }}>
                {topNews.map((n, i) => (
                  <div key={i} style={{
                    padding: '11px 20px',
                    borderBottom: i < topNews.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer', transition: 'background 0.18s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFF')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.dot, marginTop: 4, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.title}</p>
                        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>{n.source} · {n.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

      </div>
    </AppShell>
  )
}

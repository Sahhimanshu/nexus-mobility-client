'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { Badge, MetricCard, SectionCard } from '@/components/ui'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  Handshake, FileCheck, AlertTriangle, Users, Download,
  ArrowRight, Globe, ExternalLink, TrendingUp, CalendarDays,
  Newspaper, Bell, Clock,
} from 'lucide-react'
import {
  countryApi,
  dashboardApi,
  eventApi,
  formatEnumLabel,
  formatShortDate,
  getTenantId,
  newsApi,
  partnershipApi,
  type CountryRecord,
  type CountryStatRecord,
  type EventRecord,
  type NewsRecord,
  type PartnershipRecord,
  type ProgramRecord,
} from '@/lib/api'

type ChartPoint = { country: string; students: number }
type PartnershipBucket = { country: string; count: number }

const STATUS_TO_BADGE: Record<string, string> = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  EXPIRING: 'Expiring',
  EXPIRED: 'Expired',
  PLANNED: 'Upcoming',
  CONFIRMED: 'Upcoming',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const TYPE_TO_LABEL: Record<string, string> = {
  FAIR: 'Fair',
  ORIENTATION: 'Orientation',
  WORKSHOP: 'Workshop',
  WEBINAR: 'Webinar',
  INFO_SESSION: 'Info Session',
  DELEGATION: 'Delegation Visit',
  CAMPUS_VISIT: 'Campus Visit',
  PARTNER_MEETING: 'Partner Meeting',
  AUDIT: 'Audit',
  CEREMONY: 'Ceremony',
}

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

function pickDisplayCountry(country: CountryRecord | undefined, stat: CountryStatRecord) {
  return {
    code: stat.countryCode,
    name: country?.name ?? stat.countryCode,
    flag: country?.flagEmoji ?? '🌍',
  }
}

export default function DashboardPage() {
  const tenantId = getTenantId() ?? undefined

  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState({
    date: new Date().toISOString().slice(0, 10),
    totalPrograms: 0,
    totalPartnerships: 0,
    totalEvents: 0,
    totalVisits: 0,
    totalStudents: 0,
  })
  const [studentChart, setStudentChart] = useState<ChartPoint[]>([])
  const [countryBars, setCountryBars] = useState<PartnershipBucket[]>([])
  const [expiringPartnerships, setExpiringPartnerships] = useState<PartnershipRecord[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<EventRecord[]>([])
  const [topNews, setTopNews] = useState<NewsRecord[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setLoading(true)
      try {
        const [overviewRes, trendRes, statsRes, countryListRes, partnershipListRes, eventListRes, newsListRes] = await Promise.all([
          dashboardApi.overview(tenantId),
          dashboardApi.mobilityTrend(tenantId, 6),
          countryApi.stats(tenantId),
          countryApi.list(),
          partnershipApi.list({ tenantId, limit: 500 }),
          eventApi.list({ tenantId, limit: 50 }),
          newsApi.top(tenantId, 3),
        ])

        if (cancelled) return

        setOverview(overviewRes)
        setStudentChart(trendRes.map(point => ({ country: String(point.year), students: point.students })))

        const countryMap = new Map(countryListRes.map(country => [country.code, country]))
        const sortedStats = [...statsRes]
          .sort((a, b) => (b.outboundStudents ?? 0) - (a.outboundStudents ?? 0))
          .slice(0, 6)
        setCountryBars(sortedStats.map(stat => {
          const display = pickDisplayCountry(countryMap.get(stat.countryCode), stat)
          return {
            country: display.name,
            count: stat.outboundStudents ?? 0,
          }
        }))

        const expiring = (partnershipListRes.content ?? [])
          .filter(item => item.status === 'EXPIRING')
          .sort((a, b) => (a.expiryDate ?? '').localeCompare(b.expiryDate ?? ''))
          .slice(0, 4)
        setExpiringPartnerships(expiring)

        const events = (eventListRes.content ?? [])
          .slice()
          .sort((a, b) => (a.eventDate ?? '').localeCompare(b.eventDate ?? ''))
          .slice(0, 3)
        setUpcomingEvents(events)

        setTopNews(newsListRes)
      } catch (error) {
        console.error('Failed to load dashboard', error)
        if (!cancelled) {
          setOverview(prev => ({ ...prev }))
          setStudentChart([])
          setCountryBars([])
          setExpiringPartnerships([])
          setUpcomingEvents([])
          setTopNews([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      cancelled = true
    }
  }, [tenantId])

  const partnershipsByCountry = useMemo(() => {
    const counts = new Map<string, number>()
    expiringPartnerships.forEach(item => {
      counts.set(item.countryCode, (counts.get(item.countryCode) ?? 0) + 1)
    })
    return Array.from(counts.entries()).map(([country, count]) => ({ country, count }))
  }, [expiringPartnerships])

  const totalPartnerships = overview.totalPartnerships || partnershipsByCountry.reduce((sum, item) => sum + item.count, 0)
  const totalStudents = overview.totalStudents || studentChart.reduce((sum, item) => sum + item.students, 0)
  const expiringCount = expiringPartnerships.length

  return (
    <AppShell>
      <Topbar
        title="Dashboard Overview"
        subtitle={loading ? 'Loading live data...' : `Updated for ${overview.date}`}
        actions={
          <button className="btn-ghost" style={{ fontSize: 13 }}>
            <Download size={14} /> Export Report
          </button>
        }
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }} className="page-enter">
        <div
          style={{
            borderRadius: 18,
            background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(37,99,235,0.25)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', right: 60, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6 }}>Live tenant view</p>
            <h2 style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              {totalPartnerships} Global Partnerships Active
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
              {countryBars.length} countries visible · {totalStudents.toLocaleString()} students on exchange
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <Link href="/partnerships" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  color: '#FFFFFF',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  borderRadius: 10,
                  padding: '10px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                View Partnerships <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>

        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <MetricCard
            label="Total Partnerships"
            value={overview.totalPartnerships}
            sub="Across the current tenant"
            trend="Live API data"
            trendUp
            icon={<Handshake size={22} color="#2563EB" />}
            iconBg="rgba(37,99,235,0.1)"
          />
          <MetricCard
            label="Active MoUs"
            value={overview.totalPartnerships - expiringCount}
            sub={`${expiringCount} expiring soon`}
            trend="Needs attention"
            trendUp={false}
            icon={<FileCheck size={22} color="#059669" />}
            iconBg="rgba(5,150,105,0.1)"
          />
          <MetricCard
            label="Expiring MoUs"
            value={expiringCount}
            sub="From backend partnership statuses"
            trend="Review dates"
            trendUp={false}
            icon={<AlertTriangle size={22} color="#D97706" />}
            iconBg="rgba(217,119,6,0.1)"
          />
          <MetricCard
            label="Active Students"
            value={overview.totalStudents}
            sub="Current mobility roster"
            trend="Live API data"
            trendUp
            icon={<Users size={22} color="#7C3AED" />}
            iconBg="rgba(124,58,237,0.1)"
          />
        </div>

        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <SectionCard
            title="🌍 Students by Destination"
            action={
              <Link href="/students" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 11px' }}>
                  View All <ArrowRight size={12} />
                </button>
              </Link>
            }
          >
            <div style={{ padding: '20px 16px 12px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={countryBars} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFF3FB" vertical={false} />
                  <XAxis dataKey="country" tick={{ fontSize: 12, fill: '#8593A8', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#8593A8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.05)', radius: 8 }} />
                  <Bar dataKey="count" fill="url(#barGradLight)" radius={[7, 7, 0, 0]} />
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

          <SectionCard
            title="📈 Student Mobility Trend"
            action={
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 700, background: '#D1FAE5', padding: '3px 9px', borderRadius: 6 }}>
                Live trend
              </span>
            }
          >
            <div style={{ padding: '20px 16px 12px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={studentChart}>
                  <defs>
                    <linearGradient id="areaGradLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFF3FB" vertical={false} />
                  <XAxis dataKey="country" tick={{ fontSize: 12, fill: '#8593A8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#8593A8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="students" stroke="#2563EB" strokeWidth={2.5} fill="url(#areaGradLight)" dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
          <SectionCard title="🤝 Partnerships by Country">
            <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 13 }}>
              {partnershipsByCountry.length === 0 && (
                <div style={{ padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>No partnership breakdown available yet.</div>
              )}
              {partnershipsByCountry.map((item, i) => {
                const maxCount = Math.max(...partnershipsByCountry.map(x => x.count), 1)
                const pct = Math.round((item.count / maxCount) * 100)
                const colors = ['#2563EB', '#0891B2', '#7C3AED', '#DB2777', '#D97706', '#059669', '#DC2626', '#8593A8']
                return (
                  <div key={item.country} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', width: 88, flexShrink: 0 }}>{item.country}</span>
                    <div className="stat-bar-track">
                      <div className="stat-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${colors[i % colors.length]}99)` }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', width: 28, textAlign: 'right' }}>{item.count}</span>
                  </div>
                )
              })}
            </div>
          </SectionCard>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionCard
              title="⚠️ Expiring Soon"
              action={
                <Link href="/partnerships" style={{ textDecoration: 'none' }}>
                  <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
                    View All <ArrowRight size={12} />
                  </button>
                </Link>
              }
            >
              <div>
                {expiringPartnerships.length === 0 && (
                  <div style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: 13 }}>No expiring partnerships at the moment.</div>
                )}
                {expiringPartnerships.map(p => (
                  <div
                    key={p.id}
                    style={{
                      padding: '12px 20px',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>🏳️</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.universityName}
                      </p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        Expires {formatShortDate(p.expiryDate)} · {formatEnumLabel(STATUS_TO_BADGE[p.status] ?? p.status)}
                      </p>
                    </div>
                    <Badge status={STATUS_TO_BADGE[p.status] ?? formatEnumLabel(p.status)} />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="📅 Upcoming Events"
              action={
                <Link href="/events" style={{ textDecoration: 'none' }}>
                  <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
                    All Events <ArrowRight size={12} />
                  </button>
                </Link>
              }
            >
              <div style={{ padding: '4px 0' }}>
                {upcomingEvents.length === 0 && (
                  <div style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: 13 }}>No upcoming events loaded.</div>
                )}
                {upcomingEvents.map((ev, i) => (
                  <div
                    key={ev.id}
                    style={{
                      padding: '11px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      borderBottom: i < upcomingEvents.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.name}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        {formatShortDate(ev.eventDate)} · {TYPE_TO_LABEL[ev.type] ?? formatEnumLabel(ev.type)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="📰 Global News"
              action={
                <Link href="/news" style={{ textDecoration: 'none' }}>
                  <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
                    All News <ExternalLink size={12} />
                  </button>
                </Link>
              }
            >
              <div style={{ padding: '4px 0' }}>
                {topNews.length === 0 && (
                  <div style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: 13 }}>No news loaded yet.</div>
                )}
                {topNews.map((n, i) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '11px 20px',
                      borderBottom: i < topNews.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', marginTop: 4, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.title}</p>
                        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>
                          {formatShortDate(n.publishDate)} · {formatEnumLabel(n.category)}
                        </p>
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

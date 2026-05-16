'use client'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { countryApi, getTenantId, type CountryRecord, type CountryStatRecord } from '@/lib/api'
import { getErrorMessage } from '@/lib/error'
import { SectionCard } from '@/components/ui'
import { toast } from 'sonner'

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  Strong: { color: '#059669', bg: '#DCFCE7', border: '#BBF7D0' },
  Growing: { color: '#2563EB', bg: '#DBEAFE', border: '#BFDBFE' },
  Emerging: { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
}

function statusForStat(stat: CountryStatRecord) {
  const outbound = stat.outboundStudents ?? 0
  if (outbound >= 100) return 'Strong'
  if (outbound >= 40) return 'Growing'
  return 'Emerging'
}

export default function CountriesPage() {
  const tenantId = getTenantId() ?? undefined
  const [loading, setLoading] = useState(true)
  const [countryData, setCountryData] = useState<Array<{ country: CountryRecord; stat: CountryStatRecord | null }>>([])

  useEffect(() => {
    let cancelled = false

    async function loadCountries() {
      setLoading(true)
      try {
        const [countries, stats] = await Promise.all([
          countryApi.list(),
          countryApi.stats(tenantId),
        ])
        if (cancelled) return

        const statMap = new Map(stats.map(stat => [stat.countryCode, stat]))
        setCountryData(countries.map(country => ({
          country,
          stat: statMap.get(country.code) ?? null,
        })))
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load countries'))
        if (!cancelled) setCountryData([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCountries()
    return () => {
      cancelled = true
    }
  }, [tenantId])

  const totals = useMemo(() => ({
    universities: countryData.reduce((sum, item) => sum + (item.stat?.partnershipCount ?? 0), 0),
    students: countryData.reduce((sum, item) => sum + (item.stat?.outboundStudents ?? 0), 0),
  }), [countryData])

  return (
    <AppShell>
      <Topbar
        title="Countries"
        subtitle={loading ? 'Loading country coverage...' : 'Global partnership distribution across countries'}
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }} className="page-enter">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Countries Covered', value: countryData.length, color: '#2563EB', icon: '🌍' },
            { label: 'Partner Universities', value: totals.universities, color: '#7C3AED', icon: '🎓' },
            { label: 'Students Abroad', value: totals.students, color: '#059669', icon: '✈️' },
          ].map(summary => (
            <div key={summary.label} className="glass-card metric-card" style={{ padding: '22px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{summary.icon}</div>
              <p style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{summary.value}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>{summary.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {countryData.map(item => {
            const students = item.stat?.outboundStudents ?? 0
            const universities = item.stat?.partnershipCount ?? 0
            const pct = totals.students ? Math.round((students / totals.students) * 100) : 0
            const status = statusForStat(item.stat ?? { countryCode: item.country.code } as CountryStatRecord)
            const cfg = statusConfig[status]

            return (
              <div key={item.country.code} className="nx-card" style={{ padding: '20px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 38 }}>{item.country.flagEmoji ?? '🌍'}</span>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{item.country.name}</h3>
                    <span style={{
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
                      padding: '2px 8px', borderRadius: 5, display: 'inline-block', marginTop: 3,
                    }}>
                      {status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div style={{ textAlign: 'center', padding: '10px', background: '#F0F4FF', borderRadius: 10, border: '1px solid rgba(37,99,235,0.1)' }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#2563EB', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{universities}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>Universities</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', background: '#F0FDF4', borderRadius: 10, border: '1px solid rgba(5,150,105,0.1)' }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#059669', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{students}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>Students</p>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>Share of mobility</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 7, background: '#EFF3FB', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: cfg.color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {countryData.length === 0 && !loading && (
          <SectionCard title="No Countries">
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No country records were returned by the backend.
            </div>
          </SectionCard>
        )}
      </div>
    </AppShell>
  )
}

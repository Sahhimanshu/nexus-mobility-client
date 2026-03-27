'use client'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { SectionCard } from '@/components/ui'

const countryData = [
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', universities: 4, students: 89, status: 'Strong' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany', universities: 5, students: 134, status: 'Strong' },
  { code: 'US', flag: '🇺🇸', name: 'United States', universities: 3, students: 67, status: 'Growing' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore', universities: 2, students: 56, status: 'Growing' },
  { code: 'FR', flag: '🇫🇷', name: 'France', universities: 4, students: 98, status: 'Strong' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan', universities: 2, students: 31, status: 'Emerging' },
  { code: 'CH', flag: '🇨🇭', name: 'Switzerland', universities: 2, students: 18, status: 'Emerging' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia', universities: 2, students: 44, status: 'Growing' },
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands', universities: 1, students: 12, status: 'Emerging' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada', universities: 1, students: 22, status: 'Emerging' },
]

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  Strong:   { color: '#059669', bg: '#DCFCE7', border: '#BBF7D0' },
  Growing:  { color: '#2563EB', bg: '#DBEAFE', border: '#BFDBFE' },
  Emerging: { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
}

export default function CountriesPage() {
  const totalStudents = countryData.reduce((a, c) => a + c.students, 0)
  const totalUniversities = countryData.reduce((a, c) => a + c.universities, 0)

  return (
    <AppShell>
      <Topbar title="Countries" subtitle="Global partnership distribution across countries" />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }} className="page-enter">

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Countries Covered', value: countryData.length, color: '#2563EB', icon: '🌍' },
            { label: 'Partner Universities', value: totalUniversities, color: '#7C3AED', icon: '🎓' },
            { label: 'Students Abroad', value: totalStudents, color: '#059669', icon: '✈️' },
          ].map(s => (
            <div key={s.label} className="glass-card metric-card" style={{ padding: '22px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{s.icon}</div>
              <p style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Countries Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {countryData.map(country => {
            const pct = Math.round((country.students / totalStudents) * 100)
            const cfg = statusConfig[country.status]
            return (
              <div key={country.code} className="nx-card" style={{ padding: '20px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 38 }}>{country.flag}</span>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{country.name}</h3>
                    <span style={{
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
                      padding: '2px 8px', borderRadius: 5, display: 'inline-block', marginTop: 3,
                    }}>{country.status}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div style={{ textAlign: 'center', padding: '10px', background: '#F0F4FF', borderRadius: 10, border: '1px solid rgba(37,99,235,0.1)' }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#2563EB', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{country.universities}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>Universities</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', background: '#F0FDF4', borderRadius: 10, border: '1px solid rgba(5,150,105,0.1)' }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#059669', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{country.students}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>Students</p>
                  </div>
                </div>

                {/* Share bar */}
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
      </div>
    </AppShell>
  )
}

'use client'
import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { SectionCard } from '@/components/ui'
import { Search, ExternalLink, Bookmark, Share2, TrendingUp, Globe2, GraduationCap, Award } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  source: string
  date: string
  category: string
  summary: string
  url: string
  isNew?: boolean
  dot: string
  readTime: string
}

const newsItems: NewsItem[] = [
  {
    id: 'n1',
    title: 'UK Expands Student Visa Opportunities for International Graduates',
    source: 'BBC Education', date: 'Mar 25, 2026', category: 'Visa & Policy',
    summary: 'The UK government announced an extended post-study work visa of 3 years for international graduates from top universities, effective from September 2026.',
    url: '#', isNew: true, dot: '#059669', readTime: '3 min',
  },
  {
    id: 'n2',
    title: 'New QS World University Rankings 2026 Released',
    source: 'QS World Rankings', date: 'Mar 22, 2026', category: 'Rankings',
    summary: 'The latest QS rankings show Asian universities gaining ground, with NUS and NTU entering the top 10 for the first time. MIT retains the #1 position globally.',
    url: '#', dot: '#2563EB', readTime: '4 min',
  },
  {
    id: 'n3',
    title: 'EU Erasmus+ Budget Increased by 15% for 2026-2030 Programme',
    source: 'European Commission', date: 'Mar 20, 2026', category: 'Funding',
    summary: 'The EU has announced a €4.6 billion increase to the Erasmus+ budget, prioritising green skills, digital learning, and mobility for students from underrepresented groups.',
    url: '#', dot: '#D97706', readTime: '5 min',
  },
  {
    id: 'n4',
    title: 'India Becomes Top Source Country for International Students in the US',
    source: 'IIE Open Doors', date: 'Mar 18, 2026', category: 'Trends',
    summary: 'For the first time, Indian students outnumber Chinese students in US universities, with a 15% year-on-year increase driven by STEM program demand.',
    url: '#', dot: '#7C3AED', readTime: '3 min',
  },
  {
    id: 'n5',
    title: 'Germany Launches New Academic Visa Fast-Track Program',
    source: 'DAAD Germany', date: 'Mar 15, 2026', category: 'Visa & Policy',
    summary: 'Germany\'s new Academic Visa Fast-Track reduces processing time to 2 weeks for students from partner universities. Program covers 42 countries initially.',
    url: '#', dot: '#DC2626', readTime: '2 min',
  },
  {
    id: 'n6',
    title: 'Global Student Mobility Numbers Recover to Pre-Pandemic Levels',
    source: 'UNESCO', date: 'Mar 12, 2026', category: 'Trends',
    summary: 'UNESCO report confirms 6.4 million international students globally in 2025, surpassing the 2019 record of 6.1 million. Asia-Pacific leads growth.',
    url: '#', dot: '#0891B2', readTime: '4 min',
  },
  {
    id: 'n7',
    title: 'Joint WHO-UNESCO Report on International Student Mental Health',
    source: 'WHO', date: 'Mar 10, 2026', category: 'Welfare',
    summary: 'New guidelines published for universities to support the mental health of international students, including cultural adjustment, language barriers, and financial stress.',
    url: '#', dot: '#DB2777', readTime: '6 min',
  },
]

const categories = ['All', 'Visa & Policy', 'Rankings', 'Funding', 'Trends', 'Welfare']

const catColors: Record<string, { bg: string; color: string; border: string }> = {
  'Visa & Policy': { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
  'Rankings': { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  'Funding': { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  'Trends': { bg: '#EDE9FE', color: '#5B21B6', border: '#DDD6FE' },
  'Welfare': { bg: '#FCE7F3', color: '#9D174D', border: '#FBCFE8' },
}

const catIcons: Record<string, React.ReactNode> = {
  'Visa & Policy': <Globe2 size={14} />,
  'Rankings': <Award size={14} />,
  'Funding': <TrendingUp size={14} />,
  'Trends': <TrendingUp size={14} />,
  'Welfare': <GraduationCap size={14} />,
}

export default function NewsPage() {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [saved, setSaved] = useState<string[]>([])

  const filtered = newsItems.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.source.toLowerCase().includes(search.toLowerCase()) ||
      n.summary.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'All' || n.category === catFilter
    return matchSearch && matchCat
  })

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSaved(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  return (
    <AppShell>
      <Topbar
        title="Global News"
        subtitle="Latest international education sector news and updates"
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">

        {/* Hero Banner */}
        <div style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #0891B2 0%, #2563EB 60%, #4F46E5 100%)',
          padding: '22px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 6px 24px rgba(8,145,178,0.2)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Globe2 size={18} color="rgba(255,255,255,0.8)" />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>Global Education Intelligence</span>
            </div>
            <h2 style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              Stay Ahead of International Education Trends
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
              Curated news from BBC Education, QS, UNESCO, DAAD, and 20+ trusted sources
            </p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)', borderRadius: 12,
            padding: '16px 24px', textAlign: 'center', flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
          }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{newsItems.length}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Articles Today</p>
          </div>
        </div>

        {/* Search + Filter bar */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="nx-input"
              placeholder="Search news, sources, topics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 36, height: 40 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`tab-btn ${catFilter === c ? 'active' : ''}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map(n => {
            const cat = catColors[n.category] || catColors['Trends']
            const isSaved = saved.includes(n.id)
            return (
              <div key={n.id} className="news-card">
                {/* Card Top */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: n.dot, flexShrink: 0, marginTop: 2 }} />
                    <span style={{
                      background: cat.bg, color: cat.color, border: `1px solid ${cat.border}`,
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 5,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      {catIcons[n.category]} {n.category}
                    </span>
                    {n.isNew && (
                      <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 5 }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <button
                    onClick={e => toggleSave(n.id, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    <Bookmark size={15} color={isSaved ? '#2563EB' : '#8593A8'} fill={isSaved ? '#2563EB' : 'none'} />
                  </button>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)',
                  lineHeight: 1.45, marginBottom: 10, fontFamily: 'var(--font-display)',
                }}>{n.title}</h3>

                {/* Summary */}
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                  {n.summary}
                </p>

                {/* Footer */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: 12, borderTop: '1px solid var(--border)',
                }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{n.source}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{n.date} · {n.readTime} read</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                      <Share2 size={13} color="#8593A8" />
                    </button>
                    <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
                        Read More <ExternalLink size={12} />
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <Globe2 size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>No news articles match your search.</p>
          </div>
        )}

        {/* Sources Note */}
        <div style={{
          background: '#F8FAFF', borderRadius: 12, padding: '14px 20px',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Globe2 size={16} color="#2563EB" />
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Sources:</strong> News is aggregated from BBC Education, QS World Rankings, UNESCO, European Commission, DAAD, IIE Open Doors, Times Higher Education, and other trusted education sector publications.
            <span style={{ color: '#2563EB', fontWeight: 600, marginLeft: 6, cursor: 'pointer' }}>Configure Sources →</span>
          </p>
        </div>

      </div>
    </AppShell>
  )
}


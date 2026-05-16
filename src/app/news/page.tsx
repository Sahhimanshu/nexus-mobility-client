'use client'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { SectionCard } from '@/components/ui'
import { getTenantId, liveNewsApi, newsApi, type LiveNewsRecord, type NewsRecord } from '@/lib/api'
import { getErrorMessage } from '@/lib/error'
import { Search, ExternalLink, Bookmark, Share2, TrendingUp, Globe2, GraduationCap, Award } from 'lucide-react'
import { toast } from 'sonner'

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

const categories = ['All', 'Mobility', 'Partnership', 'Campus', 'Scholarship', 'Announcement']

const catColors: Record<string, { bg: string; color: string; border: string }> = {
  Mobility: { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
  Partnership: { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  Campus: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  Scholarship: { bg: '#EDE9FE', color: '#5B21B6', border: '#DDD6FE' },
  Announcement: { bg: '#FCE7F3', color: '#9D174D', border: '#FBCFE8' },
}

const catIcons: Record<string, React.ReactNode> = {
  Mobility: <Globe2 size={14} />,
  Partnership: <Award size={14} />,
  Campus: <TrendingUp size={14} />,
  Scholarship: <GraduationCap size={14} />,
  Announcement: <Globe2 size={14} />,
}

function safeHostname(value?: string | null) {
  if (!value) return 'Live News'
  try {
    const normalized = value.startsWith('http') ? value : `https://${value}`
    return new URL(normalized).hostname.replace('www.', '')
  } catch {
    return value
  }
}

function classifyNews(item: Pick<NewsItem, 'title' | 'summary' | 'source'>) {
  const text = `${item.title} ${item.summary} ${item.source}`.toLowerCase()
  if (text.includes('scholarship') || text.includes('grant')) return 'Scholarship'
  if (text.includes('partnership') || text.includes('agreement') || text.includes('mou')) return 'Partnership'
  if (text.includes('campus') || text.includes('university') || text.includes('college')) return 'Campus'
  if (text.includes('exchange') || text.includes('mobility') || text.includes('international student')) return 'Mobility'
  return 'Announcement'
}

function mapNews(record: NewsRecord): NewsItem {
  const category = record.category ? record.category.charAt(0) + record.category.slice(1).toLowerCase() : 'Announcement'
  return {
    id: record.id,
    title: record.title ?? '',
    source: safeHostname(record.sourceUrl),
    date: record.publishDate ? new Date(record.publishDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    category,
    summary: record.summary ?? '',
    url: record.sourceUrl ?? '#',
    isNew: true,
    dot: '#2563EB',
    readTime: '3 min',
  }
}

function mapLiveNews(record: LiveNewsRecord): NewsItem {
  const title = record.title?.trim() || 'Live news item'
  const summary = record.summary?.trim() || 'Fresh live article from the global news feed.'
  const source = safeHostname(record.domain ?? record.source)
  const date = record.publishedAt ? new Date(record.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
  const category = classifyNews({ title, summary, source })

  return {
    id: `${record.url}-${title}`,
    title,
    source,
    date,
    category,
    summary,
    url: record.url,
    isNew: true,
    dot: '#2563EB',
    readTime: '2 min',
  }
}

export default function NewsPage() {
  const tenantId = getTenantId() ?? undefined
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [saved, setSaved] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadNews() {
      setLoading(true)
      try {
        const [live, top] = await Promise.all([
          liveNewsApi.search(search || 'international student exchange university scholarship', 12),
          newsApi.top(tenantId, 6),
        ])

        if (cancelled) return

        const merged = [...live.map(mapLiveNews), ...top.map(mapNews)]
        const unique = Array.from(new Map(merged.map(item => [item.id, item])).values())
        setNewsItems(unique)
      } catch (error) {
        try {
          const fallback = await newsApi.list({ tenantId, limit: 50 })
          if (cancelled) return
          setNewsItems((fallback.content ?? []).map(mapNews))
        } catch (fallbackError) {
          toast.error(getErrorMessage(fallbackError, getErrorMessage(error, 'Failed to load news')))
          if (!cancelled) setNewsItems([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadNews()
    return () => {
      cancelled = true
    }
  }, [tenantId, search])

  const filtered = useMemo(() => newsItems.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.source.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'All' || item.category === catFilter
    return matchSearch && matchCat
  }), [search, catFilter, newsItems])

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSaved(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  }

  return (
    <AppShell>
      <Topbar title="Global News" subtitle={loading ? 'Loading live articles...' : 'Latest international education sector news and updates'} />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">
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
              Curated news from backend-managed articles and sources
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
            {categories.map(category => (
              <button key={category} onClick={() => setCatFilter(category)} className={`tab-btn ${catFilter === category ? 'active' : ''}`}>
                {category}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map(item => {
            const cat = catColors[item.category] || catColors.Announcement
            const isSaved = saved.includes(item.id)
            return (
              <div key={item.id} className="news-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.dot, flexShrink: 0, marginTop: 2 }} />
                    <span style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}`, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {catIcons[item.category] ?? <Globe2 size={14} />} {item.category}
                    </span>
                    {item.isNew && (
                      <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 5 }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <button onClick={e => toggleSave(item.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <Bookmark size={15} color={isSaved ? '#2563EB' : '#8593A8'} fill={isSaved ? '#2563EB' : 'none'} />
                  </button>
                </div>

                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: 10, fontFamily: 'var(--font-display)' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                  {item.summary}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.source}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{item.date} · {item.readTime} read</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                      <Share2 size={13} color="#8593A8" />
                    </button>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
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

        <div style={{ background: '#F8FAFF', borderRadius: 12, padding: '14px 20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Globe2 size={16} color="#2563EB" />
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Sources:</strong> News is loaded from GDELT live articles first, with backend news used as a fallback if the live feed is unavailable.
          </p>
        </div>
      </div>
    </AppShell>
  )
}

'use client'
import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { SectionCard, Badge, StatMini } from '@/components/ui'
import {
  Plus, MapPin, Users, X, ChevronLeft, Calendar,
  Edit3, Trash2, UploadCloud, FileText, Plane, Building2
} from 'lucide-react'

interface Visit {
  id: string
  institution: string
  country: string
  flag: string
  date: string
  type: string
  status: string
  participants: string[]
  agenda: string
  documents?: string[]
}

const visits: Visit[] = [
  {
    id: 'v1', institution: 'University of Oxford', country: 'United Kingdom', flag: '🇬🇧',
    date: '2026-03-12', type: 'Delegation Visit', status: 'Completed',
    participants: ['Dr. Sharma', 'Prof. Singh', 'IR Coordinator'],
    agenda: 'Discussions on joint PhD program and MoU renewal for 2026-2030 period.',
    documents: ['Delegation_Report_Oxford.pdf', 'Oxford_MoU_Draft.pdf'],
  },
  {
    id: 'v2', institution: 'Université Paris-Sorbonne', country: 'France', flag: '🇫🇷',
    date: '2026-04-20', type: 'MoU Signing', status: 'Upcoming',
    participants: ['Vice Chancellor', 'Dr. Sharma', 'Legal Team'],
    agenda: 'Official MoU signing ceremony for 5-year academic exchange partnership.',
  },
  {
    id: 'v3', institution: 'TU Munich', country: 'Germany', flag: '🇩🇪',
    date: '2026-05-08', type: 'Research Workshop', status: 'Upcoming',
    participants: ['Research Office', 'Prof. Kumar', 'IR Team'],
    agenda: 'Joint research workshop on AI in Education collaboration.',
  },
  {
    id: 'v4', institution: 'NUS Singapore', country: 'Singapore', flag: '🇸🇬',
    date: '2026-03-05', type: 'Delegation Visit', status: 'Completed',
    participants: ['IR Director', 'Dean of Engineering'],
    agenda: 'Engineering faculty exchange discussion and lab tour.',
    documents: ['NUS_Visit_Summary.pdf'],
  },
  {
    id: 'v5', institution: 'ETH Zurich', country: 'Switzerland', flag: '🇨🇭',
    date: '2026-06-22', type: 'Institutional Visit', status: 'Upcoming',
    participants: ['Vice Chancellor', 'IR Team', 'Dr. Mehta'],
    agenda: 'Exploring joint degree possibilities in Engineering and Sciences.',
  },
]

const typeColors: Record<string, string> = {
  'Delegation Visit': '#2563EB',
  'MoU Signing': '#7C3AED',
  'Research Workshop': '#059669',
  'Institutional Visit': '#0891B2',
  'Student Exchange Review': '#D97706',
}

const statusMap: Record<string, { bg: string; color: string; border: string }> = {
  'Upcoming': { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  'Completed': { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
  'Cancelled': { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function VisitsPage() {
  const [selected, setSelected] = useState<Visit | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState('All')

  const types = ['All', 'Delegation Visit', 'MoU Signing', 'Research Workshop', 'Institutional Visit']
  const filtered = visits.filter(v => filter === 'All' || v.type === filter)

  return (
    <AppShell>
      <Topbar
        title="University Visits"
        subtitle="Delegations, MoU signings, and institutional visits"
        actions={
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Visit
          </button>
        }
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">

        {/* Stats */}
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatMini label="Total Visits" value={visits.length} color="#2563EB" />
          <StatMini label="Upcoming" value={visits.filter(v => v.status === 'Upcoming').length} color="#D97706" />
          <StatMini label="Completed" value={visits.filter(v => v.status === 'Completed').length} color="#059669" />
          <StatMini label="Countries Visited" value={new Set(visits.map(v => v.country)).size} color="#7C3AED" />
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`tab-btn ${filter === t ? 'active' : ''}`}>{t}</button>
          ))}
        </div>

        {/* Main split */}
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 18 }}>

          {/* Visit List */}
          <SectionCard title="✈️ Visit List" action={
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{filtered.length} visits</span>
          }>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Institution</th>
                    <th style={{ textAlign: 'left' }}>Date</th>
                    <th style={{ textAlign: 'left' }}>Type</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(v => {
                    const s = statusMap[v.status] || statusMap['Upcoming']
                    const tc = typeColors[v.type] || '#2563EB'
                    return (
                      <tr key={v.id} onClick={() => setSelected(v)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 24 }}>{v.flag}</span>
                            <div>
                              <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{v.institution}</p>
                              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={11} /> {v.country}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{formatDate(v.date)}</td>
                        <td>
                          <span style={{
                            background: `${tc}15`, color: tc,
                            border: `1px solid ${tc}30`,
                            padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          }}>{v.type}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                            padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
                          }}>{v.status}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={e => { e.stopPropagation(); setSelected(v) }}
                            className="btn-ghost" style={{ padding: '5px 11px', fontSize: 12 }}>View</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Visit Detail */}
          {selected && (
            <div className="glass-card" style={{ overflow: 'hidden', animation: 'slideUp 0.25s ease' }}>
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#FAFBFF',
              }}>
                <button onClick={() => setSelected(null)} className="btn-ghost" style={{ padding: '5px 11px', fontSize: 12 }}>
                  <ChevronLeft size={13} /> Back
                </button>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}><Edit3 size={13} /></button>
                  <button className="btn-danger" style={{ padding: '5px 10px', fontSize: 12 }}><Trash2 size={13} /></button>
                </div>
              </div>

              {/* Hero */}
              <div style={{
                background: 'linear-gradient(135deg, #EFF3FB 0%, #E8EEFF 100%)',
                padding: '24px 20px', textAlign: 'center', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 52 }}>{selected.flag}</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 10, fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
                  {selected.institution}
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <MapPin size={12} /> {selected.country}
                </p>
                <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <span style={{
                    background: `${typeColors[selected.type] || '#2563EB'}15`,
                    color: typeColors[selected.type] || '#2563EB',
                    border: `1px solid ${typeColors[selected.type] || '#2563EB'}30`,
                    padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  }}>{selected.type}</span>
                  <span style={{
                    background: statusMap[selected.status]?.bg || '#DBEAFE',
                    color: statusMap[selected.status]?.color || '#1E40AF',
                    border: `1px solid ${statusMap[selected.status]?.border || '#BFDBFE'}`,
                    padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  }}>{selected.status}</span>
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: '#F8FAFF', border: '1px solid var(--border)' }}>
                    <Calendar size={14} color="#2563EB" />
                    <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500, flex: 1 }}>Date</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{formatDate(selected.date)}</span>
                  </div>
                </div>

                {/* Participants */}
                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 10 }}>Participants</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selected.participants.map((p, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 14px', borderRadius: 8, background: '#F0F4FF',
                        border: '1px solid rgba(37,99,235,0.12)',
                      }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: 7,
                          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0,
                        }}>{p.charAt(0)}</div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agenda */}
                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8 }}>Agenda</p>
                  <textarea
                    className="nx-input"
                    defaultValue={selected.agenda}
                    rows={3}
                    style={{ width: '100%', resize: 'none', fontSize: 13 }}
                  />
                </div>

                {/* Documents */}
                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 10 }}>Documents</p>
                  {selected.documents && selected.documents.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 10 }}>
                      {selected.documents.map((doc, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 14px', borderRadius: 8, background: '#F8FAFF',
                          border: '1px solid var(--border)', cursor: 'pointer',
                        }}>
                          <FileText size={14} color="#2563EB" />
                          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, flex: 1 }}>{doc}</span>
                          <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 600 }}>Download</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10 }}>No documents uploaded yet.</p>
                  )}
                  <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                    <UploadCloud size={13} /> Upload Document
                  </button>
                </div>

                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                  Manage Visit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Visit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Add University Visit</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Institution</label>
                <input className="nx-input" placeholder="e.g. University of Oxford" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Country</label>
                  <input className="nx-input" placeholder="e.g. United Kingdom" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Date</label>
                  <input className="nx-input" type="date" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Visit Type</label>
                <select className="nx-input" style={{ width: '100%' }}>
                  {types.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Participants</label>
                <input className="nx-input" placeholder="e.g. Dr. Sharma, Prof. Singh" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Agenda</label>
                <textarea className="nx-input" placeholder="Visit agenda and objectives..." rows={3} style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <div className="upload-zone">
                <UploadCloud size={22} color="#2563EB" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Upload Visit Documents</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Reports, itineraries, photos</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Visit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}


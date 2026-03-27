'use client'
import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { SectionCard, Badge, StatMini } from '@/components/ui'
import {
  Plus, Calendar, MapPin, Users, Globe, X,
  ChevronLeft, Clock, Video, ExternalLink, Edit3, Trash2, UploadCloud
} from 'lucide-react'

interface Event {
  id: string
  title: string
  type: string
  date: string
  location: string
  attendees: number
  status: string
  description: string
  participants?: string[]
  link?: string
}

const events: Event[] = [
  {
    id: 'e1', title: 'EAIE Conference 2026', type: 'Conference', date: '2026-06-20',
    location: 'Barcelona, Spain', attendees: 120, status: 'Upcoming',
    description: 'Annual gathering of international education professionals from across Europe and beyond.',
    participants: ['IR Team', 'Dr. Sharma', 'Prof. Singh'], link: 'https://eaie.org'
  },
  {
    id: 'e2', title: 'International Education Webinar', type: 'Webinar', date: '2026-03-15',
    location: 'Online – Zoom', attendees: 350, status: 'Completed',
    description: 'Online session discussing trends in global student mobility and scholarship opportunities.',
    participants: ['IR Team', 'Faculty Coordinators'], link: 'https://zoom.us'
  },
  {
    id: 'e3', title: 'MoU Renewal Summit – Europe', type: 'Summit', date: '2026-05-02',
    location: 'Brussels, Belgium', attendees: 45, status: 'Upcoming',
    description: 'Renewal discussions with 8 European partner institutions expiring in 2026.',
    participants: ['IR Director', 'Legal Team', 'Dr. Sharma']
  },
  {
    id: 'e4', title: 'Student Mobility Orientation', type: 'Orientation', date: '2026-03-25',
    location: 'Online – Teams', attendees: 230, status: 'This Week',
    description: 'Pre-departure orientation for Spring 2026 exchange students.',
    participants: ['Student Affairs', 'IR Team']
  },
  {
    id: 'e5', title: 'Asia-Pacific University Delegation', type: 'Visit', date: '2026-06-10',
    location: 'Singapore', attendees: 12, status: 'Upcoming',
    description: 'Delegation visit to NUS and 3 other Singapore universities.',
    participants: ['Vice Chancellor', 'IR Team']
  },
  {
    id: 'e6', title: 'Research Collaboration Workshop', type: 'Workshop', date: '2026-04-28',
    location: 'Munich, Germany', attendees: 60, status: 'Upcoming',
    description: 'Joint research program design workshop with TU Munich faculty.',
    participants: ['Research Office', 'IR Team', 'Prof. Kumar']
  },
]

const typeColors: Record<string, string> = {
  Conference: '#2563EB', Summit: '#7C3AED', Orientation: '#059669',
  Visit: '#D97706', Workshop: '#DB2777', Webinar: '#0891B2', Ceremony: '#059669', Fair: '#2563EB',
}

const statusBg: Record<string, { bg: string; color: string; border: string }> = {
  'This Week': { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
  'Upcoming': { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  'Completed': { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function EventsPage() {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Event | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const types = ['All', 'Conference', 'Summit', 'Orientation', 'Visit', 'Workshop', 'Webinar']
  const filtered = events.filter(e => filter === 'All' || e.type === filter)

  return (
    <AppShell>
      <Topbar
        title="Events"
        subtitle="Conferences, orientations, visits, and academic summits"
        actions={
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Event
          </button>
        }
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">

        {/* Stats */}
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatMini label="Total Events" value={events.length} color="#2563EB" />
          <StatMini label="This Week" value={events.filter(e => e.status === 'This Week').length} color="#059669" />
          <StatMini label="Upcoming" value={events.filter(e => e.status === 'Upcoming').length} color="#D97706" />
          <StatMini label="Total Attendees" value={events.reduce((a, e) => a + e.attendees, 0).toLocaleString()} color="#7C3AED" />
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`tab-btn ${filter === t ? 'active' : ''}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Main split */}
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 18 }}>

          {/* Event List */}
          <SectionCard title="📅 Event List" action={
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{filtered.length} events</span>
          }>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Event Name</th>
                    <th style={{ textAlign: 'left' }}>Date</th>
                    <th style={{ textAlign: 'left' }}>Type</th>
                    <th style={{ textAlign: 'left' }}>Location</th>
                    <th style={{ textAlign: 'center' }}>Attendees</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ev => {
                    const s = statusBg[ev.status] || statusBg['Upcoming']
                    return (
                      <tr key={ev.id} onClick={() => setSelected(ev)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                              background: `${typeColors[ev.type]}15`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: `1px solid ${typeColors[ev.type]}30`,
                            }}>
                              <Calendar size={16} color={typeColors[ev.type]} />
                            </div>
                            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{ev.title}</p>
                          </div>
                        </td>
                        <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{formatDate(ev.date)}</td>
                        <td>
                          <span style={{
                            background: `${typeColors[ev.type]}15`, color: typeColors[ev.type],
                            border: `1px solid ${typeColors[ev.type]}30`,
                            padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          }}>{ev.type}</span>
                        </td>
                        <td style={{ fontSize: 12.5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                            {ev.location.toLowerCase().includes('online') || ev.location.toLowerCase().includes('zoom') || ev.location.toLowerCase().includes('teams')
                              ? <Video size={13} color="#0891B2" />
                              : <MapPin size={13} />}
                            {ev.location}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <Users size={13} color="#8593A8" />
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.attendees}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                            padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
                          }}>{ev.status}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={e => { e.stopPropagation(); setSelected(ev) }}
                            className="btn-ghost" style={{ padding: '5px 11px', fontSize: 12 }}>
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Event Detail */}
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
                background: `linear-gradient(135deg, ${typeColors[selected.type]}12 0%, ${typeColors[selected.type]}06 100%)`,
                padding: '24px 20px', textAlign: 'center', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
                  background: `${typeColors[selected.type]}18`,
                  border: `1.5px solid ${typeColors[selected.type]}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Calendar size={26} color={typeColors[selected.type]} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>{selected.title}</h3>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span style={{
                    background: `${typeColors[selected.type]}15`, color: typeColors[selected.type],
                    border: `1px solid ${typeColors[selected.type]}30`,
                    padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  }}>{selected.type}</span>
                  <span style={{
                    background: statusBg[selected.status]?.bg || '#DBEAFE',
                    color: statusBg[selected.status]?.color || '#1E40AF',
                    border: `1px solid ${statusBg[selected.status]?.border || '#BFDBFE'}`,
                    padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  }}>{selected.status}</span>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {[
                    { icon: <Calendar size={14} color={typeColors[selected.type]} />, label: 'Date', value: formatDate(selected.date) },
                    { icon: <MapPin size={14} color={typeColors[selected.type]} />, label: 'Location', value: selected.location },
                    { icon: <Users size={14} color={typeColors[selected.type]} />, label: 'Attendees', value: `${selected.attendees} registered` },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 10, background: '#F8FAFF',
                      border: '1px solid var(--border)',
                    }}>
                      {item.icon}
                      <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500, flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8 }}>Description</p>
                  <div style={{ padding: '14px', background: '#F8FAFF', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <textarea
                      className="nx-input"
                      defaultValue={selected.description}
                      rows={3}
                      style={{ width: '100%', border: 'none', background: 'transparent', resize: 'none', fontSize: 13, color: 'var(--text-secondary)', padding: 0 }}
                    />
                  </div>
                </div>

                {/* Participants */}
                {selected.participants && (
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
                            background: `linear-gradient(135deg, ${typeColors[selected.type]}, ${typeColors[selected.type]}99)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0,
                          }}>{p.charAt(0)}</div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selected.link && (
                  <a href={selected.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13, marginBottom: 10 }}>
                      <ExternalLink size={13} /> Visit Event Website
                    </button>
                  </a>
                )}

                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                  Manage Event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Add New Event</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Event Name</label>
                <input className="nx-input" placeholder="e.g. EAIE Conference 2026" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Event Type</label>
                  <select className="nx-input" style={{ width: '100%' }}>
                    {types.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Date</label>
                  <input className="nx-input" type="date" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Location</label>
                <input className="nx-input" placeholder="City, Country or Online – Platform" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea className="nx-input" placeholder="Event description..." rows={3} style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Participants (comma separated)</label>
                <input className="nx-input" placeholder="e.g. IR Team, Dr. Sharma" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Event</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

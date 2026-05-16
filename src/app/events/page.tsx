'use client'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { SectionCard, Badge, StatMini } from '@/components/ui'
import { eventApi, formatEnumLabel, getTenantId, type EventParticipantRecord, type EventRecord } from '@/lib/api'
import { getErrorMessage } from '@/lib/error'
import {
  Plus, Calendar, MapPin, Users, Globe, X,
  ChevronLeft, Video, ExternalLink, Edit3, Trash2, UploadCloud,
} from 'lucide-react'
import { toast } from 'sonner'

interface EventView {
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

const typeColors: Record<string, string> = {
  Conference: '#2563EB',
  Summit: '#7C3AED',
  Orientation: '#059669',
  Visit: '#D97706',
  Workshop: '#DB2777',
  Webinar: '#0891B2',
  Ceremony: '#059669',
  Fair: '#2563EB',
  'Info Session': '#2563EB',
}

const statusBg: Record<string, { bg: string; color: string; border: string }> = {
  'This Week': { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
  Upcoming: { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  Completed: { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' },
  Cancelled: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
}

const defaultNewEvent = {
  name: '',
  type: 'FAIR',
  eventDate: '',
  location: '',
  hostInstitution: '',
  description: '',
}

function mapEvent(record: EventRecord): EventView {
  const eventDate = record.eventDate ?? ''
  const eventTime = eventDate ? new Date(eventDate).getTime() : Number.POSITIVE_INFINITY
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMs = today.getTime()
  const status = eventTime < todayMs ? 'Completed' : eventTime <= todayMs + 7 * 24 * 60 * 60 * 1000 ? 'This Week' : 'Upcoming'
  const displayType = record.type ? formatEnumLabel(record.type) : 'Event'

  return {
    id: record.id,
    title: record.name ?? '',
    type: displayType,
    date: eventDate,
    location: record.location ?? '',
    attendees: 0,
    status,
    description: record.description ?? '',
    link: record.hostInstitution ? `https://${record.hostInstitution.replace(/\s+/g, '').toLowerCase()}.org` : undefined,
  }
}

export default function EventsPage() {
  const tenantId = getTenantId() ?? undefined
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<EventView | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<EventView[]>([])
  const [participants, setParticipants] = useState<EventParticipantRecord[]>([])
  const [saving, setSaving] = useState(false)
  const [newEvent, setNewEvent] = useState(defaultNewEvent)

  useEffect(() => {
    let cancelled = false

    async function loadEvents() {
      setLoading(true)
      try {
        const page = await eventApi.list({ tenantId, limit: 200 })
        if (cancelled) return
        setEvents((page.content ?? []).map(mapEvent))
      } catch (error) {
        toast.error(getErrorMessage(error))
        if (!cancelled) setEvents([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadEvents()
    return () => {
      cancelled = true
    }
  }, [tenantId])

  useEffect(() => {
    let cancelled = false
    const selectedId = selected?.id
    if (!selectedId) {
      setParticipants([])
      return
    }

    async function loadParticipants() {
      try {
        const data = await eventApi.participants(selectedId!)
        if (!cancelled) setParticipants(data)
      } catch (error) {
        toast.error(getErrorMessage(error))
        if (!cancelled) setParticipants([])
      }
    }

    loadParticipants()
    return () => {
      cancelled = true
    }
  }, [selected?.id])

  const types = ['All', 'Fair', 'Orientation', 'Workshop', 'Webinar', 'Visit', 'Conference', 'Summit', 'Info Session']

  const filtered = useMemo(() => events.filter(event => filter === 'All' || event.type === filter), [events, filter])

  async function handleCreateEvent() {
    setSaving(true)
    try {
      const created = await eventApi.create({
        tenantId,
        name: newEvent.name,
        type: newEvent.type,
        eventDate: newEvent.eventDate || null,
        location: newEvent.location || null,
        hostInstitution: newEvent.hostInstitution || null,
        description: newEvent.description || null,
      })

      setEvents(prev => [...prev, mapEvent(created)])
      setShowAddModal(false)
      setNewEvent(defaultNewEvent)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteEvent(event: EventView) {
    try {
      await eventApi.delete(event.id)
      setEvents(prev => prev.filter(item => item.id !== event.id))
      if (selected?.id === event.id) {
        setSelected(null)
      }
      toast.success('Event deleted')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <AppShell>
      <Topbar
        title="Events"
        subtitle={loading ? 'Loading live events...' : 'Conferences, orientations, visits, and academic summits'}
        actions={
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Event
          </button>
        }
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatMini label="Total Events" value={events.length} color="#2563EB" />
          <StatMini label="This Week" value={events.filter(item => item.status === 'This Week').length} color="#059669" />
          <StatMini label="Upcoming" value={events.filter(item => item.status === 'Upcoming').length} color="#D97706" />
          <StatMini label="Total Attendees" value={events.reduce((sum, item) => sum + item.attendees, 0).toLocaleString()} color="#7C3AED" />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {types.map(type => (
            <button key={type} onClick={() => setFilter(type)} className={`tab-btn ${filter === type ? 'active' : ''}`}>
              {type}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 18 }}>
          <SectionCard title="📅 Event List" action={<span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{filtered.length} events</span>}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Event Name</th>
                    <th style={{ textAlign: 'left' }}>Date</th>
                    <th style={{ textAlign: 'left' }}>Type</th>
                    <th style={{ textAlign: 'left' }}>Location</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(event => {
                    const color = typeColors[event.type] || '#2563EB'
                    const status = statusBg[event.status] || statusBg.Upcoming
                    return (
                      <tr key={event.id} onClick={() => setSelected(event)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}30` }}>
                              <Calendar size={16} color={color} />
                            </div>
                            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{event.title}</p>
                          </div>
                        </td>
                        <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{event.date ? new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</td>
                        <td>
                          <span style={{ background: `${color}15`, color, border: `1px solid ${color}30`, padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                            {event.type}
                          </span>
                        </td>
                        <td style={{ fontSize: 12.5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                            {event.location.toLowerCase().includes('online') || event.location.toLowerCase().includes('zoom') || event.location.toLowerCase().includes('teams')
                              ? <Video size={13} color="#0891B2" />
                              : <MapPin size={13} />}
                            {event.location}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}`, padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600 }}>
                            {event.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={e => { e.stopPropagation(); setSelected(event) }} className="btn-ghost" style={{ padding: '5px 11px', fontSize: 12 }}>
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

          {selected && (
            <div className="glass-card" style={{ overflow: 'hidden', animation: 'slideUp 0.25s ease' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFBFF' }}>
                <button onClick={() => setSelected(null)} className="btn-ghost" style={{ padding: '5px 11px', fontSize: 12 }}>
                  <ChevronLeft size={13} /> Back
                </button>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}><Edit3 size={13} /></button>
                  <button className="btn-danger" onClick={() => handleDeleteEvent(selected)} style={{ padding: '5px 10px', fontSize: 12 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #EFF3FB 0%, #E8EEFF 100%)', padding: '24px 20px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px', background: `${typeColors[selected.type] || '#2563EB'}18`, border: `1.5px solid ${typeColors[selected.type] || '#2563EB'}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={26} color={typeColors[selected.type] || '#2563EB'} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>{selected.title}</h3>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span style={{ background: `${typeColors[selected.type] || '#2563EB'}15`, color: typeColors[selected.type] || '#2563EB', border: `1px solid ${typeColors[selected.type] || '#2563EB'}30`, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                    {selected.type}
                  </span>
                  <span style={{ background: statusBg[selected.status]?.bg || '#DBEAFE', color: statusBg[selected.status]?.color || '#1E40AF', border: `1px solid ${statusBg[selected.status]?.border || '#BFDBFE'}`, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                    {selected.status}
                  </span>
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {[
                    { icon: <Calendar size={14} color={typeColors[selected.type] || '#2563EB'} />, label: 'Date', value: selected.date ? new Date(selected.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '' },
                    { icon: <MapPin size={14} color={typeColors[selected.type] || '#2563EB'} />, label: 'Location', value: selected.location },
                    { icon: <Users size={14} color={typeColors[selected.type] || '#2563EB'} />, label: 'Attendees', value: `${selected.attendees} registered` },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: '#F8FAFF', border: '1px solid var(--border)' }}>
                      {item.icon}
                      <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500, flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8 }}>Description</p>
                  <div style={{ padding: '14px', background: '#F8FAFF', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <textarea className="nx-input" defaultValue={selected.description} rows={3} style={{ width: '100%', border: 'none', background: 'transparent', resize: 'none', fontSize: 13, color: 'var(--text-secondary)', padding: 0 }} />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 10 }}>Participants</p>
                  {participants.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {participants.map(participant => (
                        <div key={participant.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 8, background: '#F0F4FF', border: '1px solid rgba(37,99,235,0.12)' }}>
                          <div style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(135deg, ${typeColors[selected.type] || '#2563EB'}, ${(typeColors[selected.type] || '#2563EB')}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                            {participant.fullName.charAt(0)}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{participant.fullName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10 }}>No participants uploaded yet.</p>
                  )}
                </div>

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
                <input className="nx-input" placeholder="e.g. EAIE Conference 2026" value={newEvent.name} onChange={e => setNewEvent(prev => ({ ...prev, name: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Event Type</label>
                  <select className="nx-input" style={{ width: '100%' }} value={newEvent.type} onChange={e => setNewEvent(prev => ({ ...prev, type: e.target.value }))}>
                    <option value="FAIR">Fair</option>
                    <option value="ORIENTATION">Orientation</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="WEBINAR">Webinar</option>
                    <option value="INFO_SESSION">Info Session</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Date</label>
                  <input className="nx-input" type="date" value={newEvent.eventDate} onChange={e => setNewEvent(prev => ({ ...prev, eventDate: e.target.value }))} style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Location</label>
                <input className="nx-input" placeholder="City, Country or Online – Platform" value={newEvent.location} onChange={e => setNewEvent(prev => ({ ...prev, location: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Host Institution</label>
                <input className="nx-input" placeholder="e.g. University of Oxford" value={newEvent.hostInstitution} onChange={e => setNewEvent(prev => ({ ...prev, hostInstitution: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea className="nx-input" placeholder="Event description..." rows={3} value={newEvent.description} onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))} style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <div className="upload-zone">
                <UploadCloud size={22} color="#2563EB" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Upload Event Documents</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Reports, itineraries, photos</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleCreateEvent} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

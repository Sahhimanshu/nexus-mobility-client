'use client'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { SectionCard, Badge, StatMini } from '@/components/ui'
import { formatEnumLabel, getTenantId, type VisitParticipantRecord, type VisitRecord, visitApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/error'
import {
  Plus, MapPin, Users, X, ChevronLeft, Calendar,
  Edit3, Trash2, UploadCloud, FileText, Plane, Building2,
} from 'lucide-react'
import { toast } from 'sonner'

interface VisitView {
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

const typeColors: Record<string, string> = {
  Delegation: '#2563EB',
  Ceremony: '#7C3AED',
  Workshop: '#059669',
  Audit: '#0891B2',
  'Partner Meeting': '#D97706',
  'Campus Visit': '#DB2777',
}

const statusMap: Record<string, { bg: string; color: string; border: string }> = {
  Upcoming: { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  Confirmed: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
  Completed: { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
  Cancelled: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
  Planned: { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
}

const defaultNewVisit = {
  title: '',
  type: 'DELEGATION',
  visitDate: '',
  location: '',
  institutionName: '',
  agenda: '',
  status: 'PLANNED',
}

function mapVisit(record: VisitRecord): VisitView {
  const type = record.type ? formatEnumLabel(record.type) : 'Visit'
  const status = record.status ? formatEnumLabel(record.status) : 'Planned'
  return {
    id: record.id,
    institution: record.institutionName ?? record.title ?? '',
    country: record.location ?? '',
    flag: '🌍',
    date: record.visitDate ?? '',
    type,
    status,
    participants: [],
    agenda: record.agenda ?? '',
  }
}

export default function VisitsPage() {
  const tenantId = getTenantId() ?? undefined
  const [selected, setSelected] = useState<VisitView | null>(null)
  const [participants, setParticipants] = useState<VisitParticipantRecord[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [visits, setVisits] = useState<VisitView[]>([])
  const [saving, setSaving] = useState(false)
  const [newVisit, setNewVisit] = useState(defaultNewVisit)

  useEffect(() => {
    let cancelled = false

    async function loadVisits() {
      setLoading(true)
      try {
        const page = await visitApi.list({ tenantId, limit: 200 })
        if (cancelled) return
        setVisits((page.content ?? []).map(mapVisit))
      } catch (error) {
        toast.error(getErrorMessage(error))
        if (!cancelled) setVisits([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadVisits()
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
        const data = await visitApi.participants(selectedId!)
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

  const types = ['All', 'Delegation', 'Partner Meeting', 'Campus Visit', 'Audit', 'Ceremony']
  const filtered = useMemo(() => visits.filter(visit => filter === 'All' || visit.type === filter), [visits, filter])

  async function handleCreateVisit() {
    setSaving(true)
    try {
      const created = await visitApi.create({
        tenantId,
        title: newVisit.title,
        type: newVisit.type,
        status: newVisit.status,
        visitDate: newVisit.visitDate || null,
        location: newVisit.location || null,
        institutionName: newVisit.institutionName || null,
        agenda: newVisit.agenda || null,
      })

      setVisits(prev => [...prev, mapVisit(created)])
      setShowAddModal(false)
      setNewVisit(defaultNewVisit)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteVisit(visit: VisitView) {
    try {
      await visitApi.delete(visit.id)
      setVisits(prev => prev.filter(item => item.id !== visit.id))
      if (selected?.id === visit.id) {
        setSelected(null)
      }
      toast.success('Visit deleted')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <AppShell>
      <Topbar
        title="University Visits"
        subtitle={loading ? 'Loading visit records...' : 'Delegations, MoU signings, and institutional visits'}
        actions={
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Visit
          </button>
        }
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatMini label="Total Visits" value={visits.length} color="#2563EB" />
          <StatMini label="Upcoming" value={visits.filter(item => item.status === 'Upcoming' || item.status === 'Planned').length} color="#D97706" />
          <StatMini label="Completed" value={visits.filter(item => item.status === 'Completed').length} color="#059669" />
          <StatMini label="Institutions" value={new Set(visits.map(item => item.institution)).size} color="#7C3AED" />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {types.map(type => (
            <button key={type} onClick={() => setFilter(type)} className={`tab-btn ${filter === type ? 'active' : ''}`}>{type}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 18 }}>
          <SectionCard title="✈️ Visit List" action={<span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{filtered.length} visits</span>}>
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
                  {filtered.map(visit => {
                    const s = statusMap[visit.status] || statusMap.Upcoming
                    const tc = typeColors[visit.type] || '#2563EB'
                    return (
                      <tr key={visit.id} onClick={() => setSelected(visit)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 24 }}>{visit.flag}</span>
                            <div>
                              <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{visit.institution}</p>
                              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={11} /> {visit.country}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{visit.date ? new Date(visit.date).toLocaleDateString('en-GB') : ''}</td>
                        <td>
                          <span style={{ background: `${tc}15`, color: tc, border: `1px solid ${tc}30`, padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                            {visit.type}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600 }}>
                            {visit.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={e => { e.stopPropagation(); setSelected(visit) }} className="btn-ghost" style={{ padding: '5px 11px', fontSize: 12 }}>View</button>
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
                  <button className="btn-danger" onClick={() => handleDeleteVisit(selected)} style={{ padding: '5px 10px', fontSize: 12 }}><Trash2 size={13} /></button>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #EFF3FB 0%, #E8EEFF 100%)', padding: '24px 20px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 52 }}>{selected.flag}</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 10, fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>{selected.institution}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <MapPin size={12} /> {selected.country}
                </p>
                <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <span style={{ background: `${typeColors[selected.type] || '#2563EB'}15`, color: typeColors[selected.type] || '#2563EB', border: `1px solid ${typeColors[selected.type] || '#2563EB'}30`, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                    {selected.type}
                  </span>
                  <span style={{ background: statusMap[selected.status]?.bg || '#DBEAFE', color: statusMap[selected.status]?.color || '#1E40AF', border: `1px solid ${statusMap[selected.status]?.border || '#BFDBFE'}`, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                    {selected.status}
                  </span>
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: '#F8FAFF', border: '1px solid var(--border)' }}>
                    <Calendar size={14} color="#2563EB" />
                    <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500, flex: 1 }}>Date</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{selected.date ? new Date(selected.date).toLocaleDateString('en-GB') : ''}</span>
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 10 }}>Participants</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {participants.map(participant => (
                      <div key={participant.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 8, background: '#F0F4FF', border: '1px solid rgba(37,99,235,0.12)' }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                          {participant.fullName.charAt(0)}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{participant.fullName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8 }}>Agenda</p>
                  <textarea className="nx-input" defaultValue={selected.agenda} rows={3} style={{ width: '100%', resize: 'none', fontSize: 13 }} />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 10 }}>Documents</p>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10 }}>Document uploads are managed through the documents module.</p>
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
                <input className="nx-input" placeholder="e.g. University of Oxford" value={newVisit.institutionName} onChange={e => setNewVisit(prev => ({ ...prev, institutionName: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Country / Location</label>
                  <input className="nx-input" placeholder="e.g. United Kingdom" value={newVisit.location} onChange={e => setNewVisit(prev => ({ ...prev, location: e.target.value }))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Date</label>
                  <input className="nx-input" type="date" value={newVisit.visitDate} onChange={e => setNewVisit(prev => ({ ...prev, visitDate: e.target.value }))} style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Visit Type</label>
                <select className="nx-input" style={{ width: '100%' }} value={newVisit.type} onChange={e => setNewVisit(prev => ({ ...prev, type: e.target.value }))}>
                  <option value="DELEGATION">Delegation</option>
                  <option value="CAMPUS_VISIT">Campus Visit</option>
                  <option value="PARTNER_MEETING">Partner Meeting</option>
                  <option value="AUDIT">Audit</option>
                  <option value="CEREMONY">Ceremony</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Agenda</label>
                <textarea className="nx-input" placeholder="Visit agenda and objectives..." rows={3} value={newVisit.agenda} onChange={e => setNewVisit(prev => ({ ...prev, agenda: e.target.value }))} style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <div className="upload-zone">
                <UploadCloud size={22} color="#2563EB" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Upload Visit Documents</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Reports, itineraries, photos</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleCreateVisit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Visit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

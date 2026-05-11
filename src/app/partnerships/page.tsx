'use client'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { SectionCard, Badge, StatMini } from '@/components/ui'
import {
  countryApi,
  getTenantId,
  partnershipApi,
  type CountryRecord,
  type PartnershipRecord,
} from '@/lib/api'
import {
  Plus, Search, Download, Eye, X, FileText, UploadCloud,
  Users, ChevronLeft, Calendar, MapPin, Edit3, Trash2,
} from 'lucide-react'

interface PartnershipView {
  id: string
  university: string
  country: string
  flag: string
  type: string
  status: string
  startYear: number
  expiryYear: number
  moU: boolean
  students: number
  renewalDays?: number
  notes?: string
  startDate?: string
  expiryDate?: string
}

const defaultNewPartnership = {
  universityName: '',
  countryCode: '',
  partnershipType: '',
  status: 'ACTIVE',
  startDate: '',
  expiryDate: '',
  mouSigned: true,
  renewalAlertDays: 90,
  notes: '',
}

function mapPartnership(record: PartnershipRecord, countries: CountryRecord[]): PartnershipView {
  const country = countries.find(item => item.code === record.countryCode)
  return {
    id: record.id,
    university: record.universityName ?? '',
    country: country?.name ?? record.countryCode ?? '',
    flag: country?.flagEmoji ?? '🌍',
    type: record.partnershipType ?? '',
    status: record.status ? record.status.charAt(0) + record.status.slice(1).toLowerCase() : 'Pending',
    startYear: record.startDate ? new Date(record.startDate).getFullYear() : new Date().getFullYear(),
    expiryYear: record.expiryDate ? new Date(record.expiryDate).getFullYear() : new Date().getFullYear(),
    moU: Boolean(record.mouSigned),
    students: 0,
    renewalDays: record.renewalAlertDays ?? undefined,
    notes: record.notes ?? undefined,
    startDate: record.startDate ?? undefined,
    expiryDate: record.expiryDate ?? undefined,
  }
}

export default function PartnershipsPage() {
  const tenantId = getTenantId() ?? undefined
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selected, setSelected] = useState<PartnershipView | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [countries, setCountries] = useState<CountryRecord[]>([])
  const [partnerships, setPartnerships] = useState<PartnershipView[]>([])
  const [saving, setSaving] = useState(false)
  const [newPartnership, setNewPartnership] = useState(defaultNewPartnership)

  useEffect(() => {
    let cancelled = false

    async function fetchPartnerships() {
      setLoading(true)
      try {
        const [countryList, partnershipPage] = await Promise.all([
          countryApi.list(),
          partnershipApi.list({ tenantId, limit: 500 }),
        ])
        if (cancelled) return
        setCountries(countryList)
        setPartnerships((partnershipPage.content ?? []).map(item => mapPartnership(item, countryList)))
      } catch (error) {
        console.error('Failed to fetch partnerships', error)
        if (!cancelled) {
          setPartnerships([])
          setCountries([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPartnerships()
    return () => {
      cancelled = true
    }
  }, [tenantId])

  const statuses = ['All', 'Active', 'Expiring', 'Expired', 'Pending']

  const filtered = useMemo(() => partnerships.filter(partnership => {
    const matchSearch = partnership.university.toLowerCase().includes(search.toLowerCase()) ||
      partnership.country.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || partnership.status === statusFilter
    return matchSearch && matchStatus
  }), [search, statusFilter, partnerships])

  async function handleCreatePartnership() {
    setSaving(true)
    try {
      const created = await partnershipApi.create({
        tenantId,
        universityName: newPartnership.universityName,
        countryCode: newPartnership.countryCode,
        partnershipType: newPartnership.partnershipType || null,
        status: newPartnership.status,
        startDate: newPartnership.startDate || null,
        expiryDate: newPartnership.expiryDate || null,
        mouSigned: newPartnership.mouSigned,
        renewalAlertDays: newPartnership.renewalAlertDays,
        notes: newPartnership.notes || null,
      })

      const mapped = mapPartnership(created, countries)
      setPartnerships(prev => [...prev, mapped])
      setShowAddModal(false)
      setNewPartnership(defaultNewPartnership)
    } catch (error) {
      console.error('Create partnership failed', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeletePartnership(partnership: PartnershipView) {
    try {
      await partnershipApi.delete(partnership.id)
      setPartnerships(prev => prev.filter(item => item.id !== partnership.id))
      if (selected?.id === partnership.id) {
        setSelected(null)
      }
    } catch (error) {
      console.error('Delete partnership failed', error)
    }
  }

  const totalStudents = partnerships.reduce((sum, item) => sum + item.students, 0)

  return (
    <AppShell>
      <Topbar
        title="Partnerships"
        subtitle={loading ? 'Loading partnership records...' : `${partnerships.length} total university partnerships worldwide`}
        actions={
          <>
            <button className="btn-ghost" style={{ fontSize: 13 }}><Download size={14} /> Export</button>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}><Plus size={14} /> Add Partnership</button>
          </>
        }
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatMini label="Total Partnerships" value={partnerships.length} color="#2563EB" />
          <StatMini label="Active" value={partnerships.filter(item => item.status === 'Active').length} color="#059669" />
          <StatMini label="Expiring Soon" value={partnerships.filter(item => item.status === 'Expiring').length} color="#D97706" />
          <StatMini label="Total Students" value={totalStudents} color="#7C3AED" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 18 }}>
          <SectionCard
            title="🤝 All Partnerships"
            action={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="nx-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30, fontSize: 13, height: 36, padding: '0 12px 0 30px', width: 200 }} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {statuses.map(status => (
                    <button key={status} onClick={() => setStatusFilter(status)} className={`tab-btn ${statusFilter === status ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: 12 }}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Partner University</th>
                    <th style={{ textAlign: 'left' }} className="hide-mobile">Country</th>
                    <th style={{ textAlign: 'left' }} className="hide-mobile">Type</th>
                    <th style={{ textAlign: 'center' }}>Duration</th>
                    <th style={{ textAlign: 'center' }}>Students</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(partnership => (
                    <tr key={partnership.id} onClick={() => setSelected(partnership)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 22 }}>{partnership.flag}</span>
                          <div>
                            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{partnership.university}</p>
                            <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                              {partnership.moU ? '✅ MoU Signed' : '⚠️ MoU Pending'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hide-mobile">{partnership.country}</td>
                      <td className="hide-mobile" style={{ fontSize: 12.5 }}>
                        <span style={{ background: '#EFF3FB', color: '#4A5578', padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>{partnership.type}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {partnership.startYear} – {partnership.expiryYear}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                          <Users size={13} color="#8593A8" />
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{partnership.students}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}><Badge status={partnership.status} /></td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={e => { e.stopPropagation(); setSelected(partnership) }} className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}>
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  No partnerships match your search.
                </div>
              )}
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
                  <button className="btn-danger" onClick={() => handleDeletePartnership(selected)} style={{ padding: '5px 10px', fontSize: 12 }}><Trash2 size={13} /></button>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #EFF3FB 0%, #E8EEFF 100%)', padding: '24px 20px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 52 }}>{selected.flag}</span>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginTop: 10, fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
                  {selected.university}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <MapPin size={12} /> {selected.country}
                </p>
                <div style={{ marginTop: 12 }}><Badge status={selected.status} /></div>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Partnership Type', value: selected.type },
                    { label: 'Duration', value: `${selected.startYear} – ${selected.expiryYear}` },
                    { label: 'MoU Signed', value: selected.moU ? '✅ Yes' : '⚠️ Pending' },
                    { label: 'Active Students', value: `${selected.students} students` },
                    ...(selected.renewalDays ? [{ label: '🔔 Renewal Alert', value: `${selected.renewalDays} days remaining` }] : []),
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: '#F8FAFF', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '16px', borderRadius: 12, background: '#F0F4FF', border: '1px solid rgba(37,99,235,0.15)', marginBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#2563EB', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={13} /> Agreement Details
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" style={{ flex: 1, fontSize: 12, justifyContent: 'center', padding: '8px 0' }}>
                      <FileText size={13} /> Download MoU
                    </button>
                    <button className="btn-ghost" style={{ flex: 1, fontSize: 12, justifyContent: 'center', padding: '8px 0' }}>
                      <UploadCloud size={13} /> Upload New
                    </button>
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                    📅 Last Updated: {selected.expiryDate ? new Date(selected.expiryDate).toLocaleDateString('en-GB') : 'N/A'}
                  </p>
                </div>

                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                  Manage Partnership
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
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Add New Partnership</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>University Name</label>
                <input className="nx-input" placeholder="e.g. University of Oxford" value={newPartnership.universityName} onChange={e => setNewPartnership(prev => ({ ...prev, universityName: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Country Code</label>
                  <input className="nx-input" placeholder="e.g. GB" value={newPartnership.countryCode} onChange={e => setNewPartnership(prev => ({ ...prev, countryCode: e.target.value.toUpperCase() }))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Partnership Type</label>
                  <input className="nx-input" placeholder="e.g. Academic Exchange" value={newPartnership.partnershipType} onChange={e => setNewPartnership(prev => ({ ...prev, partnershipType: e.target.value }))} style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Start Date</label>
                  <input className="nx-input" type="date" value={newPartnership.startDate} onChange={e => setNewPartnership(prev => ({ ...prev, startDate: e.target.value }))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Expiry Date</label>
                  <input className="nx-input" type="date" value={newPartnership.expiryDate} onChange={e => setNewPartnership(prev => ({ ...prev, expiryDate: e.target.value }))} style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Renewal Alert Days</label>
                <input className="nx-input" type="number" min={0} value={newPartnership.renewalAlertDays} onChange={e => setNewPartnership(prev => ({ ...prev, renewalAlertDays: Number(e.target.value) }))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Notes</label>
                <textarea className="nx-input" placeholder="Additional notes..." rows={3} value={newPartnership.notes} onChange={e => setNewPartnership(prev => ({ ...prev, notes: e.target.value }))} style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <div className="upload-zone">
                <UploadCloud size={24} color="#2563EB" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Upload MoU Document</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PDF, DOC up to 10MB</p>
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleCreatePartnership} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Partnership'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

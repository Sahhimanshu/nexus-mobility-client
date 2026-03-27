'use client'
import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { SectionCard, Badge, StatMini } from '@/components/ui'
import { partnerships, Partnership } from '@/lib/data'
import {
  Plus, Search, Download, Eye, X, FileText, UploadCloud,
  Users, ChevronLeft, Calendar, MapPin, Link2, Edit3, Trash2
} from 'lucide-react'

export default function PartnershipsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selected, setSelected] = useState<Partnership | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const statuses = ['All', 'Active', 'Expiring', 'Expired']

  const filtered = partnerships.filter(p => {
    const matchSearch = p.university.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <AppShell>
      <Topbar
        title="Partnerships"
        subtitle={`${partnerships.length} total university partnerships worldwide`}
        actions={
          <>
            <button className="btn-ghost" style={{ fontSize: 13 }}><Download size={14} /> Export</button>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}><Plus size={14} /> Add Partnership</button>
          </>
        }
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">

        {/* Stats Row */}
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatMini label="Total Partnerships" value={partnerships.length} color="#2563EB" />
          <StatMini label="Active" value={partnerships.filter(p => p.status === 'Active').length} color="#059669" />
          <StatMini label="Expiring Soon" value={partnerships.filter(p => p.status === 'Expiring').length} color="#D97706" />
          <StatMini label="Expired" value={partnerships.filter(p => p.status === 'Expired').length} color="#DC2626" />
        </div>

        {/* List + Detail split */}
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 18 }}>

          {/* List */}
          <SectionCard
            title="🤝 All Partnerships"
            action={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="nx-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 30, fontSize: 13, height: 36, padding: '0 12px 0 30px', width: 200 }} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {statuses.map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`tab-btn ${statusFilter === s ? 'active' : ''}`}
                      style={{ padding: '6px 12px', fontSize: 12 }}>{s}</button>
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
                  {filtered.map(p => (
                    <tr key={p.id} onClick={() => setSelected(p)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 22 }}>{p.flag}</span>
                          <div>
                            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{p.university}</p>
                            <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                              {p.moU ? '✅ MoU Signed' : '⚠️ MoU Pending'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hide-mobile">{p.country}</td>
                      <td className="hide-mobile" style={{ fontSize: 12.5 }}>
                        <span style={{ background: '#EFF3FB', color: '#4A5578', padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>{p.type}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {p.startYear} – {p.expiryYear}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                          <Users size={13} color="#8593A8" />
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.students}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}><Badge status={p.status} /></td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={e => { e.stopPropagation(); setSelected(p) }}
                          className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}>
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

          {/* Detail Panel */}
          {selected && (
            <div className="glass-card" style={{ overflow: 'hidden', animation: 'slideUp 0.25s ease' }}>
              {/* Header */}
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

              {/* University Hero */}
              <div style={{
                background: 'linear-gradient(135deg, #EFF3FB 0%, #E8EEFF 100%)',
                padding: '24px 20px',
                textAlign: 'center',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 52 }}>{selected.flag}</span>
                <h3 style={{
                  fontSize: 17, fontWeight: 800, color: 'var(--text-primary)',
                  marginTop: 10, fontFamily: 'var(--font-display)', lineHeight: 1.3
                }}>{selected.university}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <MapPin size={12} /> {selected.country}
                </p>
                <div style={{ marginTop: 12 }}><Badge status={selected.status} /></div>
              </div>

              {/* Details */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Partnership Type', value: selected.type },
                    { label: 'Duration', value: `Jan ${selected.startYear} – Dec ${selected.expiryYear}` },
                    { label: 'MoU Signed', value: selected.moU ? '✅ Yes' : '⚠️ Pending' },
                    { label: 'Active Students', value: `${selected.students} students` },
                    ...(selected.renewalDays ? [{ label: '🔔 Renewal Alert', value: `${selected.renewalDays} days remaining` }] : []),
                  ].map(item => (
                    <div key={item.label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', borderRadius: 10, background: '#F8FAFF',
                      border: '1px solid var(--border)',
                    }}>
                      <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Agreement Details */}
                <div style={{
                  padding: '16px', borderRadius: 12, background: '#F0F4FF',
                  border: '1px solid rgba(37,99,235,0.15)', marginBottom: 16
                }}>
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
                    📅 Last Updated: 10 Jan 2024
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

      {/* Add Partnership Modal */}
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
              {[
                { label: 'University Name', placeholder: 'e.g. University of Oxford' },
                { label: 'Country', placeholder: 'e.g. United Kingdom' },
                { label: 'Partnership Type', placeholder: 'e.g. Academic Exchange' },
              ].map(field => (
                <div key={field.label}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{field.label}</label>
                  <input className="nx-input" placeholder={field.placeholder} style={{ width: '100%' }} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Start Date</label>
                  <input className="nx-input" type="date" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Expiry Date</label>
                  <input className="nx-input" type="date" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Notes</label>
                <textarea className="nx-input" placeholder="Additional notes..." rows={3} style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <div className="upload-zone">
                <UploadCloud size={24} color="#2563EB" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Upload MoU Document</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PDF, DOC up to 10MB</p>
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Partnership</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

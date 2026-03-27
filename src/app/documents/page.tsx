'use client'
import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { SectionCard, Badge, StatMini } from '@/components/ui'
import { documents, Document } from '@/lib/data'
import { Upload, Search, FileText, Download, Trash2, Eye, UploadCloud } from 'lucide-react'

const typeIcons: Record<string, string> = {
  'MoU': '📄', 'Contract': '📋', 'Student Form': '📝',
}

const typeColors: Record<string, string> = {
  'MoU': '#2563EB', 'Contract': '#7C3AED', 'Student Form': '#059669',
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  const types = ['All', 'MoU', 'Contract', 'Student Form']
  const filtered = documents.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.relatedTo.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'All' || d.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <AppShell>
      <Topbar
        title="Documents"
        subtitle="MoUs, contracts, and student agreements"
        actions={
          <button className="btn-primary" style={{ fontSize: 13 }}><UploadCloud size={14} /> Upload Document</button>
        }
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">

        {/* Stats */}
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatMini label="Total Documents" value={documents.length} color="#2563EB" />
          <StatMini label="Verified" value={documents.filter(d => d.status === 'Verified').length} color="#059669" />
          <StatMini label="Pending Review" value={documents.filter(d => d.status === 'Pending').length} color="#D97706" />
          <StatMini label="Expired" value={documents.filter(d => d.status === 'Expired').length} color="#DC2626" />
        </div>

        {/* Upload Zone */}
        <div className="upload-zone">
          <UploadCloud size={30} color="#2563EB" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Drop files here or click to upload</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Supports PDF, DOCX, XLSX — Max 20MB per file</p>
          <button className="btn-primary" style={{ margin: '14px auto 0', display: 'flex', fontSize: 13 }}>
            <Upload size={14} /> Browse Files
          </button>
        </div>

        {/* Documents Table */}
        <SectionCard
          title="📁 All Documents"
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="nx-input" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 30, fontSize: 13, height: 36, padding: '0 12px 0 30px', width: 200 }} />
              </div>
              {types.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`tab-btn ${typeFilter === t ? 'active' : ''}`}
                  style={{ padding: '6px 12px', fontSize: 12 }}>{t}</button>
              ))}
            </div>
          }
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Document</th>
                  <th style={{ textAlign: 'left' }}>Type</th>
                  <th style={{ textAlign: 'left' }}>Related To</th>
                  <th style={{ textAlign: 'left' }} className="hide-mobile">Uploaded By</th>
                  <th style={{ textAlign: 'center' }}>Date</th>
                  <th style={{ textAlign: 'center' }}>Size</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => {
                  const tc = typeColors[doc.type] || '#2563EB'
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                            background: `${tc}12`, border: `1px solid ${tc}25`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18,
                          }}>{typeIcons[doc.type] || '📄'}</div>
                          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{doc.name}</p>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          background: `${tc}15`, color: tc, border: `1px solid ${tc}30`,
                          fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 5,
                        }}>{doc.type}</span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{doc.relatedTo}</td>
                      <td className="hide-mobile" style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{doc.uploadedBy}</td>
                      <td style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>{doc.date}</td>
                      <td style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)' }}>{doc.size}</td>
                      <td style={{ textAlign: 'center' }}><Badge status={doc.status} /></td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                          <button className="btn-ghost" style={{ padding: '5px 9px', fontSize: 12 }}><Eye size={13} /></button>
                          <button className="btn-ghost" style={{ padding: '5px 9px', fontSize: 12 }}><Download size={13} /></button>
                          <button className="btn-danger" style={{ padding: '5px 9px', fontSize: 12 }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                No documents match your search.
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  )
}

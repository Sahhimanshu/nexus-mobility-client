'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { SectionCard, Badge, StatMini } from '@/components/ui'
import { documentApi, getTenantId, type DocumentRecord } from '@/lib/api'
import { getErrorMessage } from '@/lib/error'
import { Upload, Search, FileText, Download, Trash2, Eye, UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'

const typeIcons: Record<string, string> = {
  MOU: '📄',
  CONTRACT: '📋',
  AGREEMENT: '📝',
  POLICY: '📑',
  REPORT: '📘',
  OTHER: '📄',
}

const typeColors: Record<string, string> = {
  MOU: '#2563EB',
  CONTRACT: '#7C3AED',
  AGREEMENT: '#059669',
  POLICY: '#D97706',
  REPORT: '#0891B2',
  OTHER: '#64748B',
}

function formatSize(bytes: number) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let idx = 0
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024
    idx += 1
  }
  return `${size.toFixed(size >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`
}

function mapDocument(record: DocumentRecord) {
  return {
    id: record.id,
    name: record.originalFilename,
    type: record.type,
    relatedTo: record.programId ? `Program ${record.programId.slice(0, 8)}` : record.partnershipId ? `Partnership ${record.partnershipId.slice(0, 8)}` : 'General',
    uploadedBy: 'System',
    date: record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-GB') : '',
    size: formatSize(record.sizeBytes),
    status: 'Verified',
    url: documentApi.downloadUrl(record.id),
  }
}

export default function DocumentsPage() {
  const tenantId = getTenantId() ?? undefined
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [documents, setDocuments] = useState<Array<ReturnType<typeof mapDocument>>>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState('MOU')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadDocuments() {
      setLoading(true)
      try {
        const records = await documentApi.list({ tenantId })
        if (!cancelled) setDocuments(records.map(mapDocument))
      } catch (error) {
        toast.error(getErrorMessage(error))
        if (!cancelled) setDocuments([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDocuments()
    return () => {
      cancelled = true
    }
  }, [tenantId])

  const types = ['All', 'MOU', 'CONTRACT', 'AGREEMENT', 'POLICY', 'REPORT', 'OTHER']

  const filtered = useMemo(() => documents.filter(doc => {
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.relatedTo.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'All' || doc.type === typeFilter
    return matchSearch && matchType
  }), [documents, search, typeFilter])

  async function handleUpload() {
    if (!uploadFile) return
    setUploading(true)
    try {
      const created = await documentApi.upload({
        tenantId,
        file: uploadFile,
        type: uploadType,
      })
      setDocuments(prev => [mapDocument(created), ...prev])
      setShowUploadModal(false)
      setUploadFile(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await documentApi.delete(id)
      setDocuments(prev => prev.filter(doc => doc.id !== id))
      toast.success('Document deleted')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <AppShell>
      <Topbar
        title="Documents"
        subtitle={loading ? 'Loading document vault...' : 'MoUs, contracts, and student agreements'}
        actions={
          <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setShowUploadModal(true)}>
            <UploadCloud size={14} /> Upload Document
          </button>
        }
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatMini label="Total Documents" value={documents.length} color="#2563EB" />
          <StatMini label="Verified" value={documents.filter(doc => doc.status === 'Verified').length} color="#059669" />
          <StatMini label="Pending Review" value={documents.filter(doc => doc.status === 'Pending').length} color="#D97706" />
          <StatMini label="Expired" value={documents.filter(doc => doc.status === 'Expired').length} color="#DC2626" />
        </div>

        <div className="upload-zone" onClick={() => setShowUploadModal(true)}>
          <UploadCloud size={30} color="#2563EB" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Drop files here or click to upload</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Supports PDF, DOCX, XLSX · Max 20MB per file</p>
          <button className="btn-primary" style={{ margin: '14px auto 0', display: 'flex', fontSize: 13 }}>
            <Upload size={14} /> Browse Files
          </button>
        </div>

        <SectionCard
          title="📁 All Documents"
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="nx-input" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30, fontSize: 13, height: 36, padding: '0 12px 0 30px', width: 200 }} />
              </div>
              {types.map(type => (
                <button key={type} onClick={() => setTypeFilter(type)} className={`tab-btn ${typeFilter === type ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: 12 }}>
                  {type}
                </button>
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
                          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${tc}12`, border: `1px solid ${tc}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                            {typeIcons[doc.type] || '📄'}
                          </div>
                          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{doc.name}</p>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: `${tc}15`, color: tc, border: `1px solid ${tc}30`, fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 5 }}>
                          {doc.type}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{doc.relatedTo}</td>
                      <td className="hide-mobile" style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{doc.uploadedBy}</td>
                      <td style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>{doc.date}</td>
                      <td style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)' }}>{doc.size}</td>
                      <td style={{ textAlign: 'center' }}><Badge status={doc.status} /></td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <button className="btn-ghost" style={{ padding: '5px 9px', fontSize: 12 }}><Download size={13} /></button>
                          </a>
                          <button className="btn-ghost" style={{ padding: '5px 9px', fontSize: 12 }}><Eye size={13} /></button>
                          <button className="btn-danger" onClick={() => handleDelete(doc.id)} style={{ padding: '5px 9px', fontSize: 12 }}><Trash2 size={13} /></button>
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

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Upload Document</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>File</label>
                <input ref={fileInputRef} className="nx-input" type="file" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Document Type</label>
                <select className="nx-input" value={uploadType} onChange={e => setUploadType(e.target.value)} style={{ width: '100%' }}>
                  {types.filter(type => type !== 'All').map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="upload-zone">
                <UploadCloud size={24} color="#2563EB" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Upload to tenant vault</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Document records are stored through the backend document API.</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

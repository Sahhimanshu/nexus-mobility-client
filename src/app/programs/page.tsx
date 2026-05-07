'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { SectionCard, ProgressBar, StatMini } from '@/components/ui'
import { Program } from '@/lib/data'
import { programApi } from '@/lib/api'
import {
  Plus, Search, Award, Users, Calendar, X, Settings,
  Edit3, Trash2, ChevronLeft, BookOpen, MapPin,
  GripVertical, ChevronUp, ChevronDown, Check, AlertCircle, Save, Eye, EyeOff
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
const PROGRAM_TYPES = [
  'SEMESTER_EXCHANGE',
  'SUMMER_SCHOOL',
  'JOINT_DEGREE',
  'RESEARCH_FELLOWSHIP',
  'INTERNSHIP'
] as const

type ProgramType = typeof PROGRAM_TYPES[number]

const FIELD_TYPES   = ['Text', 'Number', 'Dropdown', 'Date', 'File', 'Checkbox'] as const
type FieldType = typeof FIELD_TYPES[number]

const typeColors: Record<string, string> = {
  'Semester Exchange': '#2563EB', 'Summer School': '#D97706',
  'Joint Degree': '#7C3AED', 'Research Fellowship': '#059669', 'Internship': '#DB2777',
}

/** One configurable column in the Programs table */
interface ColDef {
  id: string
  heading: string      // label the user sees in <th> and in modals
  fieldKey: keyof Program | 'fillRate'   // which program field to render
  visible: boolean
  required: boolean    // cannot be deleted (core field)
}

/** One configurable field in the Student Enrollment form */
interface FieldDef {
  id: string
  heading: string
  fieldKey: string
  type: FieldType
  required: boolean
  options: string
  visible: boolean
}

// ─────────────────────────────────────────────────────────────
// Default configs
// ─────────────────────────────────────────────────────────────
const defaultColumns: ColDef[] = [
  { id: 'c1', heading: 'Program Name',        fieldKey: 'name',                 visible: true,  required: true  },
  { id: 'c2', heading: 'Partner University',   fieldKey: 'partnerUniversity',    visible: true,  required: true  },
  { id: 'c3', heading: 'Country',              fieldKey: 'country',              visible: true,  required: false },
  { id: 'c4', heading: 'Type',                 fieldKey: 'type',                 visible: true,  required: false },
  { id: 'c5', heading: 'Seats',                fieldKey: 'seats',                visible: true,  required: false },
  { id: 'c6', heading: 'Deadline',             fieldKey: 'deadline',             visible: true,  required: false },
  { id: 'c7', heading: 'Duration',             fieldKey: 'duration',             visible: true,  required: false },
  { id: 'c8', heading: 'Scholarship',          fieldKey: 'scholarshipAvailable', visible: true,  required: false },
  { id: 'c9', heading: 'Fill Rate',            fieldKey: 'fillRate',             visible: true,  required: false },
]

const defaultStudentFields: FieldDef[] = [
  { id: 'f1', heading: 'Student Name',  fieldKey: 'student_name',  type: 'Text',     required: true,  options: '', visible: true },
  { id: 'f2', heading: 'Enrollment No', fieldKey: 'enrollment_no', type: 'Number',   required: true,  options: '', visible: true },
  { id: 'f3', heading: 'Passport No',   fieldKey: 'passport_no',   type: 'Text',     required: false, options: '', visible: true },
  { id: 'f4', heading: 'Visa Status',   fieldKey: 'visa_status',   type: 'Dropdown', required: true,  options: 'Approved,Pending,Rejected,Not Applied', visible: true },
  { id: 'f5', heading: 'Host Country',  fieldKey: 'host_country',  type: 'Dropdown', required: true,  options: 'UK,USA,Germany,France,Singapore,Japan,Switzerland,Australia', visible: true },
]

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function genId(prefix = 'x') { return prefix + Math.random().toString(36).slice(2, 8) }

function blankProgram(): Omit<Program, 'id'> {
  return {
    name: '',
    type: 'SEMESTER_EXCHANGE',
    partnerUniversity: '',
    country: '',
    seats: 20,
    enrolled: 0,
    deadline: new Date().toISOString().split('T')[0],
    duration: '1 Semester',
    scholarshipAvailable: false
  }
}

// ─────────────────────────────────────────────────────────────
// InlineEdit – click-to-rename component
// ─────────────────────────────────────────────────────────────
function InlineEdit({ value, onSave, size = 'md' }: { value: string; onSave: (v: string) => void; size?: 'sm' | 'md' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const fs = size === 'sm' ? 12.5 : 13.5

  if (!editing) return (
    <span onClick={() => { setDraft(value); setEditing(true) }}
      title="Click to rename"
      style={{ cursor: 'text', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: fs, fontWeight: 700, color: 'var(--text-primary)' }}>
      {value}
      <Edit3 size={10} style={{ opacity: 0.3, flexShrink: 0 }} />
    </span>
  )
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <input autoFocus value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { onSave(draft.trim() || value); setEditing(false) }}
        onKeyDown={e => {
          if (e.key === 'Enter') { onSave(draft.trim() || value); setEditing(false) }
          if (e.key === 'Escape') setEditing(false)
        }}
        style={{ fontSize: fs - 1, fontWeight: 700, color: 'var(--text-primary)', border: '1.5px solid #2563EB', borderRadius: 6, padding: '3px 8px', outline: 'none', background: '#EFF6FF', width: 150 }} />
      <button onClick={() => { onSave(draft.trim() || value); setEditing(false) }}
        style={{ background: '#2563EB', border: 'none', borderRadius: 5, padding: '4px 6px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
        <Check size={10} />
      </button>
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// Cell renderer – renders a program field by key
// ─────────────────────────────────────────────────────────────
function formatProgramType(type: ProgramType) {
  return type
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function ProgramCell({ col, prog }: { col: ColDef; prog: Program }) {
  const tc = typeColors[prog.type] || '#2563EB'
  switch (col.fieldKey) {
    case 'name':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: `${tc}12`, border: `1px solid ${tc}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={15} color={tc} />
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{prog.name}</span>
        </div>
      )
    case 'partnerUniversity':
      return <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{prog.partnerUniversity}</span>
    case 'country':
      return <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{prog.country}</span>
    case 'type':
      return <span style={{ background: `${tc}15`, color: tc, border: `1px solid ${tc}30`, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, whiteSpace: 'nowrap' }}>{formatProgramType(prog.type)}</span>
    case 'seats':
      return <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Users size={12} color="#8593A8" /><span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{prog.enrolled}/{prog.seats}</span></span>
    case 'deadline':
      return <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Calendar size={12} color="#8593A8" /><span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{new Date(prog.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</span></span>
    case 'duration':
      return <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{prog.duration}</span>
    case 'scholarshipAvailable':
      return prog.scholarshipAvailable
        ? <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5 }}>✓ Yes</span>
        : <span style={{ background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5 }}>No</span>
    case 'fillRate':
      return <div style={{ minWidth: 90 }}><ProgressBar value={prog.enrolled} max={prog.seats} color={tc} /></div>
    default:
      return <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>—</span>
  }
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function ProgramsPage() {
  // programs state
  useEffect(() => {

    async function fetchPrograms() {

      try {

        const data = await programApi.list({
          tenantId: "75138fb1-fad9-4322-9153-2d47ecae2daa"
        });

        const list = data?.content || [];

        const mapped: Program[] = list.map(p => ({
          id: p.id,
          name: p.name,
          partnerUniversity: p.partnerUniversity ?? '',
          country: p.countryCode ?? '',
          type: p.type as ProgramType,
          seats: p.seats ?? 0,
          enrolled: p.enrolled ?? 0,
          deadline: p.deadline ?? '',
          duration: p.durationLabel ?? '',
          scholarshipAvailable: p.scholarshipAvailable ?? false
        }))

        setPrograms(mapped);

      } catch (err) {

        console.error(err);
        setPrograms([]);
      }
    }

    fetchPrograms();

  }, []);

  const [programs, setPrograms] = useState<Program[]>([])
  const [search, setSearch]                   = useState('')
  const [typeFilter, setTypeFilter]           = useState('All')
  const [activeTab, setActiveTab]             = useState<'programs' | 'config'>('programs')
  const [selected, setSelected]               = useState<Program | null>(null)

  // program CRUD
  const [showAddProgram, setShowAddProgram]   = useState(false)
  const [newProgram, setNewProgram]           = useState<Omit<Program, 'id'>>(blankProgram())
  const [addError, setAddError]               = useState('')
  const [editingProgram, setEditingProgram]   = useState<Program | null>(null)
  const [editError, setEditError]             = useState('')
  const [confirmDelete, setConfirmDelete]     = useState<Program | null>(null)

  // ── table column config ──────────────────────────────────────
  const [columns, setColumns]                 = useState<ColDef[]>(defaultColumns)
  const [editingCol, setEditingCol]           = useState<ColDef | null>(null)
  const [showAddCol, setShowAddCol]           = useState(false)
  const [newColHeading, setNewColHeading]     = useState('')
  const [colSaveFlash, setColSaveFlash]       = useState(false)
  const [configSection, setConfigSection]     = useState<'columns' | 'fields'>('columns')

  // ── student field config ─────────────────────────────────────
  const [fields, setFields]                   = useState<FieldDef[]>(defaultStudentFields)
  const [editingField, setEditingField]       = useState<FieldDef | null>(null)
  const [showAddField, setShowAddField]       = useState(false)
  const [newField, setNewField]               = useState<Omit<FieldDef, 'id'>>({ heading: '', fieldKey: '', type: 'Text', required: true, options: '', visible: true })
  const [fieldSaveFlash, setFieldSaveFlash]   = useState(false)

  const types   = ['All', ...PROGRAM_TYPES]
  const visibleCols = columns.filter(c => c.visible)

const filtered = programs.filter(p => {

  const q = search.toLowerCase()

  return (
    (
      (p.name ?? '').toLowerCase().includes(q) ||
      (p.partnerUniversity ?? '').toLowerCase().includes(q)
    ) &&
    (typeFilter === 'All' || p.type === typeFilter)
  )
})

  // get heading for a fieldKey (used in modals so labels rename too)
  function h(key: string) {
    return columns.find(c => c.fieldKey === key)?.heading ?? key
  }

  // ── Column helpers ────────────────────────────────────────────
  function updateCol(id: string, patch: Partial<ColDef>) {
    setColumns(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  }
  function moveCol(id: string, dir: 'up' | 'down') {
    setColumns(prev => {
      const idx = prev.findIndex(c => c.id === id)
      const next = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }
  function deleteCol(id: string) { setColumns(prev => prev.filter(c => c.id !== id)) }
  function addCol() {
    if (!newColHeading.trim()) return
    setColumns(prev => [...prev, { id: genId('c'), heading: newColHeading.trim(), fieldKey: 'name', visible: true, required: false }])
    setNewColHeading('')
    setShowAddCol(false)
  }

function formatProgramType(type: ProgramType) {

  return type
    .toLowerCase()
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
  // ── Field helpers ─────────────────────────────────────────────
  function updateField(id: string, patch: Partial<FieldDef>) { setFields(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f)) }
  function moveField(id: string, dir: 'up' | 'down') {
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === id)
      const next = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }
  function deleteField(id: string) { setFields(prev => prev.filter(f => f.id !== id)) }
  function addStudentField() {
    if (!newField.heading.trim()) return
    const key = newField.fieldKey.trim() || newField.heading.toLowerCase().replace(/\s+/g, '_')
    setFields(prev => [...prev, { ...newField, fieldKey: key, id: genId('f') }])
    setNewField({ heading: '', fieldKey: '', type: 'Text', required: true, options: '', visible: true })
    setShowAddField(false)
  }

  // ── Program CRUD ─────────────────────────────────────────────
async function handleAddProgram() {

  if (!newProgram.name.trim()) {
    setAddError(`${h('name')} is required.`)
    return
  }

  if (!newProgram.partnerUniversity.trim()) {
    setAddError(`${h('partnerUniversity')} is required.`)
    return
  }

  if (!newProgram.country.trim()) {
    setAddError(`${h('country')} is required.`)
    return
  }

  if (newProgram.seats < 1) {
    setAddError(`${h('seats')} must be at least 1.`)
    return
  }

  try {

    const payload = {
      name: newProgram.name,
      partnerUniversity: newProgram.partnerUniversity,
      countryCode: newProgram.country,
      type: newProgram.type,
      seats: newProgram.seats,
      enrolled: newProgram.enrolled,
      deadline: newProgram.deadline,
      durationLabel: newProgram.duration,
      scholarshipAvailable: newProgram.scholarshipAvailable
    }

    const created = await programApi.create(payload)

    const mappedProgram: Program = {
      id: created.id,
      name: created.name,
      partnerUniversity: created.partnerUniversity ?? '',
      country: created.countryCode ?? '',
      type: created.type as ProgramType,
      seats: created.seats ?? 0,
      enrolled: created.enrolled ?? 0,
      deadline: created.deadline ?? '',
      duration: created.durationLabel ?? '',
      scholarshipAvailable: created.scholarshipAvailable ?? false
    }

    setPrograms(prev => [...prev, mappedProgram])

    setNewProgram(blankProgram())
    setAddError('')
    setShowAddProgram(false)

  } catch (err) {

    console.error('Failed to create program', err)
    setAddError('Failed to create program.')
  }
}
async function handleSaveEdit() {

  if (!editingProgram) return

  if (!editingProgram.name.trim()) {
    setEditError(`${h('name')} is required.`)
    return
  }

  if (!editingProgram.partnerUniversity.trim()) {
    setEditError(`${h('partnerUniversity')} is required.`)
    return
  }

  if (!editingProgram.country.trim()) {
    setEditError(`${h('country')} is required.`)
    return
  }

  if (editingProgram.seats < 1) {
    setEditError(`${h('seats')} must be at least 1.`)
    return
  }

  try {

    const payload = {
      name: editingProgram.name,
      partnerUniversity: editingProgram.partnerUniversity,
      countryCode: editingProgram.country,
      type: editingProgram.type,
      seats: editingProgram.seats,
      enrolled: editingProgram.enrolled,
      deadline: editingProgram.deadline,
      durationLabel: editingProgram.duration,
      scholarshipAvailable: editingProgram.scholarshipAvailable
    }

    const updated = await programApi.update(editingProgram.id, payload)

    const mappedProgram: Program = {
      id: updated.id,
      name: updated.name,
      partnerUniversity: updated.partnerUniversity ?? '',
      country: updated.countryCode ?? '',
      type: updated.type as ProgramType,
      seats: updated.seats ?? 0,
      enrolled: updated.enrolled ?? 0,
      deadline: updated.deadline ?? '',
      duration: updated.durationLabel ?? '',
      scholarshipAvailable: updated.scholarshipAvailable ?? false
    }

    setPrograms(prev =>
      prev.map(p =>
        p.id === editingProgram.id ? mappedProgram : p
      )
    )

    setSelected(mappedProgram)
    setEditingProgram(null)
    setEditError('')

  } catch (err) {

    console.error('Update failed', err)
    setEditError('Failed to update program.')
  }
}
async function handleDelete(prog: Program) {

  try {

    await programApi.delete(prog.id)

    setPrograms(prev =>
      prev.filter(p => p.id !== prog.id)
    )

    if (selected?.id === prog.id) {
      setSelected(null)
    }

    setConfirmDelete(null)

  } catch (err) {

    console.error('Delete failed', err)
  }
}

  // flash helpers
  function flashCol()   { setColSaveFlash(true);   setTimeout(() => setColSaveFlash(false),   2000) }
  function flashField() { setFieldSaveFlash(true);  setTimeout(() => setFieldSaveFlash(false), 2000) }

  // ─────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <Topbar
        title="Student Mobility Programs"
        subtitle="Academic exchange, fellowship, and joint degree programs"
        actions={<button className="btn-primary" onClick={() => setShowAddProgram(true)}><Plus size={14} /> Create Program</button>}
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          <StatMini label="Total Programs"   value={programs.length}                                     color="#2563EB" />
          <StatMini label="Total Seats"      value={programs.reduce((a, p) => a + p.seats, 0)}           color="#059669" />
          <StatMini label="Enrolled"         value={programs.reduce((a, p) => a + p.enrolled, 0)}        color="#7C3AED" />
          <StatMini label="With Scholarship" value={programs.filter(p => p.scholarshipAvailable).length} color="#D97706" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)' }}>
          {([
            { key: 'programs', icon: <BookOpen size={14} />, label: 'Program List' },
            { key: 'config',   icon: <Settings  size={14} />, label: 'Configure Columns & Fields' },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ padding: '10px 20px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: -2, transition: 'all 0.18s', color: activeTab === tab.key ? '#2563EB' : 'var(--text-muted)', borderBottom: activeTab === tab.key ? '2.5px solid #2563EB' : '2.5px solid transparent' }}>
              {tab.icon}{tab.label}
              {tab.key === 'config' && <span style={{ background: '#2563EB', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, marginLeft: 2 }}>{columns.length + fields.length}</span>}
            </button>
          ))}
        </div>

        {/* ══ PROGRAMS TAB ══ */}
        {activeTab === 'programs' && (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 390px' : '1fr', gap: 18 }}>
            <SectionCard
              title={`🌐 Mobility Programs (${filtered.length})`}
              action={
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="nx-input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30, fontSize: 13, height: 34, width: 180 }} />
                  </div>
                  <button className="btn-ghost" title="Configure columns" onClick={() => { setActiveTab('config'); setConfigSection('columns') }}
                    style={{ padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Settings size={13} /> Columns
                  </button>
                </div>
              }
            >
              {/* Type filters */}
              <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {types.map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={`tab-btn ${typeFilter === t ? 'active' : ''}`}
                    style={{ padding: '4px 11px', fontSize: 12 }}>{t}</button>
                ))}
              </div>

              {/* Dynamic table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {visibleCols.map(col => (
                        <th key={col.id} style={{ textAlign: col.fieldKey === 'name' || col.fieldKey === 'partnerUniversity' ? 'left' : 'center', whiteSpace: 'nowrap' }}>
                          {col.heading}
                        </th>
                      ))}
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={visibleCols.length + 1} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 13 }}>No programs found.</td></tr>
                    )}
                    {filtered.map(p => (
                      <tr key={p.id} onClick={() => setSelected(p)} style={{ cursor: 'pointer' }}>
                        {visibleCols.map(col => (
                          <td key={col.id} style={{ textAlign: col.fieldKey === 'name' || col.fieldKey === 'partnerUniversity' ? 'left' : 'center' }}>
                            <ProgramCell col={col} prog={p} />
                          </td>
                        ))}
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                            <button onClick={e => { e.stopPropagation(); setSelected(p) }} className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}>View</button>
                            <button onClick={e => { e.stopPropagation(); setEditingProgram({ ...p }) }} className="btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} title="Edit"><Edit3 size={13} /></button>
                            <button onClick={e => { e.stopPropagation(); setConfirmDelete(p) }} className="btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} title="Delete"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* Detail panel */}
            {selected && (() => {
              const tc = typeColors[selected.type] || '#2563EB'
              return (
                <div className="glass-card" style={{ overflow: 'hidden', animation: 'slideUp 0.22s ease' }}>
                  <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFBFF' }}>
                    <button onClick={() => setSelected(null)} className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}><ChevronLeft size={13} /> Back</button>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => setEditingProgram({ ...selected })}><Edit3 size={12} /> Edit</button>
                      <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => setConfirmDelete(selected)}><Trash2 size={12} /> Delete</button>
                    </div>
                  </div>
                  <div style={{ background: `linear-gradient(135deg,${tc}10 0%,${tc}03 100%)`, padding: '22px 18px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 10px', background: `${tc}18`, border: `1.5px solid ${tc}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={24} color={tc} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>{selected.name}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>{selected.partnerUniversity} · {selected.country}</p>
                    <span style={{ background: `${tc}15`, color: tc, border: `1px solid ${tc}30`, padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, display: 'inline-block', marginTop: 8 }}>{selected.type}</span>
                  </div>
                  <div style={{ padding: '18px' }}>
                    {[
                      { label: h('duration'),             value: selected.duration },
                      { label: h('seats'),                value: `${selected.enrolled} / ${selected.seats} seats` },
                      { label: h('deadline'),             value: new Date(selected.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                      { label: h('scholarshipAvailable'), value: selected.scholarshipAvailable ? '✅ Available' : '❌ Not Available' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 13px', borderRadius: 9, background: '#F8FAFF', border: '1px solid var(--border)', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                      </div>
                    ))}
                    <div style={{ marginBottom: 14, marginTop: 4 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 7 }}>{h('fillRate')}</p>
                      <ProgressBar value={selected.enrolled} max={selected.seats} color={tc} />
                    </div>
                    <button className="btn-primary" onClick={() => setEditingProgram({ ...selected })} style={{ width: '100%', justifyContent: 'center', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Edit3 size={14} /> Edit Program Details
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* ══ CONFIG TAB ══ */}
        {activeTab === 'config' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Config sub-nav */}
            <div style={{ display: 'flex', gap: 8 }}>
              {([
                { key: 'columns', label: '📋 Program Table Columns', count: columns.length },
                { key: 'fields',  label: '📝 Student Enrollment Fields', count: fields.length },
              ] as const).map(s => (
                <button key={s.key} onClick={() => setConfigSection(s.key)}
                  style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 7,
                    background: configSection === s.key ? '#2563EB' : '#fff',
                    color:      configSection === s.key ? '#fff'    : 'var(--text-secondary)',
                    borderColor:configSection === s.key ? '#2563EB' : 'var(--border)',
                  }}>
                  {s.label}
                  <span style={{ background: configSection === s.key ? 'rgba(255,255,255,0.25)' : '#EFF3FB', color: configSection === s.key ? '#fff' : '#4A5578', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 8 }}>{s.count}</span>
                </button>
              ))}
            </div>

            {/* ── SECTION: Program Table Columns ── */}
            {configSection === 'columns' && (
              <>
                <div style={{ background: 'linear-gradient(135deg,#EFF6FF 0%,#F0F9FF 100%)', border: '1px solid #BFDBFE', borderRadius: 14, padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#2563EB15', border: '1px solid #2563EB30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Settings size={18} color="#2563EB" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Program Table Columns</p>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Rename headings like <strong style={{ color: '#2563EB' }}>Program Name, Partner University, Country, Type, Seats, Deadline, Duration, Scholarship</strong> — changes apply live in the table and forms.
                      Click any heading to rename inline, or use the Edit button for full control.
                    </p>
                  </div>
                  <button className="btn-primary" style={{ fontSize: 12, padding: '7px 14px', flexShrink: 0 }} onClick={() => setShowAddCol(true)}>
                    <Plus size={13} /> Add Column
                  </button>
                </div>

                <SectionCard
                  title={`⚙️ Columns (${columns.length} total, ${columns.filter(c=>c.visible).length} visible)`}
                  action={
                    <button onClick={flashCol} style={{ fontSize: 12, padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, background: colSaveFlash ? '#059669' : '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.3s' }}>
                      {colSaveFlash ? <><Check size={12} /> Saved!</> : <><Save size={12} /> Save Changes</>}
                    </button>
                  }
                >
                  <div style={{ padding: '7px 20px', background: '#F8FAFF', borderBottom: '1px solid var(--border)', fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', gap: 16, fontWeight: 500 }}>
                    <span>✏️ Click a heading to rename inline</span>
                    <span>⇅ Arrows to reorder</span>
                    <span>👁 Toggle visibility</span>
                    <span>🔒 Core columns cannot be deleted</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: 32 }}></th>
                          <th style={{ textAlign: 'left' }}>Heading Label</th>
                          <th style={{ textAlign: 'left' }}>Maps To Field</th>
                          <th style={{ textAlign: 'center' }}>Visible</th>
                          <th style={{ textAlign: 'center' }}>Order</th>
                          <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {columns.map((col, i) => (
                          <tr key={col.id} style={{ opacity: col.visible ? 1 : 0.45, transition: 'opacity 0.2s', background: col.required ? '#FAFBFF' : undefined }}>
                            <td style={{ textAlign: 'center', paddingLeft: 10 }}>
                              <GripVertical size={14} color="#C0C9D8" style={{ cursor: 'grab' }} />
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <InlineEdit value={col.heading} onSave={v => updateCol(col.id, { heading: v })} />
                                {col.required && <span style={{ fontSize: 10, background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>CORE</span>}
                              </div>
                            </td>
                            <td>
                              <code style={{ fontSize: 11.5, background: '#F1F5F9', color: '#475569', padding: '2px 7px', borderRadius: 5 }}>{col.fieldKey}</code>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button onClick={() => updateCol(col.id, { visible: !col.visible })}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                                  background: col.visible ? '#DBEAFE' : '#F3F4F6',
                                  color:      col.visible ? '#1E40AF' : '#9CA3AF',
                                  borderColor:col.visible ? '#BFDBFE' : '#E5E7EB',
                                }}>
                                {col.visible ? <><Eye size={11} /> Show</> : <><EyeOff size={11} /> Hide</>}
                              </button>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <button disabled={i === 0} onClick={() => moveCol(col.id, 'up')} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 6px', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.25 : 1 }}><ChevronUp size={12} /></button>
                                <button disabled={i === columns.length - 1} onClick={() => moveCol(col.id, 'down')} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 6px', cursor: i === columns.length - 1 ? 'default' : 'pointer', opacity: i === columns.length - 1 ? 0.25 : 1 }}><ChevronDown size={12} /></button>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                                <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setEditingCol({ ...col })}>
                                  <Edit3 size={12} /> Edit
                                </button>
                                {!col.required
                                  ? <button className="btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => deleteCol(col.id)}><Trash2 size={12} /></button>
                                  : <span style={{ padding: '4px 8px', fontSize: 11, color: '#CBD5E1' }}>🔒</span>
                                }
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '13px 20px', background: '#FFFBEB', borderTop: '1px solid #FDE68A', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <AlertCircle size={14} color="#D97706" style={{ marginTop: 1, flexShrink: 0 }} />
                    <p style={{ fontSize: 12.5, color: '#92400E', lineHeight: 1.6 }}>
                      Renamed headings appear <strong>immediately</strong> in the Programs table, the Add/Edit program forms, and the detail panel. Hidden columns are excluded from the table view but data is preserved.
                    </p>
                  </div>
                </SectionCard>
              </>
            )}

            {/* ── SECTION: Student Enrollment Fields ── */}
            {configSection === 'fields' && (
              <>
                <div style={{ background: 'linear-gradient(135deg,#F0FDF4 0%,#EFF6FF 100%)', border: '1px solid #BBF7D0', borderRadius: 14, padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#05966915', border: '1px solid #05966930', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={18} color="#059669" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Student Enrollment Fields</p>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Define the fields that appear on the student application/enrollment form for each program. Supports Text, Number, Dropdown, Date, File upload, and Checkbox field types.
                    </p>
                  </div>
                  <button className="btn-primary" style={{ fontSize: 12, padding: '7px 14px', flexShrink: 0, background: '#059669' }} onClick={() => setShowAddField(true)}>
                    <Plus size={13} /> Add Field
                  </button>
                </div>

                <SectionCard
                  title={`📝 Student Fields (${fields.length} total)`}
                  action={
                    <button onClick={flashField} style={{ fontSize: 12, padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, background: fieldSaveFlash ? '#059669' : '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.3s' }}>
                      {fieldSaveFlash ? <><Check size={12} /> Saved!</> : <><Save size={12} /> Save Changes</>}
                    </button>
                  }
                >
                  <div style={{ padding: '7px 20px', background: '#F8FAFF', borderBottom: '1px solid var(--border)', fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', gap: 16, fontWeight: 500 }}>
                    <span>✏️ Click heading to rename inline</span><span>⇅ Reorder</span><span>👁 Toggle visibility</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: 32 }}></th>
                          <th style={{ textAlign: 'left' }}>Field Heading</th>
                          <th style={{ textAlign: 'left' }}>Key</th>
                          <th style={{ textAlign: 'center' }}>Type</th>
                          <th style={{ textAlign: 'center' }}>Required</th>
                          <th style={{ textAlign: 'center' }}>Visible</th>
                          <th style={{ textAlign: 'center' }}>Order</th>
                          <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((f, i) => (
                          <tr key={f.id} style={{ opacity: f.visible ? 1 : 0.45, transition: 'opacity 0.2s' }}>
                            <td style={{ textAlign: 'center', paddingLeft: 10 }}><GripVertical size={14} color="#C0C9D8" style={{ cursor: 'grab' }} /></td>
                            <td><InlineEdit value={f.heading} onSave={v => updateField(f.id, { heading: v })} size="sm" /></td>
                            <td><code style={{ fontSize: 11, background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: 4 }}>{f.fieldKey}</code></td>
                            <td style={{ textAlign: 'center' }}>
                              <select value={f.type} onChange={e => updateField(f.id, { type: e.target.value as FieldType })}
                                style={{ fontSize: 12, fontWeight: 600, border: '1.5px solid var(--border)', borderRadius: 6, padding: '3px 7px', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                                {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                              </select>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button onClick={() => updateField(f.id, { required: !f.required })} style={{ padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', background: f.required ? '#DCFCE7' : '#F3F4F6', color: f.required ? '#166534' : '#6B7280', borderColor: f.required ? '#BBF7D0' : '#E5E7EB' }}>
                                {f.required ? 'Yes' : 'No'}
                              </button>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button onClick={() => updateField(f.id, { visible: !f.visible })} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', background: f.visible ? '#DBEAFE' : '#F3F4F6', color: f.visible ? '#1E40AF' : '#9CA3AF', borderColor: f.visible ? '#BFDBFE' : '#E5E7EB' }}>
                                {f.visible ? <><Eye size={11} /> Show</> : <><EyeOff size={11} /> Hide</>}
                              </button>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <button disabled={i === 0} onClick={() => moveField(f.id, 'up')} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 5px', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.25 : 1 }}><ChevronUp size={11} /></button>
                                <button disabled={i === fields.length - 1} onClick={() => moveField(f.id, 'down')} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 5px', cursor: i === fields.length - 1 ? 'default' : 'pointer', opacity: i === fields.length - 1 ? 0.25 : 1 }}><ChevronDown size={11} /></button>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                                <button className="btn-ghost" style={{ padding: '4px 9px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setEditingField({ ...f })}><Edit3 size={12} /> Edit</button>
                                <button className="btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => deleteField(f.id)}><Trash2 size={12} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '13px 20px', background: '#FFFBEB', borderTop: '1px solid #FDE68A', display: 'flex', gap: 10 }}>
                    <AlertCircle size={14} color="#D97706" style={{ marginTop: 1, flexShrink: 0 }} />
                    <p style={{ fontSize: 12.5, color: '#92400E', lineHeight: 1.6 }}>These fields appear on the student enrollment form for every program. Use Hide to remove from view without deleting.</p>
                  </div>
                </SectionCard>
              </>
            )}
          </div>
        )}
      </div>

      {/* ══ MODALS ══ */}

      {/* Add Program */}
      {showAddProgram && (
        <div className="modal-overlay" onClick={() => { setShowAddProgram(false); setAddError('') }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Create New Program</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Fill in all required fields</p>
              </div>
              <button onClick={() => { setShowAddProgram(false); setAddError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 15 }}>
              {addError && <div style={{ background: '#FFF1F2', border: '1px solid #FECACA', borderRadius: 8, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={14} color="#E11D48" /><span style={{ fontSize: 13, color: '#BE123C', fontWeight: 500 }}>{addError}</span></div>}
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('name')} <span style={{ color: '#E11D48' }}>*</span></label>
                <input className="nx-input" placeholder="e.g. European Exchange Semester" value={newProgram.name} onChange={e => setNewProgram({ ...newProgram, name: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('type')} <span style={{ color: '#E11D48' }}>*</span></label>
                  <select className="nx-input" style={{ width: '100%' }} value={newProgram.type} onChange={e => setNewProgram({ ...newProgram, type: e.target.value as Program['type'] })}>
                    {PROGRAM_TYPES.map(t => (
                      <option key={t} value={t}>
                        {formatProgramType(t)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('partnerUniversity')} <span style={{ color: '#E11D48' }}>*</span></label>
                  <input className="nx-input" placeholder="e.g. TU Munich" value={newProgram.partnerUniversity} onChange={e => setNewProgram({ ...newProgram, partnerUniversity: e.target.value })} style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('country')} <span style={{ color: '#E11D48' }}>*</span></label>
                  <input className="nx-input" placeholder="e.g. Germany" value={newProgram.country} onChange={e => setNewProgram({ ...newProgram, country: e.target.value })} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('duration')}</label>
                  <input className="nx-input" placeholder="e.g. 1 Semester" value={newProgram.duration} onChange={e => setNewProgram({ ...newProgram, duration: e.target.value })} style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 13 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('seats')} <span style={{ color: '#E11D48' }}>*</span></label>
                  <input className="nx-input" type="number" min={1} placeholder="20" value={newProgram.seats} onChange={e => setNewProgram({ ...newProgram, seats: Number(e.target.value) })} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Enrolled</label>
                  <input className="nx-input" type="number" min={0} placeholder="0" value={newProgram.enrolled} onChange={e => setNewProgram({ ...newProgram, enrolled: Number(e.target.value) })} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('deadline')}</label>
                  <input className="nx-input" type="date" value={newProgram.deadline} onChange={e => setNewProgram({ ...newProgram, deadline: e.target.value })} style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 9, padding: '11px 13px', background: '#F8FAFF', borderRadius: 9, border: '1px solid var(--border)', alignItems: 'center' }}>
                <input type="checkbox" id="add-sch" checked={newProgram.scholarshipAvailable} onChange={e => setNewProgram({ ...newProgram, scholarshipAvailable: e.target.checked })} style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#059669' }} />
                <label htmlFor="add-sch" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>🎓 {h('scholarshipAvailable')} Available</label>
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 2 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setShowAddProgram(false); setAddError(''); setNewProgram(blankProgram()) }}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }} onClick={handleAddProgram}><Plus size={13} /> Create Program</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Program */}
      {editingProgram && (
        <div className="modal-overlay" onClick={() => { setEditingProgram(null); setEditError('') }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Edit Program</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Changes apply immediately to the table</p>
              </div>
              <button onClick={() => { setEditingProgram(null); setEditError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 15 }}>
              {editError && <div style={{ background: '#FFF1F2', border: '1px solid #FECACA', borderRadius: 8, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={14} color="#E11D48" /><span style={{ fontSize: 13, color: '#BE123C', fontWeight: 500 }}>{editError}</span></div>}
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('name')} <span style={{ color: '#E11D48' }}>*</span></label>
                <input className="nx-input" value={editingProgram.name} onChange={e => setEditingProgram({ ...editingProgram, name: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('type')} <span style={{ color: '#E11D48' }}>*</span></label>
                  <select className="nx-input" style={{ width: '100%' }} value={editingProgram.type} onChange={e => setEditingProgram({ ...editingProgram, type: e.target.value as Program['type'] })}>
                    {PROGRAM_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('partnerUniversity')} <span style={{ color: '#E11D48' }}>*</span></label>
                  <input className="nx-input" value={editingProgram.partnerUniversity} onChange={e => setEditingProgram({ ...editingProgram, partnerUniversity: e.target.value })} style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('country')} <span style={{ color: '#E11D48' }}>*</span></label>
                  <input className="nx-input" value={editingProgram.country} onChange={e => setEditingProgram({ ...editingProgram, country: e.target.value })} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('duration')}</label>
                  <input className="nx-input" value={editingProgram.duration} onChange={e => setEditingProgram({ ...editingProgram, duration: e.target.value })} style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 13 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('seats')} <span style={{ color: '#E11D48' }}>*</span></label>
                  <input className="nx-input" type="number" min={1} value={editingProgram.seats} onChange={e => setEditingProgram({ ...editingProgram, seats: Number(e.target.value) })} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Enrolled</label>
                  <input className="nx-input" type="number" min={0} value={editingProgram.enrolled} onChange={e => setEditingProgram({ ...editingProgram, enrolled: Number(e.target.value) })} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{h('deadline')}</label>
                  <input className="nx-input" type="date" value={editingProgram.deadline} onChange={e => setEditingProgram({ ...editingProgram, deadline: e.target.value })} style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 9, padding: '11px 13px', background: '#F8FAFF', borderRadius: 9, border: '1px solid var(--border)', alignItems: 'center' }}>
                <input type="checkbox" id="edit-sch" checked={editingProgram.scholarshipAvailable} onChange={e => setEditingProgram({ ...editingProgram, scholarshipAvailable: e.target.checked })} style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#059669' }} />
                <label htmlFor="edit-sch" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>🎓 {h('scholarshipAvailable')} Available</label>
              </div>
              <div style={{ padding: '11px 13px', background: '#F0FDF4', borderRadius: 9, border: '1px solid #BBF7D0' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h('fillRate')}</p>
                <ProgressBar value={editingProgram.enrolled} max={Math.max(editingProgram.seats, 1)} color={typeColors[editingProgram.type] || '#2563EB'} />
                <p style={{ fontSize: 11.5, color: '#166534', marginTop: 5 }}>{editingProgram.enrolled} of {editingProgram.seats} seats filled</p>
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 2 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setEditingProgram(null); setEditError('') }}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }} onClick={handleSaveEdit}><Save size={13} /> Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Column heading modal */}
      {editingCol && (
        <div className="modal-overlay" onClick={() => setEditingCol(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Edit Column</h3>
              <button onClick={() => setEditingCol(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={17} /></button>
            </div>
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Column Heading <span style={{ color: '#E11D48' }}>*</span></label>
                <input className="nx-input" value={editingCol.heading} onChange={e => setEditingCol({ ...editingCol, heading: e.target.value })} style={{ width: '100%' }} autoFocus />
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 5 }}>This label shows as the column header in the table and as the field label in all forms.</p>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Maps to Field</label>
                <select className="nx-input" style={{ width: '100%' }} value={editingCol.fieldKey as string}
                  onChange={e => setEditingCol({ ...editingCol, fieldKey: e.target.value as ColDef['fieldKey'] })}>
                  {(['name','partnerUniversity','country','type','seats','enrolled','deadline','duration','scholarshipAvailable','fillRate'] as const).map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 9, padding: '11px 13px', background: '#F8FAFF', borderRadius: 9, border: '1px solid var(--border)', alignItems: 'center' }}>
                <input type="checkbox" id="col-vis" checked={editingCol.visible} onChange={e => setEditingCol({ ...editingCol, visible: e.target.checked })} style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#2563EB' }} />
                <label htmlFor="col-vis" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>Visible in table</label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setEditingCol(null)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => { updateCol(editingCol.id, editingCol); setEditingCol(null) }}>
                  <Check size={13} /> Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Column modal */}
      {showAddCol && (
        <div className="modal-overlay" onClick={() => setShowAddCol(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Add Table Column</h3>
              <button onClick={() => setShowAddCol(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={17} /></button>
            </div>
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Column Heading <span style={{ color: '#E11D48' }}>*</span></label>
                <input className="nx-input" placeholder="e.g. Region" value={newColHeading} onChange={e => setNewColHeading(e.target.value)} style={{ width: '100%' }} autoFocus />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddCol(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }} onClick={addCol}><Plus size={13} /> Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Field */}
      {showAddField && (
        <div className="modal-overlay" onClick={() => setShowAddField(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Add Enrollment Field</h3>
              <button onClick={() => setShowAddField(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={17} /></button>
            </div>
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Field Heading <span style={{ color: '#E11D48' }}>*</span></label>
                <input className="nx-input" placeholder="e.g. Visa Number" value={newField.heading} onChange={e => setNewField({ ...newField, heading: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Field Key <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>(auto if blank)</span></label>
                <input className="nx-input" placeholder="e.g. visa_number" value={newField.fieldKey} onChange={e => setNewField({ ...newField, fieldKey: e.target.value.toLowerCase().replace(/\s+/g, '_') })} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Type</label>
                  <select className="nx-input" style={{ width: '100%' }} value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value as FieldType })}>
                    {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Required?</label>
                  <select className="nx-input" style={{ width: '100%' }} value={newField.required ? 'Yes' : 'No'} onChange={e => setNewField({ ...newField, required: e.target.value === 'Yes' })}>
                    <option>Yes</option><option>No</option>
                  </select>
                </div>
              </div>
              {newField.type === 'Dropdown' && (
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Options <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(comma-separated)</span></label>
                  <input className="nx-input" placeholder="e.g. UK, USA, France" value={newField.options} onChange={e => setNewField({ ...newField, options: e.target.value })} style={{ width: '100%' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddField(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }} onClick={addStudentField}><Plus size={13} /> Add Field</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Field */}
      {editingField && (
        <div className="modal-overlay" onClick={() => setEditingField(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Edit Enrollment Field</h3>
              <button onClick={() => setEditingField(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={17} /></button>
            </div>
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Field Heading</label>
                <input className="nx-input" value={editingField.heading} onChange={e => setEditingField({ ...editingField, heading: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Field Key</label>
                <input className="nx-input" value={editingField.fieldKey} onChange={e => setEditingField({ ...editingField, fieldKey: e.target.value.toLowerCase().replace(/\s+/g, '_') })} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Type</label>
                  <select className="nx-input" style={{ width: '100%' }} value={editingField.type} onChange={e => setEditingField({ ...editingField, type: e.target.value as FieldType })}>
                    {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Required?</label>
                  <select className="nx-input" style={{ width: '100%' }} value={editingField.required ? 'Yes' : 'No'} onChange={e => setEditingField({ ...editingField, required: e.target.value === 'Yes' })}>
                    <option>Yes</option><option>No</option>
                  </select>
                </div>
              </div>
              {editingField.type === 'Dropdown' && (
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Options</label>
                  <input className="nx-input" value={editingField.options} onChange={e => setEditingField({ ...editingField, options: e.target.value })} style={{ width: '100%' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 9, padding: '10px 12px', background: '#F8FAFF', borderRadius: 9, border: '1px solid var(--border)', alignItems: 'center' }}>
                <input type="checkbox" id="ef-vis" checked={editingField.visible} onChange={e => setEditingField({ ...editingField, visible: e.target.checked })} style={{ width: 15, height: 15, cursor: 'pointer' }} />
                <label htmlFor="ef-vis" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>Visible in forms</label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setEditingField(null)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => { updateField(editingField.id, editingField); setEditingField(null) }}>
                  <Check size={13} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div style={{ padding: '28px 28px 22px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#FFF1F2', border: '1.5px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Trash2 size={22} color="#E11D48" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>Delete Program?</h3>
              <div style={{ background: '#F8FAFF', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{confirmDelete.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{confirmDelete.partnerUniversity} · {confirmDelete.country}</p>
                <p style={{ fontSize: 12, color: '#D97706', marginTop: 5, fontWeight: 600 }}>⚠️ {confirmDelete.enrolled} enrolled student{confirmDelete.enrolled !== 1 ? 's' : ''} affected</p>
              </div>
              <p style={{ fontSize: 12.5, color: '#9CA3AF', marginBottom: 18 }}>This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6, background: '#E11D48', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  onClick={() => handleDelete(confirmDelete)}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  )
}

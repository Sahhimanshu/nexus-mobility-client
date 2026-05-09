'use client'
import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Topbar from '@/components/layout/Topbar'
import { SectionCard, Badge, StatMini } from '@/components/ui'
import { Student } from '@/lib/data'
import { studentApi } from '@/lib/api'
import { useEffect } from 'react'
import {
  Plus, Search, Download, Eye, X, Mail, GraduationCap,
  MapPin, Star, BookOpen, Calendar, ChevronLeft, UploadCloud, FileText, Edit3, Trash2
} from 'lucide-react'

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState<Student | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
const [students, setStudents] = useState<Student[]>([])
//-------------------------------------------------Fetch API -----------------------
useEffect(() => {

  async function fetchStudents() {

    try {

      const data = await studentApi.list({
        tenantId: '75138fb1-fad9-4322-9153-2d47ecae2daa'
      })

      const list = data?.content || []

      const mapped: Student[] = list.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        homeUniversity: s.homeUniversity ?? '',
        hostUniversity: s.hostUniversity ?? '',
        hostCountry: s.hostCountry ?? '',
        program: s.program,
        semester: s.semester ?? '',
        gpa: s.gpa ?? 0,
        status: s.status
      }))

      setStudents(mapped)

    } catch (err) {

      console.error('Failed to fetch students', err)
      setStudents([])
    }
  }

  fetchStudents()

}, [])

//----------------------------------------------Add student -----------------------------------------------
const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({
  name: '',
  email: '',
  homeUniversity: '',
  hostUniversity: '',
  hostCountry: '',
  program: 'Semester Exchange',
  semester: '',
  gpa: 0,
  status: 'Pending'
})
  const statuses = ['All', 'On Exchange', 'Approved', 'Completed', 'Pending']

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.hostUniversity.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('')
  }

  function getAvatarColor(name: string) {
    const hue = (name.charCodeAt(0) * 7) % 360
    return `linear-gradient(135deg, hsl(${hue}, 65%, 45%), hsl(${(hue + 40) % 360}, 65%, 55%))`
  }

  async function handleAddStudent() {

    try {

      const payload = {
        name: newStudent.name,
        email: newStudent.email,
        homeUniversity: newStudent.homeUniversity,
        hostUniversity: newStudent.hostUniversity,
        hostCountry: newStudent.hostCountry,
        program: newStudent.program,
        semester: newStudent.semester,
        gpa: newStudent.gpa,
        status: newStudent.status
      }

      const created = await studentApi.create(payload)

      const mappedStudent: Student = {
        id: created.id,
        name: created.name,
        email: created.email,
        homeUniversity: created.homeUniversity ?? '',
        hostUniversity: created.hostUniversity ?? '',
        hostCountry: created.hostCountry ?? '',
        program: created.program,
        semester: created.semester ?? '',
        gpa: created.gpa ?? 0,
        status: created.status
      }

      setStudents(prev => [...prev, mappedStudent])

      setShowAddModal(false)

    } catch (err) {

      console.error('Create failed', err)
    }
  }

async function handleDeleteStudent(student: Student) {

  try {

    await studentApi.delete(student.id)

    setStudents(prev =>
      prev.filter(s => s.id !== student.id)
    )

    if (selected?.id === student.id) {
      setSelected(null)
    }

  } catch (err) {

    console.error('Delete failed', err)
  }
}
  return (
    <AppShell>
      <Topbar
        title="Students"
        subtitle="Manage global mobility profiles and exchange applications"
        actions={
          <>
            <button className="btn-ghost" style={{ fontSize: 13 }}><Download size={14} /> Export</button>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}><Plus size={14} /> New Student</button>
          </>
        }
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">

        {/* Stats */}
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatMini label="On Exchange" value={students.filter(s => s.status === 'On Exchange').length} color="#2563EB" />
          <StatMini label="Approved" value={students.filter(s => s.status === 'Approved').length} color="#059669" />
          <StatMini label="Completed" value={students.filter(s => s.status === 'Completed').length} color="#7C3AED" />
          <StatMini label="Pending" value={students.filter(s => s.status === 'Pending').length} color="#D97706" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 18 }}>

          {/* Table */}
          <SectionCard
            title="👤 All Students"
            action={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="nx-input" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 30, fontSize: 13, height: 36, padding: '0 12px 0 30px', width: 200 }} />
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {statuses.map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`tab-btn ${statusFilter === s ? 'active' : ''}`}
                      style={{ padding: '6px 10px', fontSize: 12 }}>{s}</button>
                  ))}
                </div>
              </div>
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Student</th>
                    <th style={{ textAlign: 'left' }} className="hide-mobile">Host University</th>
                    <th style={{ textAlign: 'left' }} className="hide-mobile">Program</th>
                    <th style={{ textAlign: 'center' }}>Semester</th>
                    <th style={{ textAlign: 'center' }}>GPA</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} onClick={() => setSelected(s)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                            background: getAvatarColor(s.name),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 800, color: 'white',
                          }}>{getInitials(s.name)}</div>
                          <div>
                            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</p>
                            <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hide-mobile">
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.hostUniversity}</p>
                        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={10} /> {s.hostCountry}
                        </p>
                      </td>
                      <td className="hide-mobile">
                        <span style={{ background: '#EFF3FB', color: '#4A5578', padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>{s.program}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>{s.semester}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontSize: 13, fontWeight: 800,
                          color: s.gpa >= 3.8 ? '#059669' : s.gpa >= 3.5 ? '#D97706' : '#8593A8',
                        }}>{s.gpa.toFixed(1)}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}><Badge status={s.status} /></td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={e => { e.stopPropagation(); setSelected(s) }}
                          className="btn-ghost" style={{ padding: '5px 11px', fontSize: 12 }}>
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  No students match your search.
                </div>
              )}
            </div>
          </SectionCard>

          {/* Student Detail */}
          {selected && (
            <div className="glass-card" style={{ overflow: 'hidden', animation: 'slideUp 0.25s ease' }}>
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFBFF',
              }}>
                <button onClick={() => setSelected(null)} className="btn-ghost" style={{ padding: '5px 11px', fontSize: 12 }}>
                  <ChevronLeft size={13} /> Back
                </button>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}><Edit3 size={13} /></button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteStudent(selected)} style={{ padding: '5px 10px', fontSize: 12 }}><Trash2 size={13} /></button>
                </div>
              </div>

              {/* Hero */}
              <div style={{
                background: 'linear-gradient(135deg, #EFF3FB 0%, #E8EEFF 100%)',
                padding: '24px 20px', textAlign: 'center', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18, margin: '0 auto 12px',
                  background: getAvatarColor(selected.name),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 800, color: 'white',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}>{getInitials(selected.name)}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{selected.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{selected.email}</p>
                <div style={{ marginTop: 10 }}><Badge status={selected.status} /></div>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {[
                    { icon: <GraduationCap size={14} color="#2563EB" />, label: 'Home University', value: selected.homeUniversity },
                    { icon: <MapPin size={14} color="#059669" />, label: 'Host University', value: `${selected.hostUniversity}, ${selected.hostCountry}` },
                    { icon: <BookOpen size={14} color="#7C3AED" />, label: 'Program', value: selected.program },
                    { icon: <Calendar size={14} color="#D97706" />, label: 'Semester', value: selected.semester },
                    { icon: <Star size={14} color="#DB2777" />, label: 'GPA', value: `${selected.gpa.toFixed(1)} / 4.0` },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 10, background: '#F8FAFF', border: '1px solid var(--border)',
                    }}>
                      {item.icon}
                      <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500, flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Documents */}
                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 10 }}>Student Documents</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {['Exchange Agreement.pdf', 'Learning Agreement.pdf'].map((doc, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 14px', borderRadius: 8, background: '#F8FAFF', border: '1px solid var(--border)',
                      }}>
                        <FileText size={13} color="#2563EB" />
                        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, flex: 1 }}>{doc}</span>
                        <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>Download</span>
                      </div>
                    ))}
                  </div>
                  <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12, marginTop: 8 }}>
                    <UploadCloud size={13} /> Upload Document
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>
                    <Mail size={13} /> Email Student
                  </button>
                  <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>
                    Full Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>New Student Profile</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Full Name</label>
                  <input className="nx-input"
                    placeholder="e.g. Alice Johnson"
                    value={newStudent.name}
                    onChange={e =>
                      setNewStudent({
                        ...newStudent,
                        name: e.target.value
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
                  <input className="nx-input" type="email" placeholder="alice@example.com" style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Host University</label>
                  <input className="nx-input" placeholder="e.g. TU Munich" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Host Country</label>
                  <input className="nx-input" placeholder="e.g. Germany" style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Program</label>
                  <select className="nx-input" style={{ width: '100%' }}>
                    <option>Semester Exchange</option>
                    <option>Summer School</option>
                    <option>Research Fellowship</option>
                    <option>Joint Degree</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Semester</label>
                  <input className="nx-input" placeholder="e.g. Spring 2026" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="upload-zone">
                <UploadCloud size={22} color="#2563EB" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Upload Student Documents</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Exchange agreement, Learning agreement, Passport copy</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={handleAddStudent}>
                  Save Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}


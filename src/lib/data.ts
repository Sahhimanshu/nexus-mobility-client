export type PartnershipStatus = 'Active' | 'Expiring' | 'Expired' | 'Pending'
export type StudentStatus = 'On Exchange' | 'Approved' | 'Completed' | 'Pending'
export type ProgramType = | 'SEMESTER_EXCHANGE' | 'SUMMER_SCHOOL' | 'JOINT_DEGREE' | 'RESEARCH_FELLOWSHIP'| 'INTERNSHIP'

export interface Partnership {
  id: string
  university: string
  country: string
  flag: string
  type: string
  status: PartnershipStatus
  startYear: number
  expiryYear: number
  moU: boolean
  students: number
  renewalDays?: number
}

export interface Student {
  id: string
  name: string
  email: string
  homeUniversity: string
  hostUniversity: string
  hostCountry: string
  program: string
  status: StudentStatus
  semester: string
  gpa: number
}

export interface Program {
  id: string
  name: string
  type: ProgramType
  partnerUniversity: string
  country: string
  seats: number
  enrolled: number
  deadline: string
  duration: string
  scholarshipAvailable: boolean
}

export interface Document {
  id: string
  name: string
  type: string
  relatedTo: string
  uploadedBy: string
  date: string
  size: string
  status: 'Verified' | 'Pending' | 'Expired'
}

// ──────────────────────────────
// Mock Data
// ──────────────────────────────

export const partnerships: Partnership[] = [
  { id: 'p1', university: 'University of Leeds', country: 'United Kingdom', flag: '🇬🇧', type: 'Academic Exchange', status: 'Active', startYear: 2022, expiryYear: 2025, moU: true, students: 34, renewalDays: 120 },
  { id: 'p2', university: 'NYU New York', country: 'USA', flag: '🇺🇸', type: 'Research Partnership', status: 'Expiring', startYear: 2021, expiryYear: 2024, moU: true, students: 18, renewalDays: 45 },
  { id: 'p3', university: 'TU Munich', country: 'Germany', flag: '🇩🇪', type: 'Joint Degree', status: 'Active', startYear: 2020, expiryYear: 2026, moU: true, students: 62 },
  { id: 'p4', university: 'National University of Singapore', country: 'Singapore', flag: '🇸🇬', type: 'Academic Exchange', status: 'Expiring', startYear: 2019, expiryYear: 2024, moU: true, students: 27, renewalDays: 30 },
  { id: 'p5', university: 'Sorbonne University', country: 'France', flag: '🇫🇷', type: 'Cultural Exchange', status: 'Active', startYear: 2021, expiryYear: 2027, moU: true, students: 41 },
  { id: 'p6', university: 'University of Tokyo', country: 'Japan', flag: '🇯🇵', type: 'Research Partnership', status: 'Active', startYear: 2022, expiryYear: 2025, moU: false, students: 15 },
  { id: 'p7', university: 'ETH Zurich', country: 'Switzerland', flag: '🇨🇭', type: 'Joint Degree', status: 'Active', startYear: 2023, expiryYear: 2028, moU: true, students: 9 },
  { id: 'p8', university: 'University of Melbourne', country: 'Australia', flag: '🇦🇺', type: 'Academic Exchange', status: 'Expired', startYear: 2018, expiryYear: 2023, moU: false, students: 22 },
]

export const students: Student[] = [
//   { id: 's1', name: 'Alice Johnson', email: 'alice@example.com', homeUniversity: 'Global University', hostUniversity: 'TU Munich', hostCountry: 'Germany', program: 'Semester Exchange', status: 'On Exchange', semester: 'Spring 2026', gpa: 3.8 },
//   { id: 's2', name: 'Bob Smith', email: 'bob@example.com', homeUniversity: 'Global University', hostUniversity: 'NUS Singapore', hostCountry: 'Singapore', program: 'Semester Exchange', status: 'Approved', semester: 'Fall 2026', gpa: 3.6 },
//   { id: 's3', name: 'Charlie Davis', email: 'charlie@example.com', homeUniversity: 'Global University', hostUniversity: 'Sorbonne', hostCountry: 'France', program: 'Summer School', status: 'Completed', semester: 'Summer 2025', gpa: 3.9 },
//   { id: 's4', name: 'Diana Patel', email: 'diana@example.com', homeUniversity: 'Global University', hostUniversity: 'University of Leeds', hostCountry: 'UK', program: 'Research Fellowship', status: 'On Exchange', semester: 'Spring 2026', gpa: 3.7 },
//   { id: 's5', name: 'Ethan Kim', email: 'ethan@example.com', homeUniversity: 'Global University', hostUniversity: 'NYU', hostCountry: 'USA', program: 'Semester Exchange', status: 'Pending', semester: 'Fall 2026', gpa: 3.5 },
//   { id: 's6', name: 'Fatima Al-Rashid', email: 'fatima@example.com', homeUniversity: 'Global University', hostUniversity: 'ETH Zurich', hostCountry: 'Switzerland', program: 'Joint Degree', status: 'Approved', semester: 'Spring 2026', gpa: 4.0 },
]

export const programs: Program[] = [
//   { id: 'pr1', name: 'European Exchange Semester', type: 'Semester Exchange', partnerUniversity: 'TU Munich', country: 'Germany', seats: 20, enrolled: 15, deadline: '2026-04-30', duration: '1 Semester', scholarshipAvailable: true },
//   { id: 'pr2', name: 'Asia-Pacific Mobility', type: 'Semester Exchange', partnerUniversity: 'NUS Singapore', country: 'Singapore', seats: 15, enrolled: 12, deadline: '2026-05-15', duration: '1 Semester', scholarshipAvailable: true },
//   { id: 'pr3', name: 'Paris Summer Intensive', type: 'Summer School', partnerUniversity: 'Sorbonne', country: 'France', seats: 30, enrolled: 24, deadline: '2026-03-31', duration: '6 weeks', scholarshipAvailable: false },
//   { id: 'pr4', name: 'UK Research Fellowship', type: 'Research Fellowship', partnerUniversity: 'University of Leeds', country: 'UK', seats: 8, enrolled: 3, deadline: '2026-06-01', duration: '3 months', scholarshipAvailable: true },
//   { id: 'pr5', name: 'Swiss Engineering Program', type: 'Joint Degree', partnerUniversity: 'ETH Zurich', country: 'Switzerland', seats: 10, enrolled: 7, deadline: '2026-07-01', duration: '2 years', scholarshipAvailable: true },
]

export const documents: Document[] = [
  { id: 'd1', name: 'Leeds MoU Agreement 2022', type: 'MoU', relatedTo: 'University of Leeds', uploadedBy: 'Admin', date: '2022-01-10', size: '2.4 MB', status: 'Verified' },
  { id: 'd2', name: 'NYU Partnership Renewal Draft', type: 'MoU', relatedTo: 'NYU New York', uploadedBy: 'Admin', date: '2024-01-15', size: '1.8 MB', status: 'Pending' },
  { id: 'd3', name: 'TU Munich Joint Degree Contract', type: 'Contract', relatedTo: 'TU Munich', uploadedBy: 'Admin', date: '2020-06-01', size: '4.1 MB', status: 'Verified' },
  { id: 'd4', name: 'Alice Johnson Exchange Agreement', type: 'Student Form', relatedTo: 'Alice Johnson', uploadedBy: 'Alice Johnson', date: '2025-12-05', size: '0.8 MB', status: 'Verified' },
  { id: 'd5', name: 'NUS MoU 2019', type: 'MoU', relatedTo: 'NUS Singapore', uploadedBy: 'Admin', date: '2019-08-01', size: '3.2 MB', status: 'Expired' },
]

export const dashboardStats = {
  totalPartnerships: 124,
  activeMoUs: 89,
  expiringMoUs: 12,
  activeStudents: 1450,
  partnershipGrowth: '+12%',
  moUCompliance: '92%',
  expiringAction: 'Action required',
  studentGrowth: '+5.4%',
}

export const studentsByDestination = [
  { country: 'Germany', students: 387 },
  { country: 'Singapore', students: 312 },
  { country: 'France', students: 268 },
  { country: 'UK', students: 201 },
  { country: 'Japan', students: 156 },
  { country: 'USA', students: 126 },
]

export const partnershipsByCountry = [
  { country: 'UK', count: 18 },
  { country: 'USA', count: 15 },
  { country: 'Germany', count: 12 },
  { country: 'France', count: 11 },
  { country: 'Singapore', count: 9 },
  { country: 'Japan', count: 8 },
  { country: 'Australia', count: 7 },
  { country: 'Others', count: 44 },
]

export const mobilityTrend = [
  { year: '2020', students: 680 },
  { year: '2021', students: 820 },
  { year: '2022', students: 1050 },
  { year: '2023', students: 1190 },
  { year: '2024', students: 1320 },
  { year: '2025', students: 1450 },
]

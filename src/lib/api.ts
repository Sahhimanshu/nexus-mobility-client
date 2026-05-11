const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://nexus-mobility-backend.onrender.com/api/v1'
const TENANT_ENV_KEY = 'NEXT_PUBLIC_TENANT_ID'
const TENANT_STORAGE_KEY = 'nx_tenant'
const TOKEN_STORAGE_KEY = 'nx_token'
let tenantBootstrapPromise: Promise<string | null> | null = null

export interface ApiError {
  status: number
  detail: string
  errors?: Record<string, string>
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  limit: number
}

export interface PartnershipInput {
  tenantId?: string
  universityName: string
  countryCode: string
  partnershipType?: string | null
  status?: string | null
  startDate?: string | null
  expiryDate?: string | null
  mouSigned?: boolean
  renewalAlertDays?: number | null
  notes?: string | null
}

export interface StudentInput {
  tenantId?: string
  fullName: string
  email: string
  homeUniversity?: string | null
  hostUniversity?: string | null
  hostCountryCode?: string | null
  programName?: string | null
  semesterLabel?: string | null
  gpa?: number | null
  status?: string | null
}

export interface ProgramInput {
  tenantId?: string
  partnershipId?: string | null
  name: string
  type: string
  partnerUniversity?: string | null
  countryCode?: string | null
  seats?: number | null
  enrolled?: number | null
  deadline?: string | null
  durationLabel?: string | null
  scholarshipAvailable?: boolean | null
  description?: string | null
}

export interface ColumnDefinitionInput {
  id?: string
  tenantId?: string
  keyName: string
  label: string
  valueType: string
  sortOrder?: number | null
  visible?: boolean
}

export interface FieldDefinitionInput {
  id?: string
  tenantId?: string
  keyName: string
  label: string
  inputType: string
  requiredField?: boolean
  sortOrder?: number | null
}

export interface CountryRecord {
  code: string
  name: string
  region?: string | null
  flagEmoji?: string | null
}

export interface CountryStatRecord {
  id: string
  tenantId: string
  countryCode: string
  snapshotYear?: number | null
  outboundStudents?: number | null
  inboundStudents?: number | null
  partnershipCount?: number | null
  createdAt: string
  updatedAt: string
}

export interface PartnershipRecord {
  id: string
  tenantId: string
  universityName: string
  countryCode: string
  partnershipType?: string | null
  status: string
  startDate?: string | null
  expiryDate?: string | null
  mouSigned: boolean
  renewalAlertDays?: number | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface ProgramRecord {
  id: string
  tenantId: string
  partnershipId?: string | null
  name: string
  type: string
  partnerUniversity?: string | null
  countryCode?: string | null
  seats?: number | null
  enrolled?: number | null
  deadline?: string | null
  durationLabel?: string | null
  scholarshipAvailable?: boolean | null
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface StudentRecord {
  id: string
  tenantId: string
  fullName: string
  email: string
  homeUniversity?: string | null
  hostUniversity?: string | null
  hostCountryCode?: string | null
  programName?: string | null
  semesterLabel?: string | null
  gpa?: number | null
  status?: string | null
  createdAt: string
  updatedAt: string
}

export interface ColumnDefinitionRecord {
  id: string
  tenantId: string
  module: string
  keyName: string
  label: string
  valueType: string
  sortOrder?: number | null
  visible: boolean
  createdAt: string
  updatedAt: string
}

export interface FieldDefinitionRecord {
  id: string
  tenantId: string
  keyName: string
  label: string
  inputType: string
  requiredField: boolean
  sortOrder?: number | null
  createdAt: string
  updatedAt: string
}

export interface EventRecord {
  id: string
  tenantId: string
  name: string
  type: string
  eventDate?: string | null
  countryCode?: string | null
  location?: string | null
  hostInstitution?: string | null
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface EventParticipantRecord {
  id: string
  eventId: string
  tenantId: string
  fullName: string
  email?: string | null
  organization?: string | null
  role?: string | null
  createdAt: string
  updatedAt: string
}

export interface VisitRecord {
  id: string
  tenantId: string
  title: string
  type: string
  status: string
  visitDate?: string | null
  location?: string | null
  institutionName?: string | null
  agenda?: string | null
  createdAt: string
  updatedAt: string
}

export interface VisitParticipantRecord {
  id: string
  visitId: string
  tenantId: string
  fullName: string
  email?: string | null
  organization?: string | null
  role?: string | null
  createdAt: string
  updatedAt: string
}

export interface DocumentRecord {
  id: string
  tenantId: string
  programId?: string | null
  partnershipId?: string | null
  originalFilename: string
  storedFilename: string
  contentType?: string | null
  sizeBytes: number
  type: string
  storagePath: string
  createdAt: string
  updatedAt: string
}

export interface NewsRecord {
  id: string
  tenantId: string
  title: string
  category: string
  publishDate?: string | null
  sourceUrl?: string | null
  summary?: string | null
  createdAt: string
  updatedAt: string
}

export interface VisitInput {
  tenantId?: string
  title: string
  type: string
  status?: string | null
  visitDate?: string | null
  location?: string | null
  institutionName?: string | null
  agenda?: string | null
}

export interface VisitParticipantInput {
  tenantId?: string
  fullName: string
  email?: string | null
  organization?: string | null
  role?: string | null
}

export interface EventInput {
  tenantId?: string
  name: string
  type: string
  eventDate?: string | null
  countryCode?: string | null
  location?: string | null
  hostInstitution?: string | null
  description?: string | null
}

export interface EventParticipantInput {
  tenantId?: string
  fullName: string
  email?: string | null
  organization?: string | null
  role?: string | null
}

export interface NewsInput {
  tenantId?: string
  title: string
  category: string
  publishDate?: string | null
  sourceUrl?: string | null
  summary?: string | null
}

export interface CountryStatInput {
  snapshotYear?: number | null
  outboundStudents?: number | null
  inboundStudents?: number | null
  partnershipCount?: number | null
}

export interface DashboardSnapshotRecord {
  id: string
  tenantId: string
  snapshotDate: string
  totalPrograms?: number | null
  totalPartnerships?: number | null
  totalEvents?: number | null
  totalVisits?: number | null
  totalStudents?: number | null
  createdAt: string
  updatedAt: string
}

export interface DashboardOverview {
  date: string
  totalPrograms: number
  totalPartnerships: number
  totalEvents: number
  totalVisits: number
  totalStudents: number
}

export interface MobilityTrendPoint {
  year: number
  students: number
}

type ParamValue = string | number | boolean | null | undefined

interface FetchConfig {
  tenantId?: string
  params?: Record<string, ParamValue>
  includeTenant?: boolean
}

function getStoredTenantId() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TENANT_STORAGE_KEY)
}

function getStoredToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function getTenantId(explicitTenantId?: string) {
  return explicitTenantId ?? getStoredTenantId() ?? process.env[TENANT_ENV_KEY] ?? null
}

async function ensureTenantId(explicitTenantId?: string) {
  const knownTenantId = getTenantId(explicitTenantId)
  if (knownTenantId) return knownTenantId

  if (!tenantBootstrapPromise) {
    tenantBootstrapPromise = fetch(`${BASE_URL}/auth/me`)
      .then(async res => {
        if (!res.ok) return null
        const payload = await res.json().catch(() => null)
        const tenantId = payload?.tenantId ?? null
        if (tenantId && typeof window !== 'undefined') {
          localStorage.setItem(TENANT_STORAGE_KEY, tenantId)
        }
        return tenantId
      })
      .catch(() => null)
      .finally(() => {
        tenantBootstrapPromise = null
      })
  }

  return tenantBootstrapPromise
}

function buildUrl(path: string, config: FetchConfig = {}) {
  const resolvedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${BASE_URL}${resolvedPath}`)
  const params = new URLSearchParams(url.search)
  const tenantId = getTenantId(config.tenantId)

  Object.entries(config.params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })

  if (config.includeTenant !== false && tenantId && !params.has('tenantId')) {
    params.set('tenantId', tenantId)
  }

  const qs = params.toString()
  url.search = qs
  return url.toString()
}

async function apiFetch<T>(path: string, options: RequestInit = {}, config: FetchConfig = {}): Promise<T> {
  const token = getStoredToken()
  const tenantId = config.includeTenant === false ? null : await ensureTenantId(config.tenantId)
  const headers = new Headers(options.headers)
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(buildUrl(path, { ...config, tenantId: tenantId ?? undefined }), { ...options, headers })

  if (!res.ok) {
    const err: ApiError = await res.json().catch(async () => ({
      status: res.status,
      detail: (await res.text().catch(() => null)) || res.statusText,
    }))
    throw err
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json()
}

async function withTenantBody<T extends { tenantId?: string }>(payload: T) {
  return {
    ...payload,
    tenantId: await ensureTenantId(payload.tenantId),
  }
}

export function formatEnumLabel(value?: string | null) {
  if (!value) return ''
  return value
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatShortDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ accessToken: string; refreshToken?: string; tenantId: string; role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, { includeTenant: false }),

  refresh: (refreshToken: string) =>
    apiFetch<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, { includeTenant: false }),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  me: () => apiFetch<{ id: string; tenantId: string; fullName: string; email: string; role: string }>('/auth/me', {}, { includeTenant: false }),
}

export const dashboardApi = {
  overview: (tenantId?: string) =>
    apiFetch<DashboardOverview>('/dashboard/overview', {}, { tenantId }),

  snapshot: (tenantId?: string, date?: string) =>
    apiFetch<DashboardOverview>('/dashboard/snapshot', {}, {
      tenantId,
      params: { date },
    }),

  mobilityTrend: (tenantId?: string, years = 5) =>
    apiFetch<MobilityTrendPoint[]>('/dashboard/mobility-trend', {}, {
      tenantId,
      params: { years },
    }),

  countryStats: (tenantId?: string, year?: number) =>
    apiFetch<CountryStatRecord[]>('/dashboard/country-stats', {}, {
      tenantId,
      params: { year },
    }),

  refreshSnapshot: (tenantId?: string, date?: string) =>
    apiFetch<DashboardSnapshotRecord>('/dashboard/snapshot/refresh', {
      method: 'POST',
    }, {
      tenantId,
      params: { date },
    }),
}

export const countryApi = {
  list: () => apiFetch<CountryRecord[]>('/countries', {}, { includeTenant: false }),
  get: (code: string) => apiFetch<CountryRecord>(`/countries/${code}`, {}, { includeTenant: false }),
  stats: (tenantId?: string) => apiFetch<CountryStatRecord[]>('/countries/stats', {}, { tenantId }),
  patchStat: (countryCode: string, tenantId: string, payload: CountryStatInput) =>
    apiFetch<CountryStatRecord>(`/countries/stats/${countryCode}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, {
      tenantId,
      includeTenant: false,
      params: { tenantId },
    }),
}

export const partnershipApi = {
  list: (params?: { tenantId?: string; search?: string; status?: string; page?: number; limit?: number }) =>
    apiFetch<PageResponse<PartnershipRecord>>('/partnerships', {}, {
      tenantId: params?.tenantId,
      params: {
        search: params?.search,
        status: params?.status,
        page: params?.page,
        limit: params?.limit,
      },
    }),

  create: async (payload: PartnershipInput) =>
    apiFetch<PartnershipRecord>('/partnerships', {
      method: 'POST',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  update: async (id: string, payload: PartnershipInput) =>
    apiFetch<PartnershipRecord>(`/partnerships/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  delete: (id: string) => apiFetch<void>(`/partnerships/${id}`, { method: 'DELETE' }),

  get: (id: string) => apiFetch<PartnershipRecord>(`/partnerships/${id}`),

  columns: (tenantId?: string) =>
    apiFetch<ColumnDefinitionRecord[]>('/partnerships/columns', {}, { tenantId }),

  upsertColumns: async (items: ColumnDefinitionInput[]) =>
    apiFetch<ColumnDefinitionRecord[]>('/partnerships/columns', {
      method: 'PATCH',
      body: JSON.stringify(await Promise.all(items.map(item => withTenantBody(item)))),
    }),

  createColumn: async (item: ColumnDefinitionInput) =>
    apiFetch<ColumnDefinitionRecord>('/partnerships/columns', {
      method: 'POST',
      body: JSON.stringify(await withTenantBody(item)),
    }),

  deleteColumn: (id: string) => apiFetch<void>(`/partnerships/columns/${id}`, { method: 'DELETE' }),
}

export const studentApi = {
  list: (params?: { tenantId?: string; search?: string; status?: string; page?: number; limit?: number }) =>
    apiFetch<PageResponse<StudentRecord>>('/students', {}, {
      tenantId: params?.tenantId,
      params: {
        search: params?.search,
        status: params?.status,
        page: params?.page,
        limit: params?.limit,
      },
    }),

  create: async (payload: StudentInput) =>
    apiFetch<StudentRecord>('/students', {
      method: 'POST',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  update: async (id: string, payload: StudentInput) =>
    apiFetch<StudentRecord>(`/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  delete: (id: string) => apiFetch<void>(`/students/${id}`, { method: 'DELETE' }),

  get: (id: string) => apiFetch<StudentRecord>(`/students/${id}`),
}

export const programApi = {
  list: (params?: { tenantId?: string; type?: string; search?: string; page?: number; limit?: number }) =>
    apiFetch<PageResponse<ProgramRecord>>('/programs', {}, {
      tenantId: params?.tenantId,
      params: {
        type: params?.type,
        search: params?.search,
        page: params?.page,
        limit: params?.limit,
      },
    }),

  create: async (payload: ProgramInput) =>
    apiFetch<ProgramRecord>('/programs', {
      method: 'POST',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  update: async (id: string, payload: ProgramInput) =>
    apiFetch<ProgramRecord>(`/programs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  delete: (id: string) => apiFetch<void>(`/programs/${id}`, { method: 'DELETE' }),

  columns: (tenantId?: string) =>
    apiFetch<ColumnDefinitionRecord[]>('/programs/columns', {}, { tenantId }),

  upsertColumns: async (items: ColumnDefinitionInput[]) =>
    apiFetch<ColumnDefinitionRecord[]>('/programs/columns', {
      method: 'PATCH',
      body: JSON.stringify(await Promise.all(items.map(item => withTenantBody(item)))),
    }),

  createColumn: async (item: ColumnDefinitionInput) =>
    apiFetch<ColumnDefinitionRecord>('/programs/columns', {
      method: 'POST',
      body: JSON.stringify(await withTenantBody(item)),
    }),

  deleteColumn: (id: string) => apiFetch<void>(`/programs/columns/${id}`, { method: 'DELETE' }),

  fields: (tenantId?: string) =>
    apiFetch<FieldDefinitionRecord[]>('/programs/fields', {}, { tenantId }),

  upsertFields: async (items: FieldDefinitionInput[]) =>
    apiFetch<FieldDefinitionRecord[]>('/programs/fields', {
      method: 'PATCH',
      body: JSON.stringify(await Promise.all(items.map(item => withTenantBody(item)))),
    }),

  createField: async (item: FieldDefinitionInput) =>
    apiFetch<FieldDefinitionRecord>('/programs/fields', {
      method: 'POST',
      body: JSON.stringify(await withTenantBody(item)),
    }),

  deleteField: (id: string) => apiFetch<void>(`/programs/fields/${id}`, { method: 'DELETE' }),
}

export const eventApi = {
  list: (params?: { tenantId?: string; type?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    apiFetch<PageResponse<EventRecord>>('/events', {}, {
      tenantId: params?.tenantId,
      params: {
        type: params?.type,
        from: params?.from,
        to: params?.to,
        page: params?.page,
      limit: params?.limit,
      },
    }),

  create: async (payload: EventInput) =>
    apiFetch<EventRecord>('/events', {
      method: 'POST',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  update: async (id: string, payload: EventInput) =>
    apiFetch<EventRecord>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  delete: (id: string) => apiFetch<void>(`/events/${id}`, { method: 'DELETE' }),

  get: (id: string) => apiFetch<EventRecord>(`/events/${id}`),

  participants: (id: string) => apiFetch<EventParticipantRecord[]>(`/events/${id}/participants`),

  addParticipant: async (id: string, payload: EventParticipantInput) =>
    apiFetch<EventParticipantRecord[]>(`/events/${id}/participants`, {
      method: 'POST',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  removeParticipant: (id: string, participantId: string) =>
    apiFetch<void>(`/events/${id}/participants/${participantId}`, { method: 'DELETE' }),
}

export const newsApi = {
  list: (params?: { tenantId?: string; category?: string; page?: number; limit?: number }) =>
    apiFetch<PageResponse<NewsRecord>>('/news', {}, {
      tenantId: params?.tenantId,
      params: {
        category: params?.category,
        page: params?.page,
        limit: params?.limit,
      },
    }),

  top: (tenantId?: string, limit = 3) =>
    apiFetch<NewsRecord[]>('/news/top', {}, {
      tenantId,
      params: { limit },
    }),

  create: async (payload: NewsInput) =>
    apiFetch<NewsRecord>('/news', {
      method: 'POST',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  update: async (id: string, payload: NewsInput) =>
    apiFetch<NewsRecord>(`/news/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  delete: (id: string) => apiFetch<void>(`/news/${id}`, { method: 'DELETE' }),

  get: (id: string) => apiFetch<NewsRecord>(`/news/${id}`),
}

export const visitApi = {
  list: (params?: { tenantId?: string; type?: string; status?: string; page?: number; limit?: number }) =>
    apiFetch<PageResponse<VisitRecord>>('/visits', {}, {
      tenantId: params?.tenantId,
      params: {
        type: params?.type,
        status: params?.status,
        page: params?.page,
      limit: params?.limit,
      },
    }),

  create: async (payload: VisitInput) =>
    apiFetch<VisitRecord>('/visits', {
      method: 'POST',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  update: async (id: string, payload: VisitInput) =>
    apiFetch<VisitRecord>(`/visits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  delete: (id: string) => apiFetch<void>(`/visits/${id}`, { method: 'DELETE' }),

  get: (id: string) => apiFetch<VisitRecord>(`/visits/${id}`),

  participants: (id: string) => apiFetch<VisitParticipantRecord[]>(`/visits/${id}/participants`),

  addParticipant: async (id: string, payload: VisitParticipantInput) =>
    apiFetch<VisitParticipantRecord[]>(`/visits/${id}/participants`, {
      method: 'POST',
      body: JSON.stringify(await withTenantBody(payload)),
    }),

  removeParticipant: (id: string, participantId: string) =>
    apiFetch<void>(`/visits/${id}/participants/${participantId}`, { method: 'DELETE' }),
}

export const documentApi = {
  list: (params?: { tenantId?: string; programId?: string; partnershipId?: string; type?: string }) =>
    apiFetch<DocumentRecord[]>('/documents', {}, {
      tenantId: params?.tenantId,
      params: {
        programId: params?.programId,
        partnershipId: params?.partnershipId,
        type: params?.type,
      },
    }),

  upload: async (payload: {
    tenantId?: string
    file: File
    type: string
    programId?: string
    partnershipId?: string
  }) => {
    const formData = new FormData()
    formData.append('file', payload.file)
    formData.append('tenantId', (await ensureTenantId(payload.tenantId)) ?? '')
    formData.append('type', payload.type)
    if (payload.programId) formData.append('programId', payload.programId)
    if (payload.partnershipId) formData.append('partnershipId', payload.partnershipId)

    return apiFetch<DocumentRecord>('/documents/upload', {
      method: 'POST',
      body: formData,
    }, { includeTenant: false })
  },

  delete: (id: string) => apiFetch<void>(`/documents/${id}`, { method: 'DELETE' }),

  downloadUrl: (id: string) => `${BASE_URL}/documents/${id}/download`,
}

/**
 * Nexus Mobility – API Client
 * Centralised fetch wrapper for the Spring Boot backend.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

// ── Types ─────────────────────────────────────────────────────

export interface ApiError {
  status: number
  detail: string
  errors?: Record<string, string>
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// ── Core fetch wrapper ────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  tenantId?: string
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nx_token') : null
  const tid   = tenantId ?? (typeof window !== 'undefined' ? localStorage.getItem('nx_tenant') : null)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token   ? { Authorization: `Bearer ${token}` } : {}),
    ...(tid     ? { 'X-Tenant-Id': tid }               : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ status: res.status, detail: res.statusText }))
    throw err
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ accessToken: string; tenantId: string; role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string) =>
    apiFetch<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
}

// ── Dashboard ──────────────────────────────────────────────────

export const dashboardApi = {
  overview: (tenantId: string) =>
    apiFetch<Record<string, unknown>>('/dashboard/overview', {}, tenantId),
}

// ── Partnerships ───────────────────────────────────────────────

export interface PartnershipPayload {
  universityName: string
  countryCode: string
  partnershipType?: string
  startDate: string        // ISO date: '2024-01-01'
  expiryDate: string
  mouSigned?: boolean
  renewalAlertDays?: number
  notes?: string
}

export const partnershipApi = {
  list: (params?: {
    search?: string
    status?: string
    page?: number
    size?: number
  }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    if (params?.page   !== undefined) qs.set('page', String(params.page))
    if (params?.size   !== undefined) qs.set('size', String(params.size))
    return apiFetch<PageResponse<any>>(`/partnerships?${qs}`)
  },

  get:    (id: string)                      => apiFetch<any>(`/partnerships/${id}`),
  create: (data: PartnershipPayload)        => apiFetch<any>('/partnerships', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<PartnershipPayload>) =>
    apiFetch<any>(`/partnerships/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string)                      => apiFetch<void>(`/partnerships/${id}`, { method: 'DELETE' }),

  expiring: (days = 120) => apiFetch<any[]>(`/partnerships/expiring?days=${days}`),
  stats:    ()           => apiFetch<Record<string, number>>('/partnerships/stats'),
}

// ── Students ───────────────────────────────────────────────────

export const studentApi = {
  list: (params?: { search?: string; status?: string; page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    if (params?.page !== undefined) qs.set('page', String(params.page))
    return apiFetch<PageResponse<any>>(`/students?${qs}`)
  },
  get:    (id: string) => apiFetch<any>(`/students/${id}`),
  create: (data: any)  => apiFetch<any>('/students', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch<any>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}

// ── Programs ───────────────────────────────────────────────────

export const programApi = {
  list:   (params?: { type?: string }) =>
    apiFetch<PageResponse<any>>(`/programs?${new URLSearchParams(params as any)}`),
  get:    (id: string) => apiFetch<any>(`/programs/${id}`),
  create: (data: any)  => apiFetch<any>('/programs', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Events ────────────────────────────────────────────────────
// GET    /api/v1/events                     → PageResponse<Event>
// GET    /api/v1/events/:id                 → Event
// POST   /api/v1/events                     → Event (create)
// PUT    /api/v1/events/:id                 → Event (update)
// DELETE /api/v1/events/:id                 → 204

export const eventApi = {
  list: (params?: { type?: string; status?: string }) =>
    apiFetch<PageResponse<any>>(`/events?${new URLSearchParams(params as any)}`),
  get:    (id: string) => apiFetch<any>(`/events/${id}`),
  create: (data: any)  => apiFetch<any>('/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch<any>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<void>(`/events/${id}`, { method: 'DELETE' }),
}

// ── University Visits ──────────────────────────────────────────
// GET    /api/v1/visits                     → PageResponse<Visit>
// GET    /api/v1/visits/:id                 → Visit
// POST   /api/v1/visits                     → Visit (create)
// PUT    /api/v1/visits/:id                 → Visit (update)
// DELETE /api/v1/visits/:id                 → 204
// POST   /api/v1/visits/:id/documents       → upload document (multipart/form-data)

export const visitApi = {
  list: (params?: { type?: string; status?: string }) =>
    apiFetch<PageResponse<any>>(`/visits?${new URLSearchParams(params as any)}`),
  get:    (id: string) => apiFetch<any>(`/visits/${id}`),
  create: (data: any)  => apiFetch<any>('/visits', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch<any>(`/visits/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<void>(`/visits/${id}`, { method: 'DELETE' }),
  uploadDoc: (id: string, formData: FormData) =>
    apiFetch<any>(`/visits/${id}/documents`, { method: 'POST', body: formData, headers: {} }),
}

// ── News Feed ──────────────────────────────────────────────────
// GET    /api/v1/news                       → PageResponse<NewsItem>
// GET    /api/v1/news/top?limit=3           → NewsItem[]  (for dashboard)
// GET    /api/v1/news/:id                   → NewsItem
// (News is typically fetched from external aggregator RSS feeds
//  and stored/cached in the backend DB)

export const newsApi = {
  list: (params?: { category?: string; search?: string }) =>
    apiFetch<PageResponse<any>>(`/news?${new URLSearchParams(params as any)}`),
  top:  (limit = 3) => apiFetch<any[]>(`/news/top?limit=${limit}`),
  get:  (id: string) => apiFetch<any>(`/news/${id}`),
}

// ── Documents ──────────────────────────────────────────────────

export const documentApi = {
  list: () => apiFetch<PageResponse<any>>('/documents'),
  upload: (formData: FormData) =>
    apiFetch<any>('/documents/upload', {
      method: 'POST',
      body: formData,
      headers: {},     // let browser set multipart boundary
    }),
  delete: (id: string) => apiFetch<void>(`/documents/${id}`, { method: 'DELETE' }),
}

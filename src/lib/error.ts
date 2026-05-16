type ApiPayload = {
  status?: number
  error?: string
  title?: string
  message?: string
  detail?: string
  path?: string
  errors?: Record<string, string | string[]> | Array<{ field?: string; message?: string }>
}

function stringifyErrors(errors: ApiPayload['errors']) {
  if (!errors) return ''

  if (Array.isArray(errors)) {
    return errors
      .map(item => item.message || item.field || '')
      .filter(Boolean)
      .join(', ')
  }

  return Object.values(errors)
    .flatMap(value => Array.isArray(value) ? value : [value])
    .filter(Boolean)
    .join(', ')
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const payload = (error as any)?.response?.data ?? (error as any)?.data ?? error as ApiPayload & { message?: string }
  const nested = (error as any)?.response?.data?.message ?? (error as any)?.response?.data?.detail

  const message =
    nested ||
    payload?.message ||
    payload?.detail ||
    payload?.error ||
    payload?.title ||
    (typeof (error as any)?.message === 'string' ? (error as any).message : '') ||
    stringifyErrors(payload?.errors)

  if (message && message.trim()) {
    return message.trim()
  }

  return fallback
}

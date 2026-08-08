import 'server-only'

type ErrorPayload = {
  error?: {
    code?: string
    message?: string
    fields?: Record<string, string[]>
  }
}

export class ServerApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message)
  }
}

function getApiBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.VITE_API_URL ??
    'http://localhost:8000'
  )
}

export async function serverPublicApi<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  const payload = (await response.json().catch(() => null)) as
    | { data: T }
    | ErrorPayload
    | null

  if (!response.ok) {
    const error = payload && 'error' in payload ? payload.error : undefined
    throw new ServerApiError(
      error?.message ?? 'APIリクエストに失敗しました',
      response.status,
      error?.code,
    )
  }

  return (payload as { data: T }).data
}

'use client'

import { API_BASE_URL } from '../config'

type ErrorPayload = {
  error?: {
    code?: string
    message?: string
    fields?: Record<string, string[]>
  }
}

type Session = {
  user: { id: number; username: string }
  csrfToken: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message)
  }
}

let csrfToken: string | null = null

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T

  const payload = (await response.json().catch(() => null)) as
    | { data: T }
    | ErrorPayload
    | null
  if (!response.ok) {
    const error = payload && 'error' in payload ? payload.error : undefined
    throw new ApiError(
      error?.message ?? 'APIリクエストに失敗しました',
      response.status,
      error?.code,
      error?.fields,
    )
  }

  return (payload as { data: T }).data
}

async function refreshSession(): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  const session = await parse<Session>(response)
  csrfToken = session.csrfToken
  return session
}

export async function publicApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  return parse<T>(
    await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
    }),
  )
}

export async function adminApi<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(init.headers)
  if (csrfToken && init.method && !['GET', 'HEAD'].includes(init.method)) {
    headers.set('X-CSRF-Token', csrfToken)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })
  if (response.status === 401 && retry) {
    await refreshSession()
    return adminApi<T>(path, init, false)
  }

  return parse<T>(response)
}

export async function login(
  username: string,
  password: string,
  turnstileToken: string,
  website: string,
): Promise<Session> {
  const session = await publicApi<Session>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      password,
      turnstileToken,
      website,
    }),
  })
  csrfToken = session.csrfToken
  return session
}

export async function restoreSession(): Promise<Session> {
  try {
    const session = await adminApi<Session>('/auth/session', {}, false)
    csrfToken = session.csrfToken
    return session
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error
    return refreshSession()
  }
}

export async function logout(): Promise<void> {
  try {
    await adminApi<void>('/auth/logout', { method: 'POST' })
  } finally {
    csrfToken = null
  }
}

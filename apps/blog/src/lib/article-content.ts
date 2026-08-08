export type TipTapMark = {
  type?: string
  attrs?: Record<string, unknown>
}

export type TipTapNode = {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: TipTapMark[]
  content?: TipTapNode[]
}

export function parseTipTapDocument(value: unknown): TipTapNode | null {
  if (typeof value === 'string') {
    try {
      return parseTipTapDocument(JSON.parse(value))
    } catch {
      return null
    }
  }

  if (!value || typeof value !== 'object') return null
  return value as TipTapNode
}

export function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === 'string')
  }

  if (typeof tags !== 'string') return []

  return tags
    .replace(/[{}]/g, '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function safeLinkHref(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (value.startsWith('/') && !value.startsWith('//')) return value

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? value : null
  } catch {
    return null
  }
}

export function safeImageSrc(value: unknown): string | null {
  if (typeof value !== 'string') return null

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? value : null
  } catch {
    return null
  }
}

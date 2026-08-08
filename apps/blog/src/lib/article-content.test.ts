import { describe, expect, it } from 'vitest'
import {
  parseTags,
  parseTipTapDocument,
  safeImageSrc,
  safeLinkHref,
} from './article-content'

describe('parseTags', () => {
  it('accepts PostgreSQL array text and removes empty tags', () => {
    expect(parseTags('{php, serverless,}')).toEqual(['php', 'serverless'])
  })

  it('keeps string values from an array', () => {
    expect(parseTags(['php', 1, 'aws'])).toEqual(['php', 'aws'])
  })
})

describe('parseTipTapDocument', () => {
  it('accepts both JSON strings and objects', () => {
    const document = { type: 'doc', content: [] }
    expect(parseTipTapDocument(JSON.stringify(document))).toEqual(document)
    expect(parseTipTapDocument(document)).toEqual(document)
  })

  it('rejects malformed JSON', () => {
    expect(parseTipTapDocument('{')).toBeNull()
  })
})

describe('content URL validation', () => {
  it('allows HTTP links and site-relative links', () => {
    expect(safeLinkHref('https://example.com')).toBe('https://example.com')
    expect(safeLinkHref('/articles/example')).toBe('/articles/example')
  })

  it('rejects executable and protocol-relative links', () => {
    expect(safeLinkHref('javascript:alert(1)')).toBeNull()
    expect(safeLinkHref('//example.com')).toBeNull()
  })

  it('only allows remote HTTP images', () => {
    expect(safeImageSrc('https://example.com/image.png')).toBe(
      'https://example.com/image.png',
    )
    expect(safeImageSrc('data:image/svg+xml,test')).toBeNull()
  })
})

export type ArticleCategory = 'tech' | 'psychology'

export type Article = {
  slug: string
  title: string
  category: ArticleCategory
  description: string
  body: object | string
  published_at: string | null
  thumbnail_url?: string | null
  tags?: string[]
}

export const articleCategories: { value: ArticleCategory; label: string }[] = [
  { value: 'tech', label: 'TECH' },
  { value: 'psychology', label: 'PSYCHOLOGY' },
]

export function isArticleCategory(value: unknown): value is ArticleCategory {
  return value === 'tech' || value === 'psychology'
}

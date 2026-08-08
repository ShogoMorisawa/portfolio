import Link from 'next/link'
import FaceTongueLayout from '#/components/FaceTongueLayout'
import {
  isArticleCategory,
  type Article,
  type ArticleCategory,
} from '#/data/articles'
import { serverPublicApi } from '#/lib/server-api'

type Props = {
  searchParams: Promise<{ category?: string | string[] }>
}

export default async function ArticlesPage({ searchParams }: Props) {
  const rawCategory = (await searchParams).category
  const category: ArticleCategory | undefined = isArticleCategory(rawCategory)
    ? rawCategory
    : undefined
  const articles = await serverPublicApi<Article[]>('/articles')
  const filteredArticles = category
    ? articles.filter((article) => article.category === category)
    : articles

  return (
    <FaceTongueLayout
      title={category ? `${category.toUpperCase()} ARTICLES` : 'ARTICLES'}
      category={category ?? 'all'}
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredArticles.map((article, index) => {
          const href = category
            ? `/articles/${encodeURIComponent(article.slug)}?category=${category}`
            : `/articles/${encodeURIComponent(article.slug)}`

          return (
            <Link
              key={article.slug}
              href={href}
              className="group block h-full rounded-[28px] border-8 border-[#4A4A4A] bg-white px-5 py-5 text-[#4A4A4A] transition-transform hover:-translate-y-1 hover:rotate-[0.4deg]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {article.published_at && (
                <p className="text-[0.68rem] font-black tracking-[0.28em] text-[#FF5757] uppercase">
                  {new Date(article.published_at).toLocaleDateString('ja-JP')}
                </p>
              )}
              <h2 className="mt-3 text-2xl leading-tight font-black">
                {article.title}
              </h2>
              <p className="mt-3 min-h-24 text-sm leading-6">
                {article.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-black tracking-[0.18em]">
                <span className="rounded-full border-4 border-[#4A4A4A] bg-[#FFE36E] px-3 py-1">
                  {article.category.toUpperCase()}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </FaceTongueLayout>
  )
}

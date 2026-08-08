import Link from 'next/link'
import { notFound } from 'next/navigation'
import FaceTongueLayout from '#/components/FaceTongueLayout'
import TipTapRenderer from '#/components/TipTapRenderer'
import {
  articleCategories,
  isArticleCategory,
  type Article,
  type ArticleCategory,
} from '#/data/articles'
import { parseTags } from '#/lib/article-content'
import { ServerApiError, serverPublicApi } from '#/lib/server-api'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ category?: string | string[] }>
}

export default async function ArticleDetailPage({ params, searchParams }: Props) {
  const [{ slug }, rawSearch] = await Promise.all([params, searchParams])
  const category: ArticleCategory | undefined = isArticleCategory(
    rawSearch.category,
  )
    ? rawSearch.category
    : undefined

  let article: Article
  try {
    article = await serverPublicApi<Article>(
      `/articles/${encodeURIComponent(slug)}`,
    )
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) notFound()
    throw error
  }

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('ja-JP')
    : 'WIP'
  const backLabel = category
    ? `BACK TO ${articleCategories.find((item) => item.value === category)?.label ?? category.toUpperCase()} ARTICLES`
    : 'BACK TO ARTICLES'
  const backHref = category
    ? `/articles?category=${category}`
    : '/articles'

  return (
    <FaceTongueLayout
      title={article.title}
      category={article.category}
      showCategoryTabs={false}
      article={article}
    >
      <div className="space-y-10">
        <div className="flex flex-wrap items-center gap-3 border-b-4 border-dashed border-[#4A4A4A] pb-6">
          <span className="font-black tracking-widest text-[#FF5757]">
            {formattedDate}
          </span>

          {parseTags(article.tags).map((tag) => (
            <span
              key={tag}
              className="rounded-full border-4 border-[#4A4A4A] bg-[#FFE36E] px-3 py-1 text-xs font-black tracking-widest"
            >
              #{tag.toUpperCase()}
            </span>
          ))}
        </div>

        <TipTapRenderer contentJson={article.body} />

        <div className="mx-auto flex justify-center border-t-4 border-dashed border-[#4A4A4A] pt-8">
          <Link
            href={backHref}
            className="rounded-full border-4 border-[#4A4A4A] bg-white px-8 py-4 text-sm font-black tracking-[0.16em] text-[#4A4A4A] transition-transform hover:scale-105 hover:-rotate-2"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </FaceTongueLayout>
  )
}

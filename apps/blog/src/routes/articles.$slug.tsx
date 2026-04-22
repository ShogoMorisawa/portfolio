import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import FaceTongueLayout from '../components/FaceTongueLayout'
import MarkdownArticle from '../components/MarkdownArticle'
import { articles, getArticleBySlug } from '../data/articles'

export const Route = createFileRoute('/articles/$slug')({
  loader: ({ params }) => {
    const article = getArticleBySlug(params.slug)

    if (!article) {
      throw notFound()
    }

    return article
  },
  component: ArticleDetailPage,
})

function ArticleDetailPage() {
  const article = Route.useLoaderData()
  const articleIndex = articles.findIndex((item) => item.slug === article.slug)
  const previousArticle = articleIndex > 0 ? articles[articleIndex - 1] : null
  const nextArticle = articleIndex < articles.length - 1 ? articles[articleIndex + 1] : null

  return (
    <FaceTongueLayout
      title={article.title}
      intro={article.description}
      category={article.category}
      article={article}
    >
      <div className="space-y-10">
        <MarkdownArticle markdown={article.body} />

        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 border-t-4 border-dashed border-[#4A4A4A] pt-8">
          <Link
            to="/articles"
            className="rounded-full border-4 border-[#4A4A4A] bg-white px-5 py-3 text-sm font-black tracking-[0.16em] text-[#4A4A4A] transition-transform hover:-rotate-2 hover:scale-105"
          >
            BACK TO ARTICLES
          </Link>
          {previousArticle ? (
            <Link
              to="/articles/$slug"
              params={{ slug: previousArticle.slug }}
              className="rounded-full border-4 border-[#4A4A4A] bg-[#FFE36E] px-5 py-3 text-sm font-black tracking-[0.16em] text-[#4A4A4A] transition-transform hover:-rotate-2 hover:scale-105"
            >
              PREV
            </Link>
          ) : null}
          {nextArticle ? (
            <Link
              to="/articles/$slug"
              params={{ slug: nextArticle.slug }}
              className="rounded-full border-4 border-[#4A4A4A] bg-[#7BE0D6] px-5 py-3 text-sm font-black tracking-[0.16em] text-[#4A4A4A] transition-transform hover:rotate-2 hover:scale-105"
            >
              NEXT
            </Link>
          ) : null}
        </div>
      </div>
    </FaceTongueLayout>
  )
}

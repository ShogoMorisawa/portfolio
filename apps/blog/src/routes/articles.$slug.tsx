import { createFileRoute, notFound } from '@tanstack/react-router'
import FaceTongueLayout from '../components/FaceTongueLayout'
import { getArticleBySlug } from '../data/articles'

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

  return (
    <FaceTongueLayout
      title={article.title}
      intro={article.description}
      category={article.category}
      article={article}
    >
      <article className="mx-auto max-w-3xl space-y-6 text-[1.02rem] leading-8 text-[#4A4A4A]">
        {article.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>
    </FaceTongueLayout>
  )
}

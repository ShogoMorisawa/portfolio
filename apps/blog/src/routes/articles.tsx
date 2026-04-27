import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import FaceTongueLayout from '../components/FaceTongueLayout';
import { type ArticleCategory, isArticleCategory } from '../data/articles';

type ArticlesSearch = {
  category?: ArticleCategory;
};

export const Route = createFileRoute('/articles')({
  validateSearch: (search: Record<string, unknown>): ArticlesSearch => {
    const category = search.category;
    return isArticleCategory(category) ? { category } : {};
  },
  loader: async () => {
    const res = await fetch('http://localhost:8000/get_articles.php');
    if (!res.ok) throw new Error('データの取得に失敗しました');
    return await res.json();
  },
  component: ArticlesPage,
});

function ArticlesPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { category } = Route.useSearch();

  if (pathname !== '/articles') {
    return <Outlet />;
  }

  const articles = Route.useLoaderData();
  const filteredArticles = category
    ? articles.filter((article) => article.category === category)
    : articles;

  return (
    <FaceTongueLayout
      title={category ? `${category.toUpperCase()} ARTICLES` : 'ARTICLES'}
      category={category ?? 'all'}
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredArticles.map((article, index) => (
          <Link
            key={article.slug}
            to="/articles/$slug"
            params={{ slug: article.slug }}
            search={{ category }}
            className="group block h-full rounded-[28px] border-8 border-[#4A4A4A] bg-white px-5 py-5 text-[#4A4A4A] transition-transform hover:-translate-y-1 hover:rotate-[0.4deg]"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <p className="text-[0.68rem] font-black tracking-[0.28em] text-[#FF5757] uppercase">
              {article.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl leading-tight font-black">{article.title}</h2>
            <p className="mt-3 min-h-24 text-sm leading-6">{article.description}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-black tracking-[0.18em]">
              <span className="rounded-full border-4 border-[#4A4A4A] bg-[#FFE36E] px-3 py-1">
                {article.category.toUpperCase()}
              </span>
              <span className="rounded-full border-4 border-[#4A4A4A] bg-[#F6D2FF] px-3 py-1">
                {article.readTime}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </FaceTongueLayout>
  );
}

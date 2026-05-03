import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

const AUTH_TOKEN_KEY = 'coco_auth_token';

type Article = {
  slug: string;
  title: string;
  category: string;
  description: string;
  published_at: string | null;
};

export const Route = createFileRoute('/admin/')({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      navigate({ to: '/admin/login' });
      return;
    }

    fetch('http://localhost:8000/get_articles.php')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setIsLoading(false);
      })
      .catch(() => {
        alert('記事一覧の取得に失敗しました');
        setIsLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    navigate({ to: '/admin/login' });
  };

  if (isLoading) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-[#4A4A4A]">ADMIN</h1>
        <div className="flex gap-4">
          <Link
            to="/admin/editor"
            className="rounded-full border-4 border-[#4A4A4A] bg-[#7BE0D6] px-6 py-2 font-black transition-transform hover:-rotate-2"
          >
            + NEW ARTICLE
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-full border-4 border-[#4A4A4A] bg-white px-6 py-2 font-black transition-transform hover:-rotate-2"
          >
            LOGOUT
          </button>
        </div>
      </div>

      <div className="rounded-[32px] border-8 border-[#4A4A4A] bg-white p-8 space-y-4">
        {articles.length === 0 ? (
          <p className="text-center text-gray-400 font-black py-8">記事がまだないよ！</p>
        ) : (
          articles.map((article) => (
            <div
              key={article.slug}
              className="flex items-center justify-between border-b-2 border-dashed border-[#4A4A4A] pb-4 last:border-0 last:pb-0"
            >
              <div className="min-w-0 flex-1 pr-4">
                <p className="font-black text-[#4A4A4A] truncate">{article.title}</p>
                <p className="text-sm font-mono text-gray-500">
                  {article.slug} · {article.category.toUpperCase()}
                </p>
              </div>
              <a
                href={`/admin/editor?slug=${encodeURIComponent(article.slug)}`}
                className="shrink-0 rounded-full border-4 border-[#4A4A4A] bg-[#FFE36E] px-4 py-1 text-sm font-black transition-transform hover:-rotate-2"
              >
                EDIT
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

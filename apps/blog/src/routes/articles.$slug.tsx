import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import FaceTongueLayout from '../components/FaceTongueLayout';

export const Route = createFileRoute('/articles/$slug')({
  loader: async ({ params }) => {
    const res = await fetch('http://localhost:8000/get_articles.php');
    if (!res.ok) throw new Error('データの取得に失敗しました');
    const allArticles = await res.json();
    const article = allArticles.find((article: any) => article.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  component: ArticleDetailPage,
});

function TipTapRenderer({ contentJson }: { contentJson: string | object }) {
  const data = typeof contentJson === 'string' ? JSON.parse(contentJson) : contentJson;
  if (!data || !data.content) return null;

  return (
    <div className="space-y-6 text-[1.02rem] leading-8 text-[#4A4A4A]">
      {data.content.map((block: any, index: number) => {
        if (block.type === 'paragraph') {
          return (
            <p key={index}>
              {block.content?.map((span: any, i: number) => (
                <span key={i} className={span.marks?.some((m: any) => m.type === 'bold') ? 'font-bold' : ''}>
                  {span.text}
                </span>
              ))}
            </p>
          );
        }
        if (block.type === 'heading' && block.attrs?.level === 2) {
          return (
            <h2
              key={index}
              className="mt-12 inline-block border-4 border-[#4A4A4A] bg-[#7BE0D6] px-3 py-1 text-2xl font-black transition-transform hover:-rotate-1"
            >
              {block.content?.[0]?.text}
            </h2>
          );
        }
        return null;
      })}
    </div>
  );
}

// PHP(PostgreSQL) の "{tag1,tag2}" 形式を配列に変換する
function parseTags(tags: any): string[] {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    return tags.replace(/[{}]/g, '').split(',').filter(Boolean);
  }
  return [];
}

function ArticleDetailPage() {
  const { article } = Route.useLoaderData();
  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('ja-JP')
    : 'WIP';

  const tags = parseTags(article.tags);

  return (
    <FaceTongueLayout
      title={article.title}
      intro={article.description}
      category={article.category}
      article={article}
    >
      <div className="space-y-10">
        <div className="flex flex-wrap items-center gap-3 border-b-4 border-dashed border-[#4A4A4A] pb-6">
          <span className="font-black tracking-widest text-[#FF5757]">
            {formattedDate}
          </span>

          {tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full border-4 border-[#4A4A4A] bg-[#FFE36E] px-3 py-1 text-xs font-black tracking-widest"
            >
              #{tag.toUpperCase()}
            </span>
          ))}
        </div>

        <TipTapRenderer contentJson={article.body} />

        {/* 👇 リンクは「一覧へ戻る」のみに削ぎ落とし */}
        <div className="mx-auto flex justify-center border-t-4 border-dashed border-[#4A4A4A] pt-8">
          <Link
            to="/articles"
            className="rounded-full border-4 border-[#4A4A4A] bg-white px-8 py-4 text-sm font-black tracking-[0.16em] text-[#4A4A4A] transition-transform hover:scale-105 hover:-rotate-2"
          >
            BACK TO ARTICLES
          </Link>
        </div>
      </div>
    </FaceTongueLayout>
  );
}

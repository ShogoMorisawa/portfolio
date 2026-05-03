import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import FaceTongueLayout from '../components/FaceTongueLayout';
import { articleCategories, isArticleCategory, type ArticleCategory } from '../data/articles';

type ArticleDetailSearch = {
  category?: ArticleCategory;
};

export const Route = createFileRoute('/articles/$slug')({
  validateSearch: (search: Record<string, unknown>): ArticleDetailSearch => {
    const category = search.category;
    return isArticleCategory(category) ? { category } : {};
  },
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
        // --- 1. 段落 (Paragraph) & リンク (Link) の処理 ---
        if (block.type === 'paragraph') {
          return (
            <p key={index} className="mb-4">
              {block.content?.map((span: any, i: number) => {
                // マーク（太字やリンク）の判定
                const isBold = span.marks?.some((m: any) => m.type === 'bold');
                const linkMark = span.marks?.find((m: any) => m.type === 'link');

                let classes = '';
                if (isBold) classes += 'font-black text-[#FF5757] ';

                // リンクの場合は <a> タグで囲む！
                if (linkMark) {
                  return (
                    <a
                      key={i}
                      href={linkMark.attrs.href}
                      target={linkMark.attrs.target}
                      rel="noopener noreferrer"
                      className={`${classes} font-black text-[#FF5757] underline decoration-4 underline-offset-4 transition-colors hover:text-[#7BE0D6]`}
                    >
                      {span.text}
                    </a>
                  );
                }

                // 通常のテキスト（太字含む）
                return (
                  <span key={i} className={classes}>
                    {span.text}
                  </span>
                );
              })}
            </p>
          );
        }

        // --- 2. 見出し (Heading H2) ---
        if (block.type === 'heading' && block.attrs?.level === 2) {
          return (
            <h2
              key={index}
              className="mt-12 mb-4 inline-block border-4 border-[#4A4A4A] bg-[#7BE0D6] px-3 py-1 text-2xl font-black transition-transform hover:-rotate-1"
            >
              {block.content?.[0]?.text}
            </h2>
          );
        }

        // --- 3. 画像 (Image) ---
        if (block.type === 'image') {
          return (
            <div key={index} className="my-10 flex justify-center">
              <img
                src={block.attrs?.src}
                alt={block.attrs?.alt || 'ブログ画像'}
                className="max-w-full rounded-[24px] border-8 border-[#4A4A4A] bg-[#FFF6D1] shadow-[8px_8px_0_0_#4A4A4A] transition-transform hover:-translate-y-1 hover:rotate-1"
              />
            </div>
          );
        }

        // 👇 --- 4. 追加：コードブロック (CodeBlock) の処理！ --- 👇
        if (block.type === 'codeBlock') {
          return (
            <pre
              key={index}
              className="my-6 overflow-x-auto rounded-xl border-8 border-[#4A4A4A] bg-[#4A4A4A] p-4 font-mono text-sm text-[#7BE0D6] shadow-[4px_4px_0_0_#FF5757]"
            >
              <code>{block.content?.[0]?.text}</code>
            </pre>
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
  const { category } = Route.useSearch();
  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('ja-JP')
    : 'WIP';
  const backLabel = category
    ? `BACK TO ${articleCategories.find((item) => item.value === category)?.label ?? category.toUpperCase()} ARTICLES`
    : 'BACK TO ARTICLES';
  const tags = parseTags(article.tags);

  return (
    <FaceTongueLayout
      title={article.title}
      intro={article.description}
      category={article.category}
      showCategoryTabs={false}
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
            search={{ category }}
            className="rounded-full border-4 border-[#4A4A4A] bg-white px-8 py-4 text-sm font-black tracking-[0.16em] text-[#4A4A4A] transition-transform hover:scale-105 hover:-rotate-2"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </FaceTongueLayout>
  );
}

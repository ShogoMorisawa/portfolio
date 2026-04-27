import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import type { Article, ArticleCategory } from '../data/articles';
import { articleCategories } from '../data/articles';

type FaceTongueLayoutProps = {
  title: string;
  intro: string;
  category?: ArticleCategory | 'all';
  showCategoryTabs?: boolean;
  children: ReactNode;
  article?: Article;
};

export default function FaceTongueLayout({
  title,
  category = 'all',
  showCategoryTabs = true,
  children,
  article,
}: FaceTongueLayoutProps) {
  return (
    <section className="mx-auto w-full max-w-[1080px] px-2 pt-10 pb-24 sm:px-6 sm:pt-14 sm:pb-32">
      {/* 顔: 左右の目 */}
      <div className="mx-auto mb-8 flex w-full max-w-[700px] items-center justify-between px-10">
        {/* 左目 */}
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-8 border-[#4A4A4A] bg-white shadow-sm sm:h-44 sm:w-44">
          <div className="absolute bottom-[-4px] left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-[#4A4A4A] sm:bottom-[-6px] sm:h-24 sm:w-24" />
        </div>

        {/* 右目 */}
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-8 border-[#4A4A4A] bg-white shadow-sm sm:h-44 sm:w-44">
          <div className="absolute bottom-[-4px] left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-[#4A4A4A] sm:bottom-[-6px] sm:h-24 sm:w-24" />
        </div>
      </div>

      {/* 口 / 舌のベースになる外側フレーム */}
      <div className="rounded-[36px] border-8 border-[#4A4A4A] bg-[#FF5757] p-2 sm:rounded-[44px] sm:p-4">
        {/* 記事キャンバス本体 */}
        <div className="rounded-[28px] border-8 border-[#4A4A4A] bg-[#FFF6D1] px-3 py-6 sm:rounded-[32px] sm:px-8 sm:py-8">
          {/* カテゴリタブ */}
          {showCategoryTabs ? (
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Link
                to="/articles"
                search={{ category: undefined }}
                className={`rounded-full border-4 border-[#4A4A4A] px-4 py-2 text-sm font-black tracking-[0.18em] text-[#4A4A4A] transition-transform hover:scale-105 hover:-rotate-2 ${
                  category === 'all' ? 'bg-[#FFE36E]' : 'bg-white'
                }`}
              >
                ALL
              </Link>
              {articleCategories.map((item) => (
                <Link
                  key={item.value}
                  to="/articles"
                  search={{ category: item.value }}
                  className={`rounded-full border-4 border-[#4A4A4A] px-4 py-2 text-sm font-black tracking-[0.18em] text-[#4A4A4A] transition-transform hover:scale-105 hover:-rotate-2 ${
                    category === item.value ? 'bg-[#7BE0D6]' : 'bg-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}

          {/* 見出しエリア */}
          <div className="mb-8 border-b-4 border-dashed border-[#4A4A4A] pb-6">
            <h1 className="mt-3 text-4xl leading-none font-black tracking-tight text-[#4A4A4A] sm:text-6xl">
              {title}
            </h1>

            {article ? (
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold tracking-[0.12em] text-[#4A4A4A]">
                <span className="rounded-full border-4 border-[#4A4A4A] bg-white px-3 py-1">
                  {article.category.toUpperCase()}
                </span>
                <span>{article.publishedAt}</span>
                <span>{article.readTime}</span>
              </div>
            ) : null}
          </div>

          {/* 記事一覧カード or 記事本文 */}
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}

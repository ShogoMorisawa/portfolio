'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { adminApi, logout, restoreSession } from '../lib/api'

type AdminArticle = {
  id: number
  slug: string
  title: string
  category: string
  description: string
  published_at: string | null
}

export default function AdminDashboard() {
  const router = useRouter()
  const [articles, setArticles] = useState<AdminArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    restoreSession()
      .then(() => adminApi<AdminArticle[]>('/admin/articles'))
      .then((data) => {
        setArticles(data)
        setIsLoading(false)
      })
      .catch(() => router.replace('/admin/login'))
  }, [router])

  const handleLogout = async () => {
    await logout().catch(() => undefined)
    router.replace('/admin/login')
  }

  if (isLoading) return null

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-black text-[#4A4A4A]">ADMIN</h1>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/letters"
            className="rounded-full border-4 border-[#4A4A4A] bg-[#FFE36E] px-6 py-2 font-black transition-transform hover:-rotate-2"
          >
            LETTERS
          </Link>
          <Link
            href="/admin/editor"
            className="rounded-full border-4 border-[#4A4A4A] bg-[#7BE0D6] px-6 py-2 font-black transition-transform hover:-rotate-2"
          >
            + NEW ARTICLE
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border-4 border-[#4A4A4A] bg-white px-6 py-2 font-black transition-transform hover:-rotate-2"
          >
            LOGOUT
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-[32px] border-8 border-[#4A4A4A] bg-white p-8">
        {articles.length === 0 ? (
          <p className="py-8 text-center font-black text-gray-400">
            記事がまだないよ！
          </p>
        ) : (
          articles.map((article) => (
            <div
              key={article.slug}
              className="flex items-center justify-between border-b-2 border-dashed border-[#4A4A4A] pb-4 last:border-0 last:pb-0"
            >
              <div className="min-w-0 flex-1 pr-4">
                <p className="truncate font-black text-[#4A4A4A]">
                  {article.title}
                </p>
                <p className="font-mono text-sm text-gray-500">
                  {article.slug} · {article.category.toUpperCase()}
                </p>
              </div>
              <Link
                href={`/admin/editor?id=${article.id}`}
                className="shrink-0 rounded-full border-4 border-[#4A4A4A] bg-[#FFE36E] px-4 py-1 text-sm font-black transition-transform hover:-rotate-2"
              >
                EDIT
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

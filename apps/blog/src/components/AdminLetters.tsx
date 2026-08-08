'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { adminApi, ApiError, restoreSession } from '../lib/api'

type Letter = {
  id: number
  name: string
  email: string | null
  message: string
  reply: string | null
  replied_at: string | null
  reply_read: boolean
  created_at: string
  legacy: boolean
}

export default function AdminLetters() {
  const router = useRouter()
  const [letters, setLetters] = useState<Letter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openId, setOpenId] = useState<number | null>(null)

  const loadLetters = useCallback(() => {
    setIsLoading(true)
    adminApi<{ items: Letter[] }>('/admin/letters?limit=100')
      .then((data) => {
        setLetters(data.items)
        setIsLoading(false)
      })
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) {
          router.replace('/admin/login')
        }
        setIsLoading(false)
      })
  }, [router])

  useEffect(() => {
    restoreSession()
      .then(loadLetters)
      .catch(() => router.replace('/admin/login'))
  }, [loadLetters, router])

  if (isLoading) return null

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-[#4A4A4A]">LETTERS</h1>
        <Link
          href="/admin"
          className="rounded-full border-4 border-[#4A4A4A] bg-white px-6 py-2 font-black transition-transform hover:-rotate-2"
        >
          ← BACK
        </Link>
      </div>

      <div className="space-y-4 rounded-[32px] border-8 border-[#4A4A4A] bg-white p-8">
        {letters.length === 0 ? (
          <p className="py-8 text-center font-black text-gray-400">
            まだ手紙が届いていないよ！
          </p>
        ) : (
          letters.map((letter) => (
            <LetterRow
              key={letter.id}
              letter={letter}
              isOpen={openId === letter.id}
              onToggle={() => setOpenId(openId === letter.id ? null : letter.id)}
              onChanged={loadLetters}
            />
          ))
        )}
      </div>
    </div>
  )
}

function LetterRow({
  letter,
  isOpen,
  onToggle,
  onChanged,
}: {
  letter: Letter
  isOpen: boolean
  onToggle: () => void
  onChanged: () => void
}) {
  const [reply, setReply] = useState(letter.reply ?? '')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendReply = async () => {
    const trimmed = reply.trim()
    if (!trimmed || isSending) return

    setIsSending(true)
    setError(null)

    try {
      await adminApi<Letter>(`/admin/letters/${letter.id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: trimmed }),
      })
      onChanged()
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : '返信の送信に失敗しました',
      )
    } finally {
      setIsSending(false)
    }
  }

  const deleteLetter = async () => {
    if (!window.confirm('この手紙を削除してもよろしいですか？')) return
    setError(null)

    try {
      await adminApi<void>(`/admin/letters/${letter.id}`, {
        method: 'DELETE',
      })
      onChanged()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '削除に失敗しました')
    }
  }

  const status = !letter.reply
    ? { label: 'NEW', bg: 'bg-[#FF5757] text-white' }
    : letter.reply_read
      ? { label: 'READ', bg: 'bg-[#7BE0D6] text-[#4A4A4A]' }
      : { label: 'SENT', bg: 'bg-[#FFE36E] text-[#4A4A4A]' }

  return (
    <div className="border-b-2 border-dashed border-[#4A4A4A] pb-4 last:border-0 last:pb-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`shrink-0 rounded-full border-2 border-[#4A4A4A] px-2 py-0.5 text-xs font-black ${status.bg}`}
            >
              {status.label}
            </span>
            <p className="truncate font-black text-[#4A4A4A]">
              {letter.name || '（名無し）'}
            </p>
          </div>
          <p className="mt-1 truncate font-mono text-sm text-gray-500">
            {letter.message}
          </p>
          <p className="mt-0.5 font-mono text-xs text-gray-400">
            {new Date(letter.created_at).toLocaleString('ja-JP')}
          </p>
        </div>
        <span className="shrink-0 text-2xl font-black text-[#4A4A4A]">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 rounded-2xl border-4 border-[#4A4A4A] bg-[#FFF6D1] p-5">
          <div>
            <p className="mb-1 text-xs font-black text-gray-500">FROM</p>
            <p className="font-black text-[#4A4A4A]">
              {letter.name || '（名無し）'}
              {letter.email && (
                <span className="ml-2 font-mono text-sm text-gray-500">
                  &lt;{letter.email}&gt;
                </span>
              )}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-black text-gray-500">MESSAGE</p>
            <p className="whitespace-pre-wrap text-[#4A4A4A]">
              {letter.message}
            </p>
          </div>

          {letter.reply && letter.replied_at && (
            <div className="rounded-xl border-2 border-dashed border-[#4A4A4A] bg-white p-3">
              <p className="mb-1 text-xs font-black text-gray-500">
                {letter.reply_read ? 'YOUR REPLY (READ)' : 'YOUR REPLY (UNREAD)'}
                <span className="ml-2 font-mono text-gray-400">
                  {new Date(letter.replied_at).toLocaleString('ja-JP')}
                </span>
              </p>
              <p className="whitespace-pre-wrap text-[#4A4A4A]">
                {letter.reply}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-black text-gray-500">
              {letter.reply ? 'REPLY (上書き)' : 'REPLY'}
            </p>
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="返信を書く…"
              rows={4}
              className="w-full rounded-xl border-4 border-[#4A4A4A] bg-white px-4 py-3 outline-none focus:bg-[#FFE36E]"
            />
            {error && <p className="text-sm font-bold text-[#FF5757]">{error}</p>}
            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={deleteLetter}
                className="rounded-full border-4 border-[#4A4A4A] bg-[#FF5757] px-5 py-2 font-black text-white"
              >
                DELETE
              </button>
              <button
                type="button"
                onClick={sendReply}
                disabled={isSending || reply.trim().length === 0}
                className="rounded-full border-4 border-[#4A4A4A] bg-[#7BE0D6] px-6 py-2 font-black transition-transform hover:-rotate-2 disabled:pointer-events-none disabled:opacity-50"
              >
                {isSending ? 'SENDING…' : 'SEND REPLY'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

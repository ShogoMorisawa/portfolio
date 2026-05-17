import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

const AUTH_TOKEN_KEY = 'coco_auth_token';

type Letter = {
  id: number;
  visitor_id: string;
  name: string;
  email: string | null;
  message: string;
  reply: string | null;
  replied_at: string | null;
  reply_read: boolean;
  created_at: string;
};

export const Route = createFileRoute('/admin/letters')({
  component: AdminLettersPage,
});

function AdminLettersPage() {
  const navigate = useNavigate();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  const loadLetters = (token: string) => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/get_letters.php`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          navigate({ to: '/admin/login' });
          throw new Error('unauthorized');
        }
        return res.json();
      })
      .then((data) => {
        setLetters(Array.isArray(data?.letters) ? data.letters : []);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      navigate({ to: '/admin/login' });
      return;
    }
    loadLetters(token);
  }, [navigate]);

  const handleReplied = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) loadLetters(token);
  };

  if (isLoading) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-[#4A4A4A]">LETTERS</h1>
        <Link
          to="/admin"
          className="rounded-full border-4 border-[#4A4A4A] bg-white px-6 py-2 font-black transition-transform hover:-rotate-2"
        >
          ← BACK
        </Link>
      </div>

      <div className="rounded-[32px] border-8 border-[#4A4A4A] bg-white p-8 space-y-4">
        {letters.length === 0 ? (
          <p className="text-center text-gray-400 font-black py-8">
            まだ手紙が届いていないよ！
          </p>
        ) : (
          letters.map((letter) => (
            <LetterRow
              key={letter.id}
              letter={letter}
              isOpen={openId === letter.id}
              onToggle={() => setOpenId(openId === letter.id ? null : letter.id)}
              onReplied={handleReplied}
            />
          ))
        )}
      </div>
    </div>
  );
}

function LetterRow({
  letter,
  isOpen,
  onToggle,
  onReplied,
}: {
  letter: Letter;
  isOpen: boolean;
  onToggle: () => void;
  onReplied: () => void;
}) {
  const [reply, setReply] = useState(letter.reply ?? '');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendReply = async () => {
    const trimmed = reply.trim();
    if (!trimmed || isSending) return;

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return;

    setIsSending(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/reply_letter.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ letter_id: letter.id, reply: trimmed }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? '返信の送信に失敗しました');
      }
      onReplied();
    } catch (e) {
      setError(e instanceof Error ? e.message : '返信の送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  const status = !letter.reply
    ? { label: 'NEW', bg: 'bg-[#FF5757] text-white' }
    : letter.reply_read
      ? { label: 'READ', bg: 'bg-[#7BE0D6] text-[#4A4A4A]' }
      : { label: 'SENT', bg: 'bg-[#FFE36E] text-[#4A4A4A]' };

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
            <p className="font-black text-[#4A4A4A] truncate">
              {letter.name || '（名無し）'}
            </p>
          </div>
          <p className="text-sm font-mono text-gray-500 mt-1 truncate">
            {letter.message}
          </p>
          <p className="text-xs font-mono text-gray-400 mt-0.5">
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
            <p className="text-xs font-black text-gray-500 mb-1">FROM</p>
            <p className="font-black text-[#4A4A4A]">
              {letter.name || '（名無し）'}
              {letter.email && (
                <span className="ml-2 text-sm font-mono text-gray-500">
                  &lt;{letter.email}&gt;
                </span>
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-black text-gray-500 mb-1">MESSAGE</p>
            <p className="whitespace-pre-wrap text-[#4A4A4A]">{letter.message}</p>
          </div>

          {letter.reply && letter.replied_at && (
            <div className="rounded-xl border-2 border-dashed border-[#4A4A4A] bg-white p-3">
              <p className="text-xs font-black text-gray-500 mb-1">
                {letter.reply_read ? 'YOUR REPLY (READ)' : 'YOUR REPLY (UNREAD)'}
                <span className="ml-2 font-mono text-gray-400">
                  {new Date(letter.replied_at).toLocaleString('ja-JP')}
                </span>
              </p>
              <p className="whitespace-pre-wrap text-[#4A4A4A]">{letter.reply}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-black text-gray-500">
              {letter.reply ? 'REPLY (上書き)' : 'REPLY'}
            </p>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="返信を書く…"
              rows={4}
              className="w-full rounded-xl border-4 border-[#4A4A4A] bg-white px-4 py-3 outline-none focus:bg-[#FFE36E]"
            />
            {error && (
              <p className="text-sm font-bold text-[#FF5757]">{error}</p>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={sendReply}
                disabled={isSending || reply.trim().length === 0}
                className="rounded-full border-4 border-[#4A4A4A] bg-[#7BE0D6] px-6 py-2 font-black transition-transform hover:-rotate-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSending ? 'SENDING…' : 'SEND REPLY'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

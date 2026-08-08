'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, login, restoreSession } from '../lib/api'
import { Turnstile } from './Turnstile'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [website, setWebsite] = useState('')
  const router = useRouter()

  useEffect(() => {
    restoreSession()
      .then(() => router.replace('/admin'))
      .catch(() => undefined)
  }, [router])

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    try {
      await login(username, password, turnstileToken, website)
      router.push('/admin')
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'サーバーとの通信に失敗しました。',
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF6D1] p-4">
      <div className="w-full max-w-md rounded-[32px] border-8 border-[#4A4A4A] bg-[#FF5757] p-8 shadow-[12px_12px_0_0_#4A4A4A]">
        <h1 className="mb-8 text-center text-4xl font-black tracking-widest text-white">
          LOGIN
        </h1>

        {error && (
          <div className="mb-6 rounded-xl border-4 border-[#4A4A4A] bg-white p-3 text-center font-bold text-[#FF5757]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className="absolute left-[-10000px] h-px w-px overflow-hidden"
            aria-hidden="true"
          />
          <div>
            <input
              type="text"
              placeholder="USERNAME"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border-4 border-[#4A4A4A] px-4 py-3 text-xl font-bold outline-none focus:bg-[#FFE36E]"
              required
            />
          </div>
          <Turnstile action="admin_login" onToken={setTurnstileToken} />
          <div>
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border-4 border-[#4A4A4A] px-4 py-3 text-xl font-bold outline-none focus:bg-[#FFE36E]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full border-4 border-[#4A4A4A] bg-[#7BE0D6] py-4 text-2xl font-black tracking-widest text-[#4A4A4A] transition-transform hover:-translate-y-1 hover:rotate-1 active:translate-y-0"
          >
            ENTER
          </button>
        </form>
      </div>
    </div>
  )
}

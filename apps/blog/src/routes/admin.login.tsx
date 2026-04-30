// apps/blog/src/routes/admin.login.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/login')({
  component: LoginPage,
})

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('http://localhost:8000/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok && data.status === 'success') {
        localStorage.setItem('coco_auth_token', data.token)
        navigate({ to: '/admin/editor' })
      } else {
        setError(data.message || 'ログインに失敗しました👅')
      }
    } catch (err) {
      setError('サーバーとの通信に失敗しました。')
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
          <div>
            <input
              type="text"
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border-4 border-[#4A4A4A] px-4 py-3 text-xl font-bold outline-none focus:bg-[#FFE36E]"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
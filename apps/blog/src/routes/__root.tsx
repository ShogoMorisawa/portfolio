import { HeadContent, Scripts, createRootRoute, Link } from '@tanstack/react-router'
import * as React from 'react'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Cartoon Blog',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isHeaderExtended, setIsHeaderExtended] = React.useState(true)
  const eyeRef = React.useRef<HTMLDivElement>(null)
  const pupilRef = React.useRef<HTMLDivElement>(null)
  const targetPos = React.useRef({ x: 0, y: 0 })
  const currentPos = React.useRef({ x: 0, y: 0 })
  const requestRef = React.useRef<number | null>(null)
  const timeoutRef = React.useRef<ReturnType<typeof window.setTimeout> | null>(null)

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!eyeRef.current || !pupilRef.current) return

      const eyeRect = eyeRef.current.getBoundingClientRect()
      const pupilRect = pupilRef.current.getBoundingClientRect()
      const eyeCenterX = eyeRect.left + eyeRect.width / 2
      const eyeCenterY = eyeRect.top + eyeRect.height / 2
      const dx = event.clientX - eyeCenterX
      const dy = event.clientY - eyeCenterY
      const maxDistance = eyeRect.width / 2 - pupilRect.width / 2 - eyeRect.width * 0.05
      const distance = Math.hypot(dx, dy)

      let moveX = dx
      let moveY = dy

      if (distance > maxDistance && distance > 0) {
        moveX = (dx / distance) * maxDistance
        moveY = (dy / distance) * maxDistance
      }

      targetPos.current = { x: moveX, y: moveY }
    }

    const animate = () => {
      const easing = 0.04

      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * easing
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * easing

      if (pupilRef.current) {
        pupilRef.current.style.transform =
          `translate(${currentPos.current.x}px, ${currentPos.current.y}px)`
      }

      requestRef.current = window.requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    requestRef.current = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)

      if (requestRef.current !== null) {
        window.cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    const wakeUpHeader = () => {
      setIsHeaderExtended(true)

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = window.setTimeout(() => {
        setIsHeaderExtended(false)
      }, 3000)
    }

    window.addEventListener('mousemove', wakeUpHeader)
    window.addEventListener('mousedown', wakeUpHeader)
    window.addEventListener('scroll', wakeUpHeader)
    window.addEventListener('keydown', wakeUpHeader)

    wakeUpHeader()

    return () => {
      window.removeEventListener('mousemove', wakeUpHeader)
      window.removeEventListener('mousedown', wakeUpHeader)
      window.removeEventListener('scroll', wakeUpHeader)
      window.removeEventListener('keydown', wakeUpHeader)

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      {/* overflow-hidden を追加して、画面外にはみ出たパーツでスクロールバーが出ないようにします */}
      <body className="min-h-screen bg-[#fced35] font-sans m-0 overflow-hidden relative">
        
        {/* 👅 ベロヘッダー (レスポンシブ対応) */}
        <header
          className={`relative z-50 mt-0 flex h-16 w-[96vw] items-center justify-end rounded-r-full rounded-b-2xl border-r-4 border-b-4 border-[#4A4A4A] bg-[#FF5757] px-6 transition-transform duration-700 ease-in-out sm:h-24 sm:w-[98vw] sm:rounded-b-3xl sm:border-r-8 sm:border-b-8 sm:px-12 ${
            isHeaderExtended ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* PC用ナビゲーション */}
          <nav className="hidden md:flex gap-8 font-black text-white text-xl tracking-widest">
            <a href="/" className="hover:scale-110 hover:-rotate-3 transition-transform duration-200">3D WORLD</a>
            <Link to="/" className="hover:scale-110 hover:-rotate-3 transition-transform duration-200">HOME</Link>
            <Link to="/tech" className="hover:scale-110 hover:-rotate-3 transition-transform duration-200">TECH</Link>
            <Link to="/psychology" className="hover:scale-110 hover:-rotate-3 transition-transform duration-200">PSYCHOLOGY</Link>
          </nav>

          {/* モバイル用ハンバーガーボタン */}
          <button 
            onClick={toggleMenu}
            className="md:hidden flex flex-col gap-1.5 p-2 z-[70] cursor-pointer"
            aria-label="Menu"
          >
            <div className={`w-8 h-1.5 bg-white border-2 border-[#4A4A4A] transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-3' : ''}`} />
            <div className={`w-8 h-1.5 bg-white border-2 border-[#4A4A4A] transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-8 h-1.5 bg-white border-2 border-[#4A4A4A] transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-3' : ''}`} />
          </button>
        </header>

        {/* モバイル用フルスクリーンメニュー */}
        <div className={`fixed inset-0 z-[60] bg-[#FF5757] flex flex-col items-center justify-center transition-transform duration-500 border-l-[8vw] border-[#4A4A4A] ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <nav className="flex flex-col gap-10 font-black text-white text-4xl tracking-tighter">
            <a href="/" onClick={toggleMenu} className="hover:scale-110 active:scale-95 transition-transform text-center">3D WORLD</a>
            <Link to="/" onClick={toggleMenu} className="hover:scale-110 active:scale-95 transition-transform text-center">HOME</Link>
            <Link to="/tech" onClick={toggleMenu} className="hover:scale-110 active:scale-95 transition-transform text-center">TECH</Link>
            <Link to="/psychology" onClick={toggleMenu} className="hover:scale-110 active:scale-95 transition-transform text-center">PSYCHOLOGY</Link>
          </nav>
        </div>

        {/* 👁️ 巨大な目玉 (レスポンシブ対応 z-0) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
          {/* 白目と太枠 */}
          <div
            ref={eyeRef}
            className="relative flex h-[65vw] w-[65vw] max-h-[450px] max-w-[450px] items-center justify-center rounded-full border-[4vw] border-[#4A4A4A] bg-white sm:border-[24px]"
          >
            {/* 黒目 */}
            <div
              ref={pupilRef}
              className="h-[30vw] w-[30vw] max-h-[200px] max-w-[200px] rounded-full bg-[#4A4A4A]"
            />
          </div>
        </div>

        {/* 🍉 グループ化された口と舌 (画面端に固定) */}
        <div className="absolute bottom-[6%] -right-[2.5%] z-10 pointer-events-none transform rotate-[-45deg] origin-center scale-[0.7] sm:scale-[0.9] lg:scale-[1.1]">

          {/* 親グループの相対座標の基準 (固定ピクセルで黄金比を定義) */}
          <div className="relative">
            {/* 口 */}
            <div className="h-[175px] w-[350px] rounded-b-[175px] border-8 border-[#4A4A4A] bg-[#F78E9B]"></div>

            {/* 舌 (口の上に重なるように z-10) */}
            <div className="absolute top-[80px] right-[110px] z-10 h-[300px] w-[130px] rounded-b-full border-x-[10px] border-b-[10px] border-[#4A4A4A] bg-[#FF5757]"></div>
          </div>
        </div>

        {/* メインコンテンツ領域 (z-20) */}
        <main className="relative z-20 p-10">
          {children}
        </main>

        <Scripts />
      </body>
    </html>
  )
}

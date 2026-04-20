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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      {/* overflow-hidden を追加して、画面外にはみ出たパーツでスクロールバーが出ないようにします */}
      <body className="min-h-screen bg-[#fced35] font-sans m-0 overflow-hidden relative">
        
        {/* 👅 ベロヘッダー (レスポンシブ対応) */}
        <header className="relative z-50 bg-[#FF5757] h-16 sm:h-24 w-[96vw] sm:w-[98vw] rounded-r-full rounded-b-2xl sm:rounded-b-3xl border-b-4 sm:border-b-8 border-r-4 sm:border-r-8 border-[#4A4A4A] flex items-center justify-end px-6 sm:px-12 mt-0">
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
          {/* 白目と太枠 (画面幅に合わせて伸縮、最大450px) */}
          <div className="relative w-[65vw] h-[65vw] max-w-[450px] max-h-[450px] bg-white rounded-full border-[4vw] sm:border-[24px] border-[#4A4A4A]">
            {/* 黒目 (白目のサイズに追従) */}
            <div className="absolute top-[10%] right-[12%] w-[30vw] h-[30vw] max-w-[200px] max-h-[200px] bg-[#4A4A4A] rounded-full"></div>
          </div>
        </div>

        {/* 🍉 グループ化された口と舌 (画面端に固定) */}
        <div className="absolute bottom-[6%] -right-[2.5%] z-10 pointer-events-none transform rotate-[-45deg] origin-center scale-[0.7] sm:scale-[0.9] lg:scale-[1.1]">

          {/* 親グループの相対座標の基準 (固定ピクセルで黄金比を定義) */}
          <div className="relative">
            {/* 口 */}
            <div className="w-[350px] h-[175px] bg-[#F78E9B] rounded-b-[175px]"></div>

            {/* 舌 (口の上に重なるように z-10) */}
            <div className="absolute top-[80px] right-[110px] w-[130px] h-[300px] bg-[#FF5757] rounded-b-full z-10"></div>
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

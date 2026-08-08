import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import SiteShell from '#/components/SiteShell'
import '#/styles.css'

export const metadata: Metadata = {
  title: 'Cartoon Blog',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="relative m-0 min-h-screen overflow-x-hidden bg-[#fced35] font-sans">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}

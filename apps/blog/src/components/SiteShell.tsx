'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { publicApi } from '../lib/api'

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHeaderExtended, setIsHeaderExtended] = useState(true)
  const [isBlinking, setIsBlinking] = useState(false)
  const eyeRef = useRef<HTMLDivElement>(null)
  const pupilRef = useRef<HTMLDivElement>(null)
  const targetPos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })
  const requestRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const toggleMenu = () => setIsMenuOpen((previous) => !previous)

  useEffect(() => {
    void publicApi('/articles').catch(() => undefined)
  }, [])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!eyeRef.current || !pupilRef.current) return

      const eyeRect = eyeRef.current.getBoundingClientRect()
      const pupilRect = pupilRef.current.getBoundingClientRect()
      const eyeCenterX = eyeRect.left + eyeRect.width / 2
      const eyeCenterY = eyeRect.top + eyeRect.height / 2
      const dx = event.clientX - eyeCenterX
      const dy = event.clientY - eyeCenterY
      const maxDistance =
        eyeRect.width / 2 - pupilRect.width / 2 - eyeRect.width * 0.05
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

      currentPos.current.x +=
        (targetPos.current.x - currentPos.current.x) * easing
      currentPos.current.y +=
        (targetPos.current.y - currentPos.current.y) * easing

      if (pupilRef.current) {
        pupilRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px)`
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

  useEffect(() => {
    if (!isHomePage) return

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
  }, [isHomePage])

  useEffect(() => {
    let blinkTimeout: number | null = null
    let resetTimeout: number | null = null

    const triggerBlink = () => {
      setIsBlinking(true)

      resetTimeout = window.setTimeout(() => {
        setIsBlinking(false)
      }, 150)

      blinkTimeout = window.setTimeout(
        triggerBlink,
        Math.random() * 4000 + 2000,
      )
    }

    blinkTimeout = window.setTimeout(triggerBlink, 3000)

    return () => {
      if (blinkTimeout !== null) window.clearTimeout(blinkTimeout)
      if (resetTimeout !== null) window.clearTimeout(resetTimeout)
    }
  }, [])

  return (
    <>
      <header
        className={`relative z-50 mt-0 flex h-16 w-[96vw] items-center justify-end rounded-r-full rounded-b-2xl border-r-4 border-b-4 border-[#4A4A4A] bg-[#FF5757] px-6 transition-transform duration-700 ease-in-out sm:h-24 sm:w-[98vw] sm:rounded-b-3xl sm:border-r-8 sm:border-b-8 sm:px-12 ${
          !isHomePage || isHeaderExtended
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        <nav className="hidden gap-8 text-xl font-black tracking-widest text-white md:flex">
          <a
            href="https://shogomorisawa.me"
            className="transition-transform duration-200 hover:scale-110 hover:-rotate-3"
          >
            3D WORLD
          </a>
          <Link
            href="/"
            className="transition-transform duration-200 hover:scale-110 hover:-rotate-3"
          >
            HOME
          </Link>
          <Link
            href="/articles"
            className="transition-transform duration-200 hover:scale-110 hover:-rotate-3"
          >
            ARTICLES
          </Link>
        </nav>

        <button
          type="button"
          onClick={toggleMenu}
          className="z-[70] flex cursor-pointer flex-col gap-1.5 p-2 md:hidden"
          aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={isMenuOpen}
        >
          <div
            className={`h-1.5 w-8 border-2 border-[#4A4A4A] bg-white transition-all duration-300 ${isMenuOpen ? 'translate-y-3 rotate-45' : ''}`}
          />
          <div
            className={`h-1.5 w-8 border-2 border-[#4A4A4A] bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}
          />
          <div
            className={`h-1.5 w-8 border-2 border-[#4A4A4A] bg-white transition-all duration-300 ${isMenuOpen ? '-translate-y-3 -rotate-45' : ''}`}
          />
        </button>
      </header>

      <div
        className={`fixed inset-0 z-[60] flex flex-col items-center justify-center border-l-[8vw] border-[#4A4A4A] bg-[#FF5757] transition-transform duration-500 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isMenuOpen}
      >
        <nav className="flex flex-col gap-10 text-center text-4xl font-black tracking-tighter text-white">
          <a
            href="https://shogomorisawa.me"
            onClick={toggleMenu}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            3D WORLD
          </a>
          <Link
            href="/"
            onClick={toggleMenu}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            HOME
          </Link>
          <Link
            href="/articles"
            onClick={toggleMenu}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            ARTICLES
          </Link>
        </nav>
      </div>

      {isHomePage ? (
        <>
          <div className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
            <div
              ref={eyeRef}
              className="relative flex h-[65vw] w-[65vw] max-h-[450px] max-w-[450px] items-center justify-center overflow-hidden rounded-full border-[4vw] border-[#4A4A4A] bg-white sm:border-[24px]"
            >
              <div
                className={`absolute top-0 left-0 z-20 h-full w-full border-b-[4vw] border-[#4A4A4A] bg-[#fced35] transition-transform duration-100 ease-in-out sm:border-b-[24px] ${isBlinking ? 'translate-y-0' : '-translate-y-full'}`}
              />
              <div
                ref={pupilRef}
                className="z-10 h-[30vw] w-[30vw] max-h-[200px] max-w-[200px] rounded-full bg-[#4A4A4A]"
              />
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-[6%] -right-[2.5%] z-10 origin-center scale-[0.7] rotate-[-45deg] transform sm:scale-[0.9] lg:scale-[1.1]">
            <div className="relative">
              <div className="h-[175px] w-[350px] rounded-b-[175px] border-8 border-[#4A4A4A] bg-[#F78E9B]" />
              {isHeaderExtended ? (
                <div className="absolute top-[80px] right-[110px] z-10 h-[300px] w-[130px] rounded-b-full border-x-[10px] border-b-[10px] border-[#4A4A4A] bg-[#FF5757]" />
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <main className="relative z-20 px-px py-10 sm:p-10">{children}</main>
    </>
  )
}

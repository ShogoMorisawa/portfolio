"use client";

import React, { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useInputStore } from "@/lib/world/store";

export default function PostUI() {
  const isOpen = useInputStore((s) => s.isPostOpen);
  const setIsPostOpen = useInputStore((s) => s.setIsPostOpen);
  const overlayRef = useRef<HTMLDivElement>(null);

  const closePost = useCallback(() => {
    setIsPostOpen(false);
  }, [setIsPostOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePost();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closePost]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-10000 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
      onClick={(e) => {
        if (e.target === overlayRef.current) closePost();
      }}
    >
      <div
        className="relative max-md:absolute max-md:inset-0 md:h-[98vh] md:aspect-[1294/1493] md:max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closePost}
          aria-label="閉じる"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white text-2xl transition-colors"
        >
          ×
        </button>
        <Image
          src="/post/letter.png"
          alt="Letter"
          fill
          className="max-md:object-cover max-md:object-top md:object-contain md:object-center"
          sizes="(max-width: 768px) 100vw, min(90vw, 84.5vh)"
        />
      </div>
    </div>
  );
}

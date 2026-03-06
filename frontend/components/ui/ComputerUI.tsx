"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useInputStore } from "@/lib/world/store";
import { COMPUTER_WORKS } from "@/lib/world/computerWorksData";

export default function ComputerUI() {
  const isOpen = useInputStore((s) => s.isComputerOpen);
  const setIsComputerOpen = useInputStore((s) => s.setIsComputerOpen);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const work = COMPUTER_WORKS[selectedIndex] ?? COMPUTER_WORKS[0];
  const hasMultiple = COMPUTER_WORKS.length > 1;
  const [imageError, setImageError] = useState(false);

  const close = useCallback(() => {
    setIsComputerOpen(false);
  }, [setIsComputerOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (hasMultiple && e.key === "ArrowLeft") {
        setImageError(false);
        setSelectedIndex((i) => (i <= 0 ? COMPUTER_WORKS.length - 1 : i - 1));
      }
      if (hasMultiple && e.key === "ArrowRight") {
        setImageError(false);
        setSelectedIndex((i) => (i >= COMPUTER_WORKS.length - 1 ? 0 : i + 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close, hasMultiple]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-10000 flex items-center justify-center bg-white/20 pointer-events-auto"
      onClick={(e) => {
        if (e.target === overlayRef.current) close();
      }}
    >
      <div
        className="relative flex flex-col w-[min(92vw,42rem)] max-h-[90vh] overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          type="button"
          onClick={close}
          aria-label="閉じる"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 text-2xl transition-colors rounded-full hover:bg-gray-100"
        >
          ×
        </button>

        {/* 中央: 画像 + 文章 */}
        <div className="flex flex-col flex-1 min-h-0 p-6 pt-12 pb-8">
          {/* 画像エリア */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            {work.imageSrc && !imageError ? (
              <Image
                src={work.imageSrc}
                alt={work.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 92vw, 42rem"
                unoptimized
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                画像なし
              </div>
            )}
          </div>

          {/* 文章エリア */}
          <div className="mt-4 flex flex-col min-h-0 flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              {work.title}
            </h2>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed overflow-y-auto">
              {work.description}
            </p>
          </div>

          {/* 前後ナビ（複数作品がある場合） */}
          {hasMultiple && (
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setImageError(false);
                  setSelectedIndex((i) =>
                    i <= 0 ? COMPUTER_WORKS.length - 1 : i - 1,
                  );
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
              >
                ← 前へ
              </button>
              <span className="text-gray-600 text-sm">
                {selectedIndex + 1} / {COMPUTER_WORKS.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  setImageError(false);
                  setSelectedIndex((i) =>
                    i >= COMPUTER_WORKS.length - 1 ? 0 : i + 1,
                  );
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
              >
                次へ →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

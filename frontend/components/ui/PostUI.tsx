"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useInputStore } from "@/lib/world/store";

export default function PostUI() {
  const isOpen = useInputStore((s) => s.isPostOpen);
  const setIsPostOpen = useInputStore((s) => s.setIsPostOpen);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 送信処理
  };

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
        className="relative max-md:absolute max-md:inset-0 md:h-[98vh] md:aspect-1294/1493 md:max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 背景画像 */}
        <Image
          src="/post/letter.png"
          alt="Letter"
          fill
          className="max-md:object-cover max-md:object-top md:object-contain md:object-center -z-10"
          sizes="(max-width: 768px) 100vw, min(90vw, 84.5vh)"
        />

        {/* 閉じるボタン */}
        <button
          type="button"
          onClick={closePost}
          aria-label="閉じる"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-[#4a3728]/80 hover:text-[#3d2817] text-2xl transition-colors drop-shadow-sm"
        >
          ×
        </button>

        {/* 手紙コンテンツ（紙の上にオーバーレイ） */}
        <div className="absolute inset-0 flex flex-col p-6 sm:p-10 md:p-12 pt-8 sm:pt-12 md:pt-14">
          {/* 切手予定地（右上） */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-14 h-16 sm:w-16 sm:h-20 bg-[#4a3728]/10 border-2 border-dashed border-[#5c4033]/60 rounded flex items-center justify-center text-[10px] sm:text-xs text-[#4a3728]">
            切手
            <br />
            予定地
          </div>

          {/* 宛名 */}
          <h2 className="font-dancing font-bold text-3xl sm:text-4xl md:text-5xl text-[#6a4e37] mt-2 sm:mt-4 mb-4 sm:mb-6 drop-shadow-sm">
            To: Shogo Morisawa
          </h2>

          {/* フォーム */}
          <form
            onSubmit={handleSubmit}
            className="letter-form font-playfair flex-1 flex flex-col gap-4 sm:gap-5 min-h-0"
          >
            <div className="flex flex-col gap-0.5">
              <label className="text-xs sm:text-sm text-[#4a3728] font-bold">
                おなまえ (必須)
              </label>
              <div className="relative w-full h-12 sm:h-14">
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: 'url(/post/form_input.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="あなたのお名前"
                  required
                  className="absolute inset-0 bg-transparent border-0 outline-none px-3 py-2 text-[#3d2817] placeholder-[#7d6b5a] text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-xs sm:text-sm text-[#4a3728] font-bold">
                メールアドレス (返信を希望する場合のみ)
              </label>
              <div className="relative w-full h-12 sm:h-14">
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: 'url(/post/form_input.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sample@email.com"
                  className="absolute inset-0 bg-transparent border-0 outline-none px-3 py-2 text-[#3d2817] placeholder-[#7d6b5a] text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col gap-0.5 flex-1 min-h-16">
              <label className="text-xs sm:text-sm text-[#4a3728] font-bold">
                本文 (メッセージ)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="ここにあなたの言葉を綴ってください..."
                className="bg-transparent border-b border-[#5c4033] outline-none px-1 py-1 text-[#3d2817] placeholder-[#7d6b5a] focus:border-[#3d2817] transition-colors resize-none flex-1 min-h-20 text-sm sm:text-base"
              />
            </div>

            {/* SENDボタン（シーリングスタンプ） */}
            <button
              type="submit"
              className="self-center relative w-20 h-20 sm:w-24 sm:h-24 hover:scale-105 active:scale-95 transition-transform mt-2"
            >
              <Image
                src="/post/stamp.png"
                alt="送信"
                fill
                className="object-contain drop-shadow-lg"
                sizes="6rem"
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaGithub, FaInstagram } from "react-icons/fa";
import { useUIStore } from "@/shared/uiStore";

export default function PostOverlay() {
  const isOpen = useUIStore((state) => state.activeOverlay === "post");
  const closePost = useUIStore((state) => state.closePost);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);

  const handleClose = useCallback(() => {
    closePost();
  }, [closePost]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isStampModalOpen) {
        setIsStampModalOpen(false);
        return;
      }
      handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose, isOpen, isStampModalOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSending) return;

    setIsSending(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch("/api/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          message: message.trim() || undefined,
          meta: {
            sentAt: new Date().toISOString(),
            userAgent:
              typeof navigator !== "undefined" ? navigator.userAgent : undefined,
            screenSize:
              typeof window !== "undefined"
                ? `${window.innerWidth}x${window.innerHeight}`
                : undefined,
            language:
              typeof navigator !== "undefined" ? navigator.language : undefined,
          },
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "送信に失敗しました");
      }

      setName("");
      setEmail("");
      setMessage("");
      setSubmitSuccess(true);
      window.setTimeout(() => {
        handleClose();
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "送信に失敗しました");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-10000 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
      onClick={(event) => {
        if (event.target === overlayRef.current) handleClose();
      }}
    >
      <div
        className="relative max-md:absolute max-md:inset-x-0 max-md:top-1/2 max-md:-translate-y-1/2 max-md:h-[80vh] max-md:w-full md:h-[98vh] md:aspect-1294/1493 md:max-w-[90vw]"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src="/post/letter.png"
          alt="Letter"
          fill
          className="max-md:object-cover max-md:object-top md:object-contain md:object-center -z-10"
          sizes="(max-width: 768px) 100vw, min(90vw, 84.5vh)"
        />

        <button
          type="button"
          onClick={handleClose}
          aria-label="閉じる"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-[#4a3728]/80 hover:text-[#3d2817] text-2xl transition-colors drop-shadow-sm"
        >
          ×
        </button>

        <div className="absolute inset-0 flex flex-col p-6 sm:p-10 md:p-12 pt-8 sm:pt-12 md:pt-14">
          {submitSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-1">
              <p className="font-dancing text-2xl sm:text-3xl text-[#4a3728] font-bold text-center">
                Your letter has been sent.
              </p>
              <p className="font-playfair text-sm sm:text-base text-[#5c4033] text-center italic">
                Thank you for your message.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 mt-2 sm:mt-4 mb-4 sm:mb-6">
                <h2 className="font-dancing font-bold text-3xl sm:text-4xl md:text-5xl text-[#6a4e37] drop-shadow-sm shrink-0">
                  To: Shogo Morisawa
                </h2>
                <button
                  type="button"
                  onClick={() => setIsStampModalOpen(true)}
                  className="relative w-24 h-20 sm:w-28 sm:h-24 shrink-0 hover:scale-105 transition-transform duration-300 cursor-pointer drop-shadow-md"
                >
                  <Image
                    src="/post/stamp.png"
                    alt="SNS一覧を開く"
                    fill
                    className="object-contain"
                    sizes="7rem"
                  />
                </button>
              </div>

              {isStampModalOpen && (
                <div
                  className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
                  onClick={() => setIsStampModalOpen(false)}
                >
                  <div
                    className="relative w-full max-w-sm bg-[#f4ebd8] p-6 sm:p-8 rounded-md shadow-2xl border border-[#c1a68d] text-neutral-800"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setIsStampModalOpen(false)}
                      aria-label="閉じる"
                      className="absolute top-3 right-4 text-2xl text-neutral-500 hover:text-neutral-800 transition-colors"
                    >
                      ✕
                    </button>

                    <h3 className="font-playfair text-xl text-center mb-6 border-b border-neutral-400/50 pb-2">
                      My Connections
                    </h3>

                    <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                      <a
                        href="https://github.com/shogomorisawa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 hover:opacity-70 transition-opacity"
                      >
                        <div className="w-12 h-12 bg-neutral-800 text-[#f4ebd8] rounded-full flex items-center justify-center text-2xl shadow-md">
                          <FaGithub />
                        </div>
                        <span className="text-xs font-playfair">GitHub</span>
                      </a>
                      <a
                        href="https://www.instagram.com/ggg.glasspo/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 hover:opacity-70 transition-opacity"
                      >
                        <div className="w-12 h-12 bg-linear-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-full flex items-center justify-center shadow-md">
                          <FaInstagram className="text-2xl" />
                        </div>
                        <span className="text-xs font-playfair">Instagram 1</span>
                      </a>
                      <a
                        href="https://www.instagram.com/pkpk_mst/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 hover:opacity-70 transition-opacity"
                      >
                        <div className="w-12 h-12 bg-neutral-400 text-white rounded-full flex items-center justify-center shadow-md">
                          <FaInstagram className="text-2xl" />
                        </div>
                        <span className="text-xs font-playfair">Instagram 2</span>
                      </a>
                      {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 opacity-30">
                          <div className="w-12 h-12 border-2 border-dashed border-neutral-400 rounded-full flex items-center justify-center text-sm">
                            ?
                          </div>
                          <span className="text-xs font-playfair">Coming</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="letter-form font-playfair flex-1 flex flex-col gap-4 sm:gap-5 min-h-0"
              >
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs sm:text-sm text-[#4a3728] font-bold">
                    おなまえ
                  </label>
                  <div className="relative w-full h-12 sm:h-14">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: "url(/post/form_input.png)",
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="あなたのお名前"
                      required
                      className="absolute inset-0 bg-transparent border-0 outline-none pl-[8%] pr-[8%] py-2 text-[#3d2817] placeholder-[#7d6b5a] text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <label className="text-xs sm:text-sm text-[#4a3728] font-bold">
                    メールアドレス
                  </label>
                  <div className="relative w-full h-12 sm:h-14">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: "url(/post/form_input.png)",
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="返信が必要な場合のみ（空欄でも届きます）"
                      className="absolute inset-0 bg-transparent border-0 outline-none pl-[8%] pr-[8%] py-2 text-[#3d2817] placeholder-[#7d6b5a] text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 flex-1 min-h-16">
                  <label className="text-xs sm:text-sm text-[#4a3728] font-bold">
                    メッセージ
                  </label>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="あいうえお〜〜メッセージをどうぞ。なんでもお気軽に書いてください。"
                    required
                    className="bg-transparent border-b border-[#5c4033] outline-none px-1 py-1 text-[#3d2817] placeholder-[#7d6b5a] focus:border-[#3d2817] transition-colors resize-none flex-1 min-h-20 text-sm sm:text-base"
                  />
                </div>

                {submitError && (
                  <p className="text-sm text-red-600 text-center mt-1">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSending}
                  className="self-center relative w-20 h-20 sm:w-24 sm:h-24 hover:scale-105 active:scale-95 transition-transform mt-2 disabled:opacity-60 disabled:pointer-events-none"
                >
                  <Image
                    src="/post/send-button.png"
                    alt="送信"
                    fill
                    className="object-contain drop-shadow-lg"
                    sizes="6rem"
                  />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

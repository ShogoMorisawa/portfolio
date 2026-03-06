"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useInputStore } from "@/lib/world/store";
import { LAYOUT } from "@/lib/world/config";

export default function InteractionUI() {
  const activeCrystalId = useInputStore((state) => state.activeCrystalId);
  const isTalking = useInputStore((state) => state.isTalking);
  const activeMessage = useInputStore((state) => state.activeMessage);
  const setIsTalking = useInputStore((state) => state.setIsTalking);
  const setTargetPosition = useInputStore((state) => state.setTargetPosition);
  const isBookNearby = useInputStore((state) => state.isBookNearby);
  const isAdventureBookOpen = useInputStore(
    (state) => state.isAdventureBookOpen,
  );
  const setIsAdventureBookOpen = useInputStore(
    (state) => state.setIsAdventureBookOpen,
  );
  const isBoxNearby = useInputStore((state) => state.isBoxNearby);
  const boxView = useInputStore((state) => state.boxView);
  const setBoxView = useInputStore((state) => state.setBoxView);
  const isPostNearby = useInputStore((state) => state.isPostNearby);
  const isPostOpen = useInputStore((state) => state.isPostOpen);
  const setIsPostOpen = useInputStore((state) => state.setIsPostOpen);
  const isComputerNearby = useInputStore((state) => state.isComputerNearby);
  const isComputerOpen = useInputStore((state) => state.isComputerOpen);
  const setIsComputerOpen = useInputStore((state) => state.setIsComputerOpen);
  const tabletScreenImageIndex = useInputStore(
    (state) => state.tabletScreenImageIndex,
  );
  const setTabletScreenImageIndex = useInputStore(
    (state) => state.setTabletScreenImageIndex,
  );
  const [showComputerWhitePanel, setShowComputerWhitePanel] = useState(false);
  const [showComputerFrame, setShowComputerFrame] = useState(false);

  const handleStartTalk = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsTalking(true);
  };

  const handleOpenAdventureBook = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsAdventureBookOpen(true);
  };

  const handleOpenBox = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setBoxView("menu");
  };

  const handleOpenPost = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsPostOpen(true);
  };

  const handleOpenComputer = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsComputerOpen(true);
  };

  const handleEndTalk = () => {
    setTargetPosition(null);
    setIsTalking(false);
  };

  const handleCloseComputer = useCallback(() => {
    setShowComputerWhitePanel(false);
    setShowComputerFrame(false);
    setIsComputerOpen(false);
  }, [setIsComputerOpen]);

  useEffect(() => {
    if (!isComputerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseComputer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleCloseComputer, isComputerOpen]);

  useEffect(() => {
    if (!isComputerOpen) return;
    const whitePanelTimer = window.setTimeout(
      () => setShowComputerWhitePanel(true),
      250,
    );
    const frameTimer = window.setTimeout(() => setShowComputerFrame(true), 600);
    return () => {
      window.clearTimeout(whitePanelTimer);
      window.clearTimeout(frameTimer);
    };
  }, [isComputerOpen]);

  return (
    <div className="absolute inset-0 pointer-events-none z-9999">
      {/* 会話開始ボタン (Tap!) - クリスタル優先 */}
      {!isTalking && activeCrystalId && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={handleStartTalk}
            className="pointer-events-auto cursor-pointer group relative flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-110 hover:bg-white/40 active:scale-95 animate-pulse"
          >
            <span className="text-white font-bold text-xl tracking-widest drop-shadow-md group-hover:text-yellow-200">
              TAP
            </span>
            <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-50" />
          </button>
        </div>
      )}

      {/* Computer の TAP - 作品集を開く */}
      {!isTalking &&
        !activeCrystalId &&
        !isBookNearby &&
        !isBoxNearby &&
        !isPostNearby &&
        isComputerNearby &&
        !isComputerOpen && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={handleOpenComputer}
              className="pointer-events-auto cursor-pointer group relative flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-110 hover:bg-white/40 active:scale-95 animate-pulse"
            >
              <span className="text-white font-bold text-xl tracking-widest drop-shadow-md group-hover:text-yellow-200">
                TAP
              </span>
              <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-50" />
            </button>
          </div>
        )}

      {/* Post の TAP - ポストを開く */}
      {!isTalking &&
        !activeCrystalId &&
        !isBookNearby &&
        !isBoxNearby &&
        isPostNearby &&
        !isPostOpen && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={handleOpenPost}
              className="pointer-events-auto cursor-pointer group relative flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-110 hover:bg-white/40 active:scale-95 animate-pulse"
            >
              <span className="text-white font-bold text-xl tracking-widest drop-shadow-md group-hover:text-yellow-200">
                TAP
              </span>
              <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-50" />
            </button>
          </div>
        )}

      {/* Box の TAP - アイテムBOXを開く（メインメニューへ） */}
      {!isTalking &&
        !activeCrystalId &&
        !isBookNearby &&
        isBoxNearby &&
        boxView === "closed" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={handleOpenBox}
              className="pointer-events-auto cursor-pointer group relative flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-110 hover:bg-white/40 active:scale-95 animate-pulse"
            >
              <span className="text-white font-bold text-xl tracking-widest drop-shadow-md group-hover:text-yellow-200">
                TAP
              </span>
              <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-50" />
            </button>
          </div>
        )}

      {/* 本の TAP - ぼうけんのしょを開く */}
      {!isTalking &&
        !activeCrystalId &&
        isBookNearby &&
        !isAdventureBookOpen && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={handleOpenAdventureBook}
              className="pointer-events-auto cursor-pointer group relative flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-110 hover:bg-white/40 active:scale-95 animate-pulse"
            >
              <span className="text-white font-bold text-xl tracking-widest drop-shadow-md group-hover:text-yellow-200">
                TAP
              </span>
              <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-50" />
            </button>
          </div>
        )}

      {/* コンピューターセクション: 白い画面 + 額縁 + 作品情報 */}
      {isComputerOpen &&
        (() => {
          const imageList =
            LAYOUT.TABLET_SCREEN_IMAGES.length > 0
              ? LAYOUT.TABLET_SCREEN_IMAGES
              : LAYOUT.TABLET_SCREEN_IMAGE
                ? [LAYOUT.TABLET_SCREEN_IMAGE]
                : ["/computer/oox.png"];
          const computerWorks = imageList.map((imageSrc, index) => {
            if (imageSrc.includes("oox")) {
              return {
                imageSrc,
                title: "OoX",
                description:
                  "ユングの心理機能8種類を判断の優先順で羅列して、4つの階層に分けて、さらに各機能の健全度まで測る。そうすることで、人の性格をより詳しく記述できる気がして作り始めた、まだまだこれからの試作品です。",
                href: "https://oox-seven.vercel.app/",
              };
            }
            if (/(cat|neko|kitty|猫)/i.test(imageSrc)) {
              return {
                imageSrc,
                title: "猫ちゃん",
                description:
                  "webデザイナーにでもなろうかと思って、絵描いて飾る額縁としてサイトを作ろうと思ったのが、プログラミングを本格的に始めるきっかけでした。",
                href: undefined,
              };
            }
            return {
              imageSrc,
              title: `Work ${index + 1}`,
              description: "準備中の作品です。",
              href: undefined,
            };
          });
          const currentIndex =
            imageList.length > 0
              ? ((tabletScreenImageIndex % imageList.length) +
                  imageList.length) %
                imageList.length
              : 0;
          const currentWork = computerWorks[currentIndex] ?? computerWorks[0];
          const canSwitch = computerWorks.length >= 2;
          return (
            <div
              className="absolute inset-0 z-10000 pointer-events-auto cursor-pointer"
              onClick={handleCloseComputer}
              aria-label="閉じる"
            >
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[82dvh] md:h-full md:w-[min(90vw,760px)] md:rounded-xl px-3 md:px-10 pt-6 md:pt-10 pb-8 md:pb-8 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={`absolute z-0 left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 w-full h-[50%] bg-white rounded-lg md:rounded-xl transition-opacity duration-400 ${
                    showComputerWhitePanel ? "opacity-100" : "opacity-0"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleCloseComputer}
                  className="absolute z-20 top-3 right-3 md:top-4 md:right-4 w-10 h-10 flex items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800 text-2xl leading-none hover:bg-neutral-100 cursor-pointer"
                  aria-label="閉じる"
                >
                  ×
                </button>
                <div
                  className={`relative z-10 w-full max-w-[90vw] md:max-w-[520px] mx-auto aspect-square transition-opacity duration-1200 ease-out ${
                    showComputerFrame ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src="/computer/frame.png"
                    alt="frame"
                    fill
                    className="object-contain"
                    priority
                  />
                  {canSwitch && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTabletScreenImageIndex(
                            (i) =>
                              (i - 1 + computerWorks.length) %
                              computerWorks.length,
                          );
                        }}
                        className="absolute z-20 left-[-6px] md:left-[-10px] top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/55 hover:bg-black/70 transition-colors cursor-pointer"
                        aria-label="前の作品"
                      >
                        <span
                          className="w-0 h-0 border-y-[9px] md:border-y-[10px] border-y-transparent border-r-[14px] md:border-r-[16px] border-r-white"
                          aria-hidden
                        />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTabletScreenImageIndex(
                            (i) => (i + 1) % computerWorks.length,
                          );
                        }}
                        className="absolute z-20 right-[-6px] md:right-[-10px] top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/55 hover:bg-black/70 transition-colors cursor-pointer"
                        aria-label="次の作品"
                      >
                        <span
                          className="w-0 h-0 border-y-[9px] md:border-y-[10px] border-y-transparent border-l-[14px] md:border-l-[16px] border-l-white"
                          aria-hidden
                        />
                      </button>
                    </>
                  )}
                  <div className="absolute inset-[18.6%] -translate-y-[1px]">
                    {currentWork.href ? (
                      <a
                        href={currentWork.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 block cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`${currentWork.title} のサイトを開く`}
                      >
                        <Image
                          src={currentWork.imageSrc}
                          alt={currentWork.title}
                          fill
                          className="object-cover"
                          priority
                        />
                      </a>
                    ) : (
                      <Image
                        src={currentWork.imageSrc}
                        alt={currentWork.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
                  </div>
                </div>
                <div
                  className={`relative z-10 mt-5 text-center text-neutral-900 transition-opacity duration-1200 ease-out ${
                    showComputerFrame ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <h3 className="text-2xl md:text-3xl font-bold tracking-wide">
                    {currentWork.title}
                  </h3>
                  <p className="mt-3 text-sm md:text-base leading-relaxed text-neutral-700">
                    {currentWork.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

      {/* 会話モード (全画面オーバーレイ) */}
      {isTalking && activeMessage && (
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto cursor-pointer"
          onClick={handleEndTalk}
        >
          {/* メッセージウィンドウ (下部) */}
          <div className="absolute bottom-20 left-0 right-0 flex justify-center px-4">
            <div
              className="bg-black/80 text-white p-8 rounded-2xl max-w-2xl w-full text-center shadow-2xl border border-white/10 transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-lg md:text-2xl font-medium leading-relaxed font-sans">
                {activeMessage}
              </p>
              <p className="mt-4 text-xs text-gray-400 opacity-70">
                Tap anywhere to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

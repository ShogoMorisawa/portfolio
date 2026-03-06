"use client";

import React, { useCallback, useEffect } from "react";
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
  const setTabletScreenImageIndex = useInputStore(
    (state) => state.setTabletScreenImageIndex,
  );

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

      {/* コンピューターセクション: タブレットのみ表示。タップ or Escape で閉じる。左右で画像切り替え */}
      {isComputerOpen && (() => {
        const imageList =
          LAYOUT.TABLET_SCREEN_IMAGES.length > 0
            ? LAYOUT.TABLET_SCREEN_IMAGES
            : LAYOUT.TABLET_SCREEN_IMAGE
              ? [LAYOUT.TABLET_SCREEN_IMAGE]
              : [];
        const canSwitch = imageList.length >= 2;
        return (
          <div
            className="absolute inset-0 z-10000 pointer-events-auto cursor-pointer"
            onClick={handleCloseComputer}
            aria-label="閉じる"
          >
            {canSwitch && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTabletScreenImageIndex(
                      (i) =>
                        (i - 1 + imageList.length) % imageList.length,
                    );
                  }}
                  className="absolute left-[12%] top-1/2 -translate-y-1/2 min-w-14 min-h-14 flex items-center justify-center pointer-events-auto cursor-pointer rounded-full hover:bg-white/10 transition-colors"
                  aria-label="前の画像"
                >
                  <span
                    className="w-0 h-0 border-y-[20px] border-y-transparent border-r-[28px] border-r-white/90 drop-shadow-lg pointer-events-none"
                    aria-hidden
                  />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTabletScreenImageIndex(
                      (i) => (i + 1) % imageList.length,
                    );
                  }}
                  className="absolute right-[12%] top-1/2 -translate-y-1/2 min-w-14 min-h-14 flex items-center justify-center pointer-events-auto cursor-pointer rounded-full hover:bg-white/10 transition-colors"
                  aria-label="次の画像"
                >
                  <span
                    className="w-0 h-0 border-y-[20px] border-y-transparent border-l-[28px] border-l-white/90 drop-shadow-lg pointer-events-none"
                    aria-hidden
                  />
                </button>
              </>
            )}
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

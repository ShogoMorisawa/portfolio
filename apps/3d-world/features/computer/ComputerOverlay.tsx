"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useUIStore } from "@/shared/uiStore";
import { COMPUTER_WORKS } from "./computerData";

const COMPACT_LANDSCAPE_MAX_HEIGHT = 520;

export default function ComputerOverlay() {
  const isOpen = useUIStore((state) => state.activeOverlay === "computer");
  const closeComputer = useUIStore((state) => state.closeComputer);
  const tabletScreenImageIndex = useUIStore(
    (state) => state.tabletScreenImageIndex,
  );
  const setTabletScreenImageIndex = useUIStore(
    (state) => state.setTabletScreenImageIndex,
  );
  const [showWhitePanel, setShowWhitePanel] = useState(false);
  const [showFrame, setShowFrame] = useState(false);
  const [isCompactLandscape, setIsCompactLandscape] = useState(false);

  const handleClose = useCallback(() => {
    setShowWhitePanel(false);
    setShowFrame(false);
    closeComputer();
  }, [closeComputer]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const whitePanelTimer = window.setTimeout(
      () => setShowWhitePanel(true),
      250,
    );
    const frameTimer = window.setTimeout(() => setShowFrame(true), 600);

    return () => {
      window.clearTimeout(whitePanelTimer);
      window.clearTimeout(frameTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updateLayoutMode = () => {
      if (typeof window === "undefined") return;

      setIsCompactLandscape(
        window.innerWidth > window.innerHeight &&
          window.innerHeight <= COMPACT_LANDSCAPE_MAX_HEIGHT,
      );
    };

    updateLayoutMode();
    window.addEventListener("resize", updateLayoutMode);

    return () => window.removeEventListener("resize", updateLayoutMode);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentIndex =
    ((tabletScreenImageIndex % COMPUTER_WORKS.length) + COMPUTER_WORKS.length) %
    COMPUTER_WORKS.length;
  const currentWork = COMPUTER_WORKS[currentIndex] ?? COMPUTER_WORKS[0];
  const canSwitch = COMPUTER_WORKS.length >= 2;
  const shellClassName = isCompactLandscape
    ? "absolute left-1/2 top-1/2 flex h-[min(96dvh,31rem)] w-[min(58vw,36rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden px-4 pt-4 pb-4"
    : "computer-shell absolute left-1/2 top-1/2 flex h-[82dvh] w-full -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden px-3 pt-6 pb-8 md:h-full md:w-[min(78vw,42rem)] md:rounded-xl md:px-10 md:pt-10 md:pb-8 md:landscape:w-[50vw]";
  const whitePanelClassName = isCompactLandscape
    ? `absolute inset-0 z-0 rounded-lg bg-white transition-opacity duration-400 ${
        showWhitePanel ? "opacity-100" : "opacity-0"
      }`
    : `computer-white-panel absolute z-0 left-1/2 top-[35%] h-[50%] w-full -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white transition-opacity duration-400 md:rounded-xl ${
        showWhitePanel ? "opacity-100" : "opacity-0"
      }`;
  const contentClassName = isCompactLandscape
    ? `relative z-10 my-auto flex min-h-0 flex-1 flex-row items-center gap-3 transition-opacity duration-1200 ease-out ${
        showFrame ? "opacity-100" : "opacity-0"
      }`
    : `computer-content relative z-10 my-auto flex w-full flex-col transition-opacity duration-1200 ease-out max-[760px]:my-0 ${
        showFrame ? "opacity-100" : "opacity-0"
      }`;
  const frameWrapClassName = isCompactLandscape
    ? "flex h-auto min-h-0 w-[44%] flex-none items-center justify-center"
    : "computer-frame-wrap flex h-[min(90vw,50dvh)] min-h-[280px] items-center justify-center md:h-[min(50vw,520px,52dvh)] xl:h-[min(50vw,620px,56dvh)] min-[1920px]:h-[min(50vw,760px,54dvh)]";
  const frameClassName = isCompactLandscape
    ? "relative mx-auto aspect-square w-[min(34vw,52dvh)]"
    : "computer-frame relative mx-auto aspect-square w-[min(90vw,50dvh)] md:w-[min(50vw,520px,52dvh)] xl:w-[min(50vw,620px,56dvh)] min-[1920px]:w-[min(50vw,760px,54dvh)]";
  const copyClassName = isCompactLandscape
    ? "mt-0 min-h-0 flex-1 text-left text-neutral-900"
    : "computer-copy mt-4 mx-auto w-full max-w-[min(96vw,560px)] min-h-[120px] text-center text-neutral-900 max-[760px]:min-h-[96px] max-[680px]:min-h-[80px] md:min-h-[136px] xl:max-w-[680px] xl:min-h-[152px] min-[1920px]:max-w-[820px] min-[1920px]:min-h-[176px]";
  const titleClassName = isCompactLandscape
    ? "type-title text-[1.25rem] leading-tight font-bold tracking-wide"
    : "computer-title type-title font-bold tracking-wide";
  const descriptionClassName = isCompactLandscape
    ? "type-body mt-2 max-h-[52dvh] overflow-y-auto pr-1 text-[0.8125rem] leading-[1.45] text-neutral-700"
    : "computer-description type-body mt-3 text-neutral-700";

  return (
    <div
      className="absolute inset-0 z-10000 pointer-events-auto cursor-pointer"
      onClick={handleClose}
      aria-label="閉じる"
    >
      <div
        className={shellClassName}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={whitePanelClassName} />
        <button
          type="button"
          onClick={handleClose}
          className="absolute z-20 top-3 right-3 md:top-4 md:right-4 xl:top-5 xl:right-5 min-[1920px]:top-6 min-[1920px]:right-6 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white text-[1.7rem] leading-none text-neutral-800 hover:bg-neutral-100 cursor-pointer md:h-12 md:w-12 xl:h-14 xl:w-14 min-[1920px]:h-16 min-[1920px]:w-16 min-[1920px]:text-[2.1rem]"
          aria-label="閉じる"
        >
          ×
        </button>
        <div className={contentClassName}>
          <div className={frameWrapClassName}>
            <div className={frameClassName}>
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
                    onClick={(event) => {
                      event.stopPropagation();
                      setTabletScreenImageIndex(
                        (index) =>
                          (index - 1 + COMPUTER_WORKS.length) %
                          COMPUTER_WORKS.length,
                      );
                    }}
                    className="absolute z-20 left-[-8px] md:left-[-12px] xl:left-[-16px] min-[1920px]:left-[-22px] top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 transition-colors cursor-pointer hover:bg-black/70 md:h-13 md:w-13 xl:h-15 xl:w-15 min-[1920px]:h-18 min-[1920px]:w-18"
                    aria-label="前の作品"
                  >
                    <span
                      className="h-0 w-0 border-y-10 border-y-transparent border-r-15 border-r-white md:border-y-11 md:border-r-17 xl:border-y-13 xl:border-r-20 min-[1920px]:border-y-15 min-[1920px]:border-r-24"
                      aria-hidden
                    />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setTabletScreenImageIndex(
                        (index) => (index + 1) % COMPUTER_WORKS.length,
                      );
                    }}
                    className="absolute z-20 right-[-8px] md:right-[-12px] xl:right-[-16px] min-[1920px]:right-[-22px] top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 transition-colors cursor-pointer hover:bg-black/70 md:h-13 md:w-13 xl:h-15 xl:w-15 min-[1920px]:h-18 min-[1920px]:w-18"
                    aria-label="次の作品"
                  >
                    <span
                      className="h-0 w-0 border-y-10 border-y-transparent border-l-15 border-l-white md:border-y-11 md:border-l-17 xl:border-y-13 xl:border-l-20 min-[1920px]:border-y-15 min-[1920px]:border-l-24"
                      aria-hidden
                    />
                  </button>
                </>
              )}
              <div className="absolute inset-[18.6%] -translate-y-px">
                {currentWork.href ? (
                  <a
                    href={currentWork.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 block cursor-pointer"
                    onClick={(event) => event.stopPropagation()}
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
          </div>
          <div className={copyClassName}>
            <h3 className={titleClassName}>
              {currentWork.title}
            </h3>
            <p className={descriptionClassName}>
              {currentWork.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

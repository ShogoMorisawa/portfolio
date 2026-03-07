"use client";

import React, { useCallback, memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useUIStore } from "@/shared/uiStore";
import {
  BOX_MENU_ENTRIES,
  SKILL_ENTRIES,
  ITEM_ENTRIES,
  SLOTS_PER_PAGE,
  type BoxMenuEntry,
  type SkillEntry,
  type ItemEntry,
} from "@/features/box/boxData";

/** レア度（1〜5）に応じたテキスト色 */
function getRarityColorClass(rare: number): string {
  const map: Record<number, string> = {
    1: "text-gray-400",
    2: "text-blue-400",
    3: "text-purple-400",
    4: "text-amber-400",
    5: "text-amber-300",
  };
  return map[rare] ?? "text-gray-400";
}

/** モンハン風フレーム（角張った枠・暗い背景・琥珀のアクセント） */
const FRAME_CLASS =
  "bg-[#1a1510] border-x-2 border-y-0 border-[#a47a34]/80 text-amber-100 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]";

const SELECTED_CELL_CONTAINER_CLASSES = [
  "relative",
  "z-10",
  "[box-shadow:0_0_0_3px_rgb(250,204,21)]",
];

const SELECTED_CELL_BUTTON_CLASSES = ["bg-[#52c234]", "opacity-100"];
const BASE_CELL_BUTTON_BG_CLASS = "bg-[#796296]";
const EMPTY_CELL_OPACITY_CLASS = "opacity-50";
const MOBILE_GRID_SIZE = 6;
const MOBILE_SLOTS_PER_PAGE = MOBILE_GRID_SIZE * MOBILE_GRID_SIZE;

/** メインメニュー: 左側縦並びメニュー */
function BoxMenuView({
  onSelect,
  onClose,
}: {
  onSelect: (id: BoxMenuEntry["id"]) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full font-adventure">
      <div className="flex flex-col gap-2 p-4 md:p-6">
        {BOX_MENU_ENTRIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry.id)}
            className={`
              w-full text-left px-5 py-4 rounded-none
              ${FRAME_CLASS} font-bold text-lg
              hover:bg-amber-900/40 hover:border-black/60 transition-colors
            `}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className="mt-auto p-4">
        <button
          type="button"
          onClick={onClose}
          className={`
            w-full px-5 py-3 rounded-none border border-black/60
            bg-black/60 text-amber-100 font-bold
            hover:bg-amber-900/40 transition-colors
          `}
        >
          とじる
        </button>
      </div>
    </div>
  );
}

/** 剣型 clip-path（右端が尖った多角形）。枠・中身の両方で共通 */
const SWORD_CLIP =
  "[clip-path:polygon(0_0,calc(100%-12px)_0,100%_50%,calc(100%-12px)_100%,0_100%)]";

/** 斬れ味ゲージ（モンハン風・画像なしCSSのみ）Lv1〜6で左から色を追加 */
function JukurenGauge({ level }: { level: number }) {
  const clampedLevel = Math.min(6, Math.max(1, level));
  /** Lv1=赤+橙(2色) … Lv6=全7色。表示するセグメント数 = clampedLevel + 1 */
  const visibleCount = clampedLevel + 1;
  const segmentWidthPercent = 100 / 7;
  const colors = [
    "bg-red-600",
    "bg-orange-500",
    "bg-yellow-400",
    "bg-green-500",
    "bg-blue-600",
    "bg-white",
    "bg-purple-500",
  ] as const;

  return (
    <div className="flex items-center gap-0">
      {/* 取手（横長の持ち手） */}
      <div
        className="h-2.5 w-4 shrink-0 rounded-l-sm bg-gray-600 shadow-[inset_0_0_2px_rgba(0,0,0,0.5)] border border-gray-500/80 border-r-0"
        aria-hidden
      />
      {/* 鍔（刃との境） */}
      <div
        className="h-4 w-1.5 shrink-0 self-center rounded-sm bg-gray-500 shadow-[inset_0_0_2px_rgba(0,0,0,0.5)]"
        aria-hidden
      />
      {/* 刃部分: グレー枠 → 黒で少し小さく切り抜き → 中に色バー */}
      <div className="relative h-3 w-40 shrink-0">
        {/* 外枠（金属風グレー・やや太く暗く） */}
        <div
          className={`absolute inset-0 bg-gray-600 ${SWORD_CLIP}`}
          aria-hidden
        />
        {/* 内側（少し小さく＝擬似枠線） */}
        <div
          className={`absolute inset-[2px] bg-black ${SWORD_CLIP}`}
          aria-hidden
        />
        {/* 色バー（左から level 個だけ表示） */}
        <div className={`absolute inset-[2px] flex ${SWORD_CLIP}`} aria-hidden>
          {colors.map((bg, i) => (
            <div
              key={i}
              className={`h-full shrink-0 ${i < visibleCount ? bg : "bg-transparent"}`}
              style={{
                width: i < visibleCount ? `${segmentWidthPercent}%` : 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** スキル詳細パネル用の統一区切り線 */
const SKILL_PANEL_DIVIDER =
  "border-b-[3px] border-dashed border-[#2a364f] my-0.5";

/** スキル用詳細パネル（モンハンステータス画面風・画像構造準拠） */
function SkillDetailPanel({ skill }: { skill: SkillEntry | null }) {
  if (!skill) {
    return (
      <div className="p-2 bg-[#0b101c] text-amber-200/60 text-xs">
        スロットを選択してください
      </div>
    );
  }
  const dropShadow = {
    textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,1)",
  } as const;
  return (
    <div className="p-2 flex flex-col bg-[#0b101c] min-h-0">
      {/* 1. 最上段: アイコンと名前 */}
      <div className="flex items-center gap-2">
        <div
          className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-black/50 bg-black/50 text-xl md:text-2xl shrink-0 overflow-hidden ${getRarityColorClass(skill.rare)}`}
          style={dropShadow}
        >
          {skill.url ? (
            <Image
              src={skill.url}
              alt=""
              width={48}
              height={48}
              className="w-full h-full object-contain p-0.5"
            />
          ) : (
            <span className="font-bold">{skill.name.slice(0, 1)}</span>
          )}
        </div>
        <p
          className="text-xl md:text-2xl font-bold text-[#fceeb5] min-w-0 truncate"
          style={dropShadow}
        >
          {skill.name}
        </p>
      </div>

      {/* 2. 2段目: RARE表記（右寄せ） */}
      <div className="flex justify-end mt-0.5">
        <span
          className={`text-xs md:text-sm font-bold ${getRarityColorClass(skill.rare)}`}
          style={dropShadow}
        >
          RARE {skill.rare}
        </span>
      </div>

      {/* 3. 区切り線1 */}
      <div className={SKILL_PANEL_DIVIDER} aria-hidden />

      {/* 4. 3段目: 攻撃力 */}
      <div className="flex justify-between items-center py-0">
        <span
          className="text-white font-bold text-sm md:text-base"
          style={dropShadow}
        >
          ◆ 攻撃力
        </span>
        <span
          className="text-white font-bold text-sm md:text-base tabular-nums"
          style={dropShadow}
        >
          {skill.attack}
        </span>
      </div>

      {/* 5. 区切り線2 */}
      <div className={SKILL_PANEL_DIVIDER} aria-hidden />

      {/* 6. 4段目: 斬れ味ラベル */}
      <div className="py-0">
        <span
          className="text-white font-bold text-sm md:text-base"
          style={dropShadow}
        >
          ◆ 斬れ味
        </span>
      </div>

      {/* 7. 区切り線3 */}
      <div className={SKILL_PANEL_DIVIDER} aria-hidden />

      {/* 8. 5段目: 斬れ味ゲージ（右寄せ） */}
      <div className="flex justify-end py-0">
        <JukurenGauge level={skill.level} />
      </div>

      {/* 9. 区切り線4 */}
      <div className={SKILL_PANEL_DIVIDER} aria-hidden />

      {/* 10. 最下段: 説明文 */}
      <p className="text-sm text-amber-100/90 leading-tight pt-0 min-h-0 overflow-hidden line-clamp-4">
        {skill.description}
      </p>
    </div>
  );
}

/** アイテム用詳細パネル（1画面収まり用に圧縮） */
function ItemDetailPanel({ item }: { item: ItemEntry | null }) {
  if (!item) {
    return (
      <div className="p-2 text-amber-200/60 text-xs">
        スロットを選択してください
      </div>
    );
  }
  return (
    <div className="p-2 flex flex-col min-h-0 gap-1">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-black/50 bg-black/50 text-xl text-amber-200 shrink-0">
          {item.iconPath ? (
            <Image
              src={item.iconPath}
              alt=""
              width={48}
              height={48}
              className="w-full h-full object-contain p-0.5"
            />
          ) : (
            <span className="font-bold">{item.name.slice(0, 1)}</span>
          )}
        </div>
        <p className="font-bold text-amber-100 text-xl wrap-break-word min-w-0">
          {item.name}
        </p>
      </div>
      <div className={SKILL_PANEL_DIVIDER} aria-hidden />
      <p className="text-sm text-amber-100/90 leading-tight line-clamp-4">
        {item.description}
      </p>
    </div>
  );
}

/** グリッドの1マス。選択ハイライトは親でDOM更新し、ここは静的描画に寄せる */
const BoxGridCell = memo(function BoxGridCell({
  entry,
  globalIndex,
  onSelectSlot,
  onMountContainer,
  onMountButton,
}: {
  entry: SkillEntry | ItemEntry | null;
  globalIndex: number;
  onSelectSlot: (index: number) => void;
  onMountContainer: (index: number, el: HTMLDivElement | null) => void;
  onMountButton: (index: number, el: HTMLButtonElement | null) => void;
}) {
  const displayName = entry
    ? ((entry as ItemEntry).name ?? (entry as SkillEntry).name)
    : "";
  const displayChar = displayName ? displayName.slice(0, 1) : "";
  const handleClick = useCallback(
    () => onSelectSlot(globalIndex),
    [onSelectSlot, globalIndex],
  );
  const handleContainerRef = useCallback(
    (el: HTMLDivElement | null) => onMountContainer(globalIndex, el),
    [onMountContainer, globalIndex],
  );
  const handleRef = useCallback(
    (el: HTMLButtonElement | null) => onMountButton(globalIndex, el),
    [onMountButton, globalIndex],
  );

  return (
    <div ref={handleContainerRef} className="aspect-square min-w-0">
      <button
        ref={handleRef}
        data-empty={entry ? "false" : "true"}
        type="button"
        onClick={handleClick}
        className={`
          w-full h-full flex items-center justify-center
          [clip-path:polygon(5px_0,calc(100%-5px)_0,100%_5px,100%_calc(100%-5px),calc(100%-5px)_100%,5px_100%,0_calc(100%-5px),0_5px)]
          text-xs font-bold font-adventure
          ${BASE_CELL_BUTTON_BG_CLASS} shadow-[inset_0_0_4px_rgba(0,0,0,0.3)]
          ${entry ? "" : EMPTY_CELL_OPACITY_CLASS}
        `}
      >
        {entry ? (
          ("iconPath" in entry && entry.iconPath) ||
          ("url" in entry && entry.url) ? (
            <Image
              src={
                ("iconPath" in entry
                  ? entry.iconPath
                  : (entry as SkillEntry).url) ?? ""
              }
              alt=""
              width={64}
              height={64}
              className="w-full h-full object-contain p-0.5"
            />
          ) : (
            <span className="text-white drop-shadow-sm">{displayChar}</span>
          )
        ) : (
          <span className="text-black/40">－</span>
        )}
      </button>
    </div>
  );
});

/** PC:10×10 / Mobile:6×6 グリッド */
function BoxGridView() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const isOpen = useUIStore((s) => s.activeOverlay === "box");
  const boxView = useUIStore((s) => s.boxView);
  const activeBoxCategory = useUIStore((s) => s.activeBoxCategory);
  const currentBoxPage = useUIStore((s) => s.currentBoxPage);
  const selectedBoxSlotIndex = useUIStore((s) => s.selectedBoxSlotIndex);
  const setCurrentBoxPage = useUIStore((s) => s.setCurrentBoxPage);
  const setSelectedBoxSlotIndex = useUIStore(
    (s) => s.setSelectedBoxSlotIndex,
  );
  const containerRefMap = useRef<Map<number, HTMLDivElement>>(new Map());
  const buttonRefMap = useRef<Map<number, HTMLButtonElement>>(new Map());
  const highlightedIndexRef = useRef(-1);

  const handleSelectSlot = useCallback(
    (index: number) => {
      if (index === useUIStore.getState().selectedBoxSlotIndex) return;
      setSelectedBoxSlotIndex(index);
    },
    [setSelectedBoxSlotIndex],
  );

  const handleMountButton = useCallback(
    (index: number, el: HTMLButtonElement | null) => {
      if (!el) {
        buttonRefMap.current.delete(index);
        return;
      }
      buttonRefMap.current.set(index, el);
    },
    [],
  );
  const handleMountContainer = useCallback(
    (index: number, el: HTMLDivElement | null) => {
      if (!el) {
        containerRefMap.current.delete(index);
        return;
      }
      containerRefMap.current.set(index, el);
    },
    [],
  );

  const isGridActive = isOpen && boxView === "grid" && activeBoxCategory !== null;
  const isSkills = activeBoxCategory === "skills";
  const entries = isSkills ? SKILL_ENTRIES : ITEM_ENTRIES;
  const slotsPerPage = isMobile ? MOBILE_SLOTS_PER_PAGE : SLOTS_PER_PAGE;
  const gridCols = isMobile ? 6 : 10;
  const pageCount = Math.max(1, Math.ceil(entries.length / slotsPerPage));
  /** 隙間を固定2pxにし、セルは minmax(0, 1fr) で均等割り */
  const gridGapPx = 2;
  const gridTemplateStyle = {
    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${gridCols}, minmax(0, 1fr))`,
    gap: `${gridGapPx}px`,
  } as const;
  const startIndex = (currentBoxPage - 1) * slotsPerPage;

  const selectedEntry =
    selectedBoxSlotIndex >= 0 && selectedBoxSlotIndex < entries.length
      ? entries[selectedBoxSlotIndex]
      : null;

  const gridCells = Array.from({ length: slotsPerPage }, (_, i) => {
    const globalIndex = startIndex + i;
    const entry =
      globalIndex >= 0 && globalIndex < entries.length
        ? (entries[globalIndex] as SkillEntry | ItemEntry)
        : null;
    return (
      <BoxGridCell
        key={globalIndex}
        entry={entry}
        globalIndex={globalIndex}
        onSelectSlot={handleSelectSlot}
        onMountContainer={handleMountContainer}
        onMountButton={handleMountButton}
      />
    );
  });

  const headerTitle = isSkills ? "装備BOX" : "アイテムBOX";
  const footerName = selectedEntry
    ? ((selectedEntry as ItemEntry).name ?? (selectedEntry as SkillEntry).name)
    : "";
  const footerQuantity =
    selectedEntry && !isSkills ? (selectedEntry as ItemEntry).quantity : null;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isGridActive) return;
    const clampedPage = Math.min(Math.max(currentBoxPage, 1), pageCount);
    if (clampedPage !== currentBoxPage) {
      setCurrentBoxPage(clampedPage);
    }
  }, [isGridActive, currentBoxPage, pageCount, setCurrentBoxPage]);

  useEffect(() => {
    if (!isGridActive) {
      const prevContainer = containerRefMap.current.get(
        highlightedIndexRef.current,
      );
      const prevButton = buttonRefMap.current.get(highlightedIndexRef.current);
      if (prevContainer)
        prevContainer.classList.remove(...SELECTED_CELL_CONTAINER_CLASSES);
      if (prevButton)
        prevButton.classList.remove(...SELECTED_CELL_BUTTON_CLASSES);
      highlightedIndexRef.current = -1;
      return;
    }

    const pageEndIndex = startIndex + slotsPerPage;
    const nextHighlightedIndex =
      selectedBoxSlotIndex >= startIndex && selectedBoxSlotIndex < pageEndIndex
        ? selectedBoxSlotIndex
        : -1;
    const prevHighlightedIndex = highlightedIndexRef.current;
    if (prevHighlightedIndex === nextHighlightedIndex) return;

    const prevContainer = containerRefMap.current.get(prevHighlightedIndex);
    const prevButton = buttonRefMap.current.get(prevHighlightedIndex);
    if (prevContainer)
      prevContainer.classList.remove(...SELECTED_CELL_CONTAINER_CLASSES);
    if (prevButton) {
      prevButton.classList.remove(...SELECTED_CELL_BUTTON_CLASSES);
      prevButton.classList.add(BASE_CELL_BUTTON_BG_CLASS);
      if (prevButton.dataset.empty === "true") {
        prevButton.classList.add(EMPTY_CELL_OPACITY_CLASS);
      }
    }

    const nextContainer = containerRefMap.current.get(nextHighlightedIndex);
    const nextButton = buttonRefMap.current.get(nextHighlightedIndex);
    if (nextContainer)
      nextContainer.classList.add(...SELECTED_CELL_CONTAINER_CLASSES);
    if (nextButton) {
      nextButton.classList.remove(
        BASE_CELL_BUTTON_BG_CLASS,
        EMPTY_CELL_OPACITY_CLASS,
      );
      nextButton.classList.add(...SELECTED_CELL_BUTTON_CLASSES);
    }

    highlightedIndexRef.current = nextHighlightedIndex;
  }, [isGridActive, selectedBoxSlotIndex, startIndex, slotsPerPage]);

  if (!isGridActive) return null;

  return (
    <div
      className={`
        flex flex-col md:flex-row flex-1 min-h-0 w-full font-adventure gap-2 md:gap-3
        ${isMobile ? "justify-start" : ""}
      `}
    >
      {/* 詳細パネル: PC=左 / モバイル=上（モバイル時は高さ固定） */}
      <div
        className={`
          ${FRAME_CLASS} rounded p-1 min-h-0 overflow-hidden font-adventure shrink-0
          ${isMobile ? "w-full h-[36vh] min-h-0 overflow-auto" : "w-64 md:w-72 min-w-0 shrink-0 md:h-[40%]"}
        `}
      >
        <div className="flex h-full min-h-0 flex-col border-x-[3px] border-y-0 border-[#a47a34]/80 bg-[#0b101c] overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden">
            {isSkills ? (
              <SkillDetailPanel skill={selectedEntry as SkillEntry | null} />
            ) : (
              <ItemDetailPanel item={selectedEntry as ItemEntry | null} />
            )}
          </div>
        </div>
      </div>

      {/* グリッド部分（PC=flex-1 / モバイル=高さ固定の正方形） */}
      <div
        className={`
          ${FRAME_CLASS} rounded p-1 min-h-0 w-full max-w-2xl mx-auto font-adventure
          ${isMobile ? "shrink-0 h-[50vh] max-h-[50vh] flex flex-col" : "min-w-0 flex-1 flex flex-col"}
        `}
      >
        <div className="flex flex-col h-full min-h-0 border-x-[3px] border-y-0 border-[#a47a34]/80 bg-[#2e2b26] overflow-hidden">
          {/* 上段: ヘッダー（レトロゲームUI風） */}
          <div className="shrink-0 flex items-center justify-between px-2 py-1 border-b border-black/50 bg-[#6b672a]">
            <span className="text-[#ffea00] font-extrabold text-base md:text-xl tracking-widest truncate">
              {headerTitle}
            </span>
            {pageCount > 1 ? (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={currentBoxPage <= 1}
                  onClick={() =>
                    setCurrentBoxPage(Math.max(1, currentBoxPage - 1))
                  }
                  className="bg-[#e6e6e6] text-black font-extrabold border border-black shadow-[2px_2px_0_#222] px-1 py-0.5 leading-none text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#d4d4d4]"
                >
                  L
                </button>
                <span className="text-white text-sm md:text-base font-bold tabular-nums px-1">
                  {currentBoxPage} / {pageCount}
                </span>
                <button
                  type="button"
                  disabled={currentBoxPage >= pageCount}
                  onClick={() =>
                    setCurrentBoxPage(Math.min(pageCount, currentBoxPage + 1))
                  }
                  className="bg-[#e6e6e6] text-black font-extrabold border border-black shadow-[2px_2px_0_#222] px-1 py-0.5 leading-none text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#d4d4d4]"
                >
                  R
                </button>
              </div>
            ) : (
              <span className="text-white text-sm md:text-base font-bold tabular-nums">
                1 / 1
              </span>
            )}
          </div>

          {/* グリッド: コンテナクエリで「親の短い方」に完璧に追従する正方形を作る */}
          <div
            className="flex-1 min-h-0 min-w-0 flex items-center justify-center overflow-hidden p-1"
            style={{
              containerType: "size" as React.CSSProperties["containerType"],
            }}
          >
            <div
              className="grid bg-black"
              style={{
                ...gridTemplateStyle,
                width: "100cqmin",
                height: "100cqmin",
              }}
            >
              {gridCells}
            </div>
          </div>

          {/* 下段: フッター（選択中アイテム名・所持数） */}
          <div className="shrink-0 flex items-center justify-between px-2 py-1 border-t border-black/50 bg-[#532219] text-white text-sm md:text-base font-bold drop-shadow-md [text-shadow:1px_1px_0_rgb(0,0,0)]">
            <span className="truncate min-w-0">{footerName || "－"}</span>
            {footerQuantity != null ? (
              <span className="shrink-0 tabular-nums">x {footerQuantity}</span>
            ) : (
              <span className="shrink-0 opacity-60">－</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BoxOverlay() {
  const isOpen = useUIStore((s) => s.activeOverlay === "box");
  const boxView = useUIStore((s) => s.boxView);
  const closeBox = useUIStore((s) => s.closeBox);
  const setBoxView = useUIStore((s) => s.setBoxView);
  const setActiveBoxCategory = useUIStore((s) => s.setActiveBoxCategory);
  const setCurrentBoxPage = useUIStore((s) => s.setCurrentBoxPage);
  const setSelectedBoxSlotIndex = useUIStore(
    (s) => s.setSelectedBoxSlotIndex,
  );

  if (!isOpen) return null;

  const handleClose = () => {
    closeBox();
  };

  const handleMenuSelect = (id: BoxMenuEntry["id"]) => {
    setActiveBoxCategory(id);
    setCurrentBoxPage(1);
    setSelectedBoxSlotIndex(-1);
    setBoxView("grid");
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-auto">
      <div
        className={`
          w-[95vw] max-w-4xl h-[95dvh] max-h-screen overflow-hidden flex flex-col relative
        `}
      >
        {boxView === "menu" && (
          <div className="flex flex-col h-full font-adventure">
            <div className="p-4 border-b border-black/50">
              <h2 className="text-amber-100 font-bold text-lg">アイテムBOX</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <BoxMenuView onSelect={handleMenuSelect} onClose={handleClose} />
            </div>
          </div>
        )}

        {boxView === "grid" && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <button
              type="button"
              onClick={() => setBoxView("menu")}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-10 px-2 py-1 md:px-3 md:py-1.5 border border-black/60 bg-black/60 text-amber-100 text-xs md:text-sm font-bold hover:bg-amber-900/40 transition-colors shrink-0"
            >
              もどる
            </button>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-2 md:p-3">
              <BoxGridView />
            </div>
          </div>
        )}
      </div>

      {/* オーバーレイ外クリックで閉じる（menu時のみ） */}
      {boxView === "menu" && (
        <button
          type="button"
          aria-label="閉じる"
          className="absolute inset-0 -z-10"
          onClick={handleClose}
        />
      )}
    </div>
  );
}

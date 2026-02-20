"use client";

import React, { useCallback, memo, useEffect, useRef } from "react";
import { useInputStore } from "@/lib/world/store";
import { useDeviceType } from "@/hooks/useDeviceType";
import {
  BOX_MENU_ENTRIES,
  SKILL_ENTRIES,
  ITEM_ENTRIES,
  SLOTS_PER_PAGE,
  type BoxMenuEntry,
  type SkillEntry,
  type ItemEntry,
  type SkillRarity,
} from "@/lib/world/boxData";

const RARITY_LABEL: Record<SkillRarity, string> = {
  common: "コモン",
  rare: "レア",
  sr: "SR",
  ssr: "SSR",
};

const RARITY_COLOR: Record<SkillRarity, string> = {
  common: "text-gray-400",
  rare: "text-blue-400",
  sr: "text-purple-400",
  ssr: "text-amber-400",
};

/** モンハン風フレーム（角張った枠・暗い背景・琥珀のアクセント） */
const FRAME_CLASS =
  "bg-[#1a1510] border-2 border-amber-700/80 text-amber-100 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]";

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
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-2 p-4 md:p-6">
        {BOX_MENU_ENTRIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry.id)}
            className={`
              w-full text-left px-5 py-4 rounded-none
              ${FRAME_CLASS} font-bold text-lg
              hover:bg-amber-900/40 hover:border-amber-600 transition-colors
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
            w-full px-5 py-3 rounded-none border-2 border-amber-700/80
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

/** じゅくれんどゲージ（斬れ味ゲージのパロディ） */
function JukurenGauge({ level }: { level: number }) {
  const max = 5;
  const segments = Array.from({ length: max }, (_, i) => i < level);
  return (
    <div className="flex gap-0.5">
      {segments.map((filled, i) => (
        <div
          key={i}
          className={`h-4 flex-1 border border-amber-600 ${
            filled ? "bg-amber-500" : "bg-gray-800"
          }`}
        />
      ))}
    </div>
  );
}

/** スキル用詳細パネル */
function SkillDetailPanel({ skill }: { skill: SkillEntry | null }) {
  if (!skill) {
    return <div className="p-4 text-amber-200/60 text-sm">スロットを選択してください</div>;
  }
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 flex items-center justify-center border-2 border-amber-600 bg-black/50 text-xl ${RARITY_COLOR[skill.rarity]}`}
        >
          {skill.iconPath ? (
            <img src={skill.iconPath} alt="" className="w-8 h-8 object-contain" />
          ) : (
            <span className="font-bold">{skill.name.slice(0, 1)}</span>
          )}
        </div>
        <div>
          <p className="font-bold text-amber-100">{skill.name}</p>
          <p className={`text-xs ${RARITY_COLOR[skill.rarity]}`}>{RARITY_LABEL[skill.rarity]}</p>
        </div>
      </div>
      <div>
        <p className="text-xs text-amber-200/80 mb-1">じゅくれんど</p>
        <JukurenGauge level={skill.level} />
      </div>
      <p className="text-sm text-amber-100/90 leading-relaxed">{skill.description}</p>
    </div>
  );
}

/** アイテム用詳細パネル */
function ItemDetailPanel({ item }: { item: ItemEntry | null }) {
  if (!item) {
    return <div className="p-4 text-amber-200/60 text-sm">スロットを選択してください</div>;
  }
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center border-2 border-amber-600 bg-black/50 text-xl text-amber-200">
          {item.iconPath ? (
            <img src={item.iconPath} alt="" className="w-8 h-8 object-contain" />
          ) : (
            <span className="font-bold">{item.name.slice(0, 1)}</span>
          )}
        </div>
        <p className="font-bold text-amber-100">{item.name}</p>
      </div>
      <p className="text-sm text-amber-100/90 leading-relaxed">{item.description}</p>
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
  const displayName = entry ? (entry as ItemEntry).name ?? (entry as SkillEntry).name : "";
  const displayChar = displayName ? displayName.slice(0, 1) : "";
  const handleClick = useCallback(() => onSelectSlot(globalIndex), [onSelectSlot, globalIndex]);
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
          entry.iconPath ? (
            <img src={entry.iconPath} alt="" className="w-full h-full object-contain p-0.5" />
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
  const isMobile = useDeviceType();
  const boxView = useInputStore((s) => s.boxView);
  const activeBoxCategory = useInputStore((s) => s.activeBoxCategory);
  const currentBoxPage = useInputStore((s) => s.currentBoxPage);
  const selectedBoxSlotIndex = useInputStore((s) => s.selectedBoxSlotIndex);
  const setCurrentBoxPage = useInputStore((s) => s.setCurrentBoxPage);
  const setSelectedBoxSlotIndex = useInputStore((s) => s.setSelectedBoxSlotIndex);
  const containerRefMap = useRef<Map<number, HTMLDivElement>>(new Map());
  const buttonRefMap = useRef<Map<number, HTMLButtonElement>>(new Map());
  const highlightedIndexRef = useRef(-1);

  const handleSelectSlot = useCallback((index: number) => {
    if (index === useInputStore.getState().selectedBoxSlotIndex) return;
    setSelectedBoxSlotIndex(index);
  }, [setSelectedBoxSlotIndex]);

  const handleMountButton = useCallback((index: number, el: HTMLButtonElement | null) => {
    if (!el) {
      buttonRefMap.current.delete(index);
      return;
    }
    buttonRefMap.current.set(index, el);
  }, []);
  const handleMountContainer = useCallback((index: number, el: HTMLDivElement | null) => {
    if (!el) {
      containerRefMap.current.delete(index);
      return;
    }
    containerRefMap.current.set(index, el);
  }, []);

  const isGridActive = boxView === "grid" && activeBoxCategory !== null;
  const isSkills = activeBoxCategory === "skills";
  const entries = isSkills ? SKILL_ENTRIES : ITEM_ENTRIES;
  const slotsPerPage = isMobile ? MOBILE_SLOTS_PER_PAGE : SLOTS_PER_PAGE;
  const gridColsClass = isMobile ? "grid-cols-6" : "grid-cols-10";
  const pageCount = Math.max(1, Math.ceil(entries.length / slotsPerPage));
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
    ? (selectedEntry as ItemEntry).name ?? (selectedEntry as SkillEntry).name
    : "";
  const footerQuantity =
    selectedEntry && !isSkills
      ? (selectedEntry as ItemEntry).quantity
      : null;

  useEffect(() => {
    if (!isGridActive) return;
    const clampedPage = Math.min(Math.max(currentBoxPage, 1), pageCount);
    if (clampedPage !== currentBoxPage) {
      setCurrentBoxPage(clampedPage);
    }
  }, [isGridActive, currentBoxPage, pageCount, setCurrentBoxPage]);

  useEffect(() => {
    if (!isGridActive) {
      const prevContainer = containerRefMap.current.get(highlightedIndexRef.current);
      const prevButton = buttonRefMap.current.get(highlightedIndexRef.current);
      if (prevContainer) prevContainer.classList.remove(...SELECTED_CELL_CONTAINER_CLASSES);
      if (prevButton) prevButton.classList.remove(...SELECTED_CELL_BUTTON_CLASSES);
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
    if (prevContainer) prevContainer.classList.remove(...SELECTED_CELL_CONTAINER_CLASSES);
    if (prevButton) {
      prevButton.classList.remove(...SELECTED_CELL_BUTTON_CLASSES);
      prevButton.classList.add(BASE_CELL_BUTTON_BG_CLASS);
      if (prevButton.dataset.empty === "true") {
        prevButton.classList.add(EMPTY_CELL_OPACITY_CLASS);
      }
    }

    const nextContainer = containerRefMap.current.get(nextHighlightedIndex);
    const nextButton = buttonRefMap.current.get(nextHighlightedIndex);
    if (nextContainer) nextContainer.classList.add(...SELECTED_CELL_CONTAINER_CLASSES);
    if (nextButton) {
      nextButton.classList.remove(BASE_CELL_BUTTON_BG_CLASS, EMPTY_CELL_OPACITY_CLASS);
      nextButton.classList.add(...SELECTED_CELL_BUTTON_CLASSES);
    }

    highlightedIndexRef.current = nextHighlightedIndex;
  }, [isGridActive, selectedBoxSlotIndex, startIndex, slotsPerPage]);

  if (!isGridActive) return null;

  return (
    <div
      className={`
        flex flex-col md:flex-row h-full w-full font-adventure
        ${isMobile ? "gap-2" : "gap-4"}
      `}
    >
      {/* 詳細パネル: PC=左 / モバイル=上 */}
      <div
        className={`
          ${FRAME_CLASS} rounded min-h-0 shrink-0 font-adventure
          ${isMobile ? "w-full max-h-[40%]" : "w-64 shrink-0"}
        `}
      >
        {isSkills ? (
          <SkillDetailPanel skill={selectedEntry as SkillEntry | null} />
        ) : (
          <ItemDetailPanel item={selectedEntry as ItemEntry | null} />
        )}
      </div>

      {/* グリッド部分のみモンハン装備BOX風（外枠・ヘッダー・グリッド・フッター） */}
      <div
        className={`
          flex flex-col flex-1 min-h-0 w-full max-w-2xl mx-auto
          border-[3px] border-black bg-[#2e2b26] font-adventure
          ${isMobile ? "aspect-square max-h-[50vh] place-self-center" : ""}
        `}
      >
        {/* 上段: ヘッダー（レトロゲームUI風） */}
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-black/50 bg-[#6b672a]">
          <span className="text-[#ffea00] font-extrabold text-xl md:text-2xl tracking-widest">
            {headerTitle}
          </span>
          {pageCount > 1 ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentBoxPage <= 1}
                onClick={() => setCurrentBoxPage(Math.max(1, currentBoxPage - 1))}
                className="bg-[#e6e6e6] text-black font-extrabold border border-black shadow-[2px_2px_0_#222] px-1.5 py-0.5 leading-none disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#d4d4d4]"
              >
                L
              </button>
              <span className="text-white text-xl font-bold tabular-nums px-1">
                {currentBoxPage} / {pageCount}
              </span>
              <button
                type="button"
                disabled={currentBoxPage >= pageCount}
                onClick={() => setCurrentBoxPage(Math.min(pageCount, currentBoxPage + 1))}
                className="bg-[#e6e6e6] text-black font-extrabold border border-black shadow-[2px_2px_0_#222] px-1.5 py-0.5 leading-none disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#d4d4d4]"
              >
                R
              </button>
            </div>
          ) : (
            <span className="text-white text-xl font-bold tabular-nums">1 / 1</span>
          )}
        </div>

        {/* PC:10×10 / Mobile:6×6 グリッド */}
        <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center overflow-hidden bg-black">
          <div className={`grid ${gridColsClass} gap-2 bg-black p-2 aspect-square h-full max-w-full min-h-0 min-w-0`}>
            {gridCells}
          </div>
        </div>

        {/* 下段: フッター（選択中アイテム名・所持数） */}
        <div className="shrink-0 flex items-center justify-between px-2 py-1.5 border-t border-black/50 bg-[#2e2b26] text-white text-lg md:text-xl font-bold drop-shadow-md [text-shadow:1px_1px_0_rgb(0,0,0)]">
          <span className="truncate">{footerName || "－"}</span>
          {footerQuantity != null ? (
            <span className="shrink-0 tabular-nums">x {footerQuantity}</span>
          ) : (
            <span className="shrink-0 opacity-60">－</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BoxUI() {
  const boxView = useInputStore((s) => s.boxView);
  const setBoxView = useInputStore((s) => s.setBoxView);
  const setActiveBoxCategory = useInputStore((s) => s.setActiveBoxCategory);
  const setCurrentBoxPage = useInputStore((s) => s.setCurrentBoxPage);
  const setSelectedBoxSlotIndex = useInputStore((s) => s.setSelectedBoxSlotIndex);

  if (boxView === "closed") return null;

  const handleClose = () => {
    setBoxView("closed");
  };

  const handleMenuSelect = (id: BoxMenuEntry["id"]) => {
    setActiveBoxCategory(id);
    setCurrentBoxPage(1);
    setSelectedBoxSlotIndex(-1);
    setBoxView("grid");
  };

  return (
    <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-black/70 pointer-events-auto">
      <div
        className={`
          w-[95vw] max-w-4xl h-[85vh] max-h-[800px]
          ${FRAME_CLASS} rounded-lg overflow-hidden relative
        `}
      >
        {boxView === "menu" && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-amber-700/50">
              <h2 className="text-amber-100 font-bold text-lg">アイテムBOX</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <BoxMenuView onSelect={handleMenuSelect} onClose={handleClose} />
            </div>
          </div>
        )}

        {boxView === "grid" && (
          <>
            <button
              type="button"
              onClick={() => setBoxView("menu")}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-10 px-3 py-1.5 border-2 border-amber-700 bg-black/60 text-amber-100 text-sm font-bold hover:bg-amber-900/40 transition-colors"
            >
              もどる
            </button>
            <div className="h-full p-4 md:p-6 overflow-auto">
              <BoxGridView />
            </div>
          </>
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

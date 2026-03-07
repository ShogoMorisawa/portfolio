import { create } from "zustand";
import type { AdventureSlotId } from "@/features/book/bookData";

export type OverlayKind =
  | "none"
  | "dialogue"
  | "book"
  | "box"
  | "post"
  | "computer";

export type NearbyTarget =
  | "book"
  | "box"
  | "post"
  | "computer"
  | "crystal"
  | null;

export type InteractionTarget = Exclude<NearbyTarget, null>;
export type IntroSequence = "approach" | "message" | "release" | "done";

type NearbyStateKey = Exclude<NearbyTarget, null>;
type NearbyStateMap = Record<NearbyStateKey, boolean>;

export type BoxView = "menu" | "grid";
export type BoxCategory = "skills" | "items" | null;

type UIState = {
  joystick: { x: number; y: number; isMoving: boolean };
  activeOverlay: OverlayKind;
  nearbyTarget: NearbyTarget;
  nearbyStates: NearbyStateMap;
  activeCrystalId: string | null;
  activeMessage: string | null;
  targetPosition: [number, number, number] | null;
  introSequence: IntroSequence;
  introMessage: string | null;
  introFocusPosition: [number, number, number] | null;
  selectedAdventureSlot: AdventureSlotId | null;
  boxView: BoxView;
  activeBoxCategory: BoxCategory;
  currentBoxPage: number;
  selectedBoxSlotIndex: number;
  tabletScreenImageIndex: number;
  setJoystick: (x: number, y: number, isMoving: boolean) => void;
  setNearbyState: (target: NearbyStateKey, isNearby: boolean) => void;
  setActiveCrystal: (payload: { id: string; message: string } | null) => void;
  setTargetPosition: (pos: [number, number, number] | null) => void;
  setIntroSequence: (sequence: IntroSequence) => void;
  setIntroMessage: (message: string | null) => void;
  setIntroFocusPosition: (pos: [number, number, number] | null) => void;
  finishIntro: () => void;
  startDialogue: () => void;
  closeDialogue: () => void;
  openBook: () => void;
  closeBook: () => void;
  setSelectedAdventureSlot: (slot: AdventureSlotId | null) => void;
  openBox: () => void;
  closeBox: () => void;
  setBoxView: (view: BoxView) => void;
  setActiveBoxCategory: (category: BoxCategory) => void;
  setCurrentBoxPage: (page: number) => void;
  setSelectedBoxSlotIndex: (index: number) => void;
  openPost: () => void;
  closePost: () => void;
  openComputer: () => void;
  closeComputer: () => void;
  setTabletScreenImageIndex: (
    index: number | ((prevIndex: number) => number),
  ) => void;
  closeActiveOverlay: () => void;
};

const EMPTY_NEARBY_STATES: NearbyStateMap = {
  book: false,
  box: false,
  post: false,
  computer: false,
  crystal: false,
};

const getResetBoxState = () => ({
  boxView: "menu" as const,
  activeBoxCategory: null,
  currentBoxPage: 1,
  selectedBoxSlotIndex: -1,
});

const getClearedNearbyState = () => ({
  nearbyStates: { ...EMPTY_NEARBY_STATES },
  nearbyTarget: null as NearbyTarget,
});

function resolveNearbyTarget(states: NearbyStateMap): NearbyTarget {
  if (states.crystal) return "crystal";
  if (states.book) return "book";
  if (states.box) return "box";
  if (states.post) return "post";
  if (states.computer) return "computer";
  return null;
}

export function selectIsIntroBlockingInteraction(state: UIState): boolean {
  return state.introSequence === "approach" || state.introSequence === "message";
}

export function selectInteractionTarget(state: UIState): InteractionTarget | null {
  if (state.activeOverlay !== "none") return null;
  if (selectIsIntroBlockingInteraction(state)) return null;
  if (state.activeCrystalId && state.activeMessage) return "crystal";
  return state.nearbyTarget;
}

export const useUIStore = create<UIState>((set, get) => ({
  joystick: { x: 0, y: 0, isMoving: false },
  activeOverlay: "none",
  nearbyTarget: null,
  nearbyStates: { ...EMPTY_NEARBY_STATES },
  activeCrystalId: null,
  activeMessage: null,
  targetPosition: null,
  introSequence: "approach",
  introMessage: "Welcome!",
  introFocusPosition: null,
  selectedAdventureSlot: null,
  ...getResetBoxState(),
  tabletScreenImageIndex: 0,

  setJoystick: (x, y, isMoving) => set({ joystick: { x, y, isMoving } }),

  setNearbyState: (target, isNearby) =>
    set((state) => {
      if (state.nearbyStates[target] === isNearby) return state;

      const nearbyStates = { ...state.nearbyStates, [target]: isNearby };
      return {
        nearbyStates,
        nearbyTarget:
          state.activeOverlay === "none" ? resolveNearbyTarget(nearbyStates) : null,
      };
    }),

  setActiveCrystal: (payload) =>
    set((state) => {
      if (!payload) {
        const nearbyStates = { ...state.nearbyStates, crystal: false };
        return {
          activeCrystalId: null,
          activeMessage: null,
          nearbyStates,
          nearbyTarget:
            state.activeOverlay === "none"
              ? resolveNearbyTarget(nearbyStates)
              : null,
        };
      }

      const nearbyStates = { ...state.nearbyStates, crystal: true };
      return {
        activeCrystalId: payload.id,
        activeMessage: payload.message,
        nearbyStates,
        nearbyTarget:
          state.activeOverlay === "none" ? resolveNearbyTarget(nearbyStates) : null,
      };
    }),

  setTargetPosition: (pos) => set({ targetPosition: pos }),

  setIntroSequence: (sequence) => set({ introSequence: sequence }),

  setIntroMessage: (message) => set({ introMessage: message }),

  setIntroFocusPosition: (pos) => set({ introFocusPosition: pos }),

  finishIntro: () =>
    set({
      introSequence: "done",
      introMessage: null,
      introFocusPosition: null,
    }),

  startDialogue: () =>
    set((state) => {
      if (!state.activeCrystalId || !state.activeMessage) return state;

      return {
        activeOverlay: "dialogue",
        ...getClearedNearbyState(),
      };
    }),

  closeDialogue: () =>
    set({
      activeOverlay: "none",
      targetPosition: null,
    }),

  openBook: () =>
    set({
      activeOverlay: "book",
      ...getClearedNearbyState(),
    }),

  closeBook: () =>
    set({
      activeOverlay: "none",
      selectedAdventureSlot: null,
    }),

  setSelectedAdventureSlot: (slot) => set({ selectedAdventureSlot: slot }),

  openBox: () =>
    set({
      activeOverlay: "box",
      ...getClearedNearbyState(),
      ...getResetBoxState(),
    }),

  closeBox: () =>
    set({
      activeOverlay: "none",
      ...getResetBoxState(),
    }),

  setBoxView: (view) =>
    set(
      view === "menu"
        ? {
            boxView: "menu",
            activeBoxCategory: null,
            currentBoxPage: 1,
            selectedBoxSlotIndex: -1,
          }
        : { boxView: "grid" },
    ),

  setActiveBoxCategory: (category) => set({ activeBoxCategory: category }),
  setCurrentBoxPage: (page) => set({ currentBoxPage: page }),
  setSelectedBoxSlotIndex: (index) => set({ selectedBoxSlotIndex: index }),

  openPost: () =>
    set({
      activeOverlay: "post",
      ...getClearedNearbyState(),
    }),

  closePost: () => set({ activeOverlay: "none" }),

  openComputer: () =>
    set({
      activeOverlay: "computer",
      ...getClearedNearbyState(),
    }),

  closeComputer: () =>
    set({
      activeOverlay: "none",
      tabletScreenImageIndex: 0,
    }),

  setTabletScreenImageIndex: (index) =>
    set((state) => ({
      tabletScreenImageIndex:
        typeof index === "function"
          ? index(state.tabletScreenImageIndex)
          : index,
    })),

  closeActiveOverlay: () => {
    const { activeOverlay } = get();

    if (activeOverlay === "dialogue") {
      get().closeDialogue();
      return;
    }

    if (activeOverlay === "book") {
      get().closeBook();
      return;
    }

    if (activeOverlay === "box") {
      get().closeBox();
      return;
    }

    if (activeOverlay === "post") {
      get().closePost();
      return;
    }

    if (activeOverlay === "computer") {
      get().closeComputer();
    }
  },
}));

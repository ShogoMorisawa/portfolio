import { create } from "zustand";

export type AdventureSlotId = 1 | 2 | 3;

interface InputState {
  joystick: { x: number; y: number; isMoving: boolean };
  setJoystick: (x: number, y: number, isMoving: boolean) => void;
}

interface DialogueState {
  activeCrystalId: string | null;
  activeMessage: string | null;
  isTalking: boolean;
  targetPosition: [number, number, number] | null;
  setActiveCrystalId: (id: string | null) => void;
  setActiveMessage: (message: string | null) => void;
  setIsTalking: (isTalking: boolean) => void;
  setTargetPosition: (pos: [number, number, number] | null) => void;
}

interface AdventureBookState {
  isBookNearby: boolean;
  isAdventureBookOpen: boolean;
  selectedAdventureSlot: AdventureSlotId | null;
  setIsBookNearby: (nearby: boolean) => void;
  setIsAdventureBookOpen: (open: boolean) => void;
  setSelectedAdventureSlot: (slot: AdventureSlotId | null) => void;
}

export type BoxView = "closed" | "menu" | "grid";
export type BoxCategory = "skills" | "items" | null;

interface BoxState {
  isBoxNearby: boolean;
  boxView: BoxView;
  activeBoxCategory: BoxCategory;
  currentBoxPage: number;
  selectedBoxSlotIndex: number;
  setIsBoxNearby: (nearby: boolean) => void;
  setBoxView: (view: BoxView) => void;
  setActiveBoxCategory: (category: BoxCategory) => void;
  setCurrentBoxPage: (page: number) => void;
  setSelectedBoxSlotIndex: (index: number) => void;
}

type WorldState = InputState & DialogueState & AdventureBookState & BoxState;

export const useInputStore = create<WorldState>((set) => ({
  joystick: { x: 0, y: 0, isMoving: false },
  setJoystick: (x, y, isMoving) => set({ joystick: { x, y, isMoving } }),

  activeCrystalId: null,
  activeMessage: null,
  isTalking: false,
  targetPosition: null,
  setActiveCrystalId: (id) => set({ activeCrystalId: id }),
  setActiveMessage: (message) => set({ activeMessage: message }),
  setIsTalking: (isTalking) => set({ isTalking }),
  setTargetPosition: (pos) => set({ targetPosition: pos }),

  isBookNearby: false,
  isAdventureBookOpen: false,
  selectedAdventureSlot: null,
  setIsBookNearby: (nearby) => set({ isBookNearby: nearby }),
  setIsAdventureBookOpen: (open) =>
    set({ isAdventureBookOpen: open, ...(open ? {} : { selectedAdventureSlot: null }) }),
  setSelectedAdventureSlot: (slot) => set({ selectedAdventureSlot: slot }),

  isBoxNearby: false,
  boxView: "closed",
  activeBoxCategory: null,
  currentBoxPage: 1,
  selectedBoxSlotIndex: -1,
  setIsBoxNearby: (nearby) => set({ isBoxNearby: nearby }),
  setBoxView: (view) =>
    set({
      boxView: view,
      ...(view !== "grid"
        ? { activeBoxCategory: null, currentBoxPage: 1, selectedBoxSlotIndex: -1 }
        : {}),
    }),
  setActiveBoxCategory: (category) => set({ activeBoxCategory: category }),
  setCurrentBoxPage: (page) => set({ currentBoxPage: page }),
  setSelectedBoxSlotIndex: (index) => set({ selectedBoxSlotIndex: index }),
}));
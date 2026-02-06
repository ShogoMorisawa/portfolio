import { create } from "zustand";

interface InputState {
  joystick: { x: number; y: number; isMoving: boolean };
  setJoystick: (x: number, y: number, isMoving: boolean) => void;
}

interface DialogueState {
  activeCrystalId: string | null;
  isTalking: boolean;
  setActiveCrystalId: (id: string | null) => void;
  setIsTalking: (isTalking: boolean) => void;
}

type WorldState = InputState & DialogueState;

export const useInputStore = create<WorldState>((set) => ({
  joystick: { x: 0, y: 0, isMoving: false },
  setJoystick: (x, y, isMoving) => set({ joystick: { x, y, isMoving } }),

  activeCrystalId: null,
  isTalking: false,
  setActiveCrystalId: (id) => set({ activeCrystalId: id }),
  setIsTalking: (isTalking) => set({ isTalking }),
}));
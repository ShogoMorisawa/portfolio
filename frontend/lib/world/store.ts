import { create } from "zustand";

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

type WorldState = InputState & DialogueState;

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
}));
import { create } from 'zustand';

interface InputState {
  joystick: { x: number; y: number; isMoving: boolean };
  setJoystick: (x: number, y: number, isMoving: boolean) => void;
}

export const useInputStore = create<InputState>((set) => ({
  joystick: { x: 0, y: 0, isMoving: false },
  setJoystick: (x, y, isMoving) => set({ joystick: { x, y, isMoving } }),
}));
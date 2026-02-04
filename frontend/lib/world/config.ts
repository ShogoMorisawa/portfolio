export const STAGE = {
  DOME_POSITION_Y: -7,
  DOME_SCALE: 20,
};

export const CAMERA = {
  pc: {
    fov: 50,
    distance: 8,
    height: 5,
    position: [0, 5, 12] as [number, number, number],
  },
  mobile: {
    fov: 55,
    distance: 6,
    height: 4,
    position: [0, 4, 10] as [number, number, number],
  },
};

export const PLAYER = {
  MOVE_SPEED: 5.0,
  ROTATION_SPEED: 3.0,
  CAMERA_DISTANCE: 8,
  CAMERA_HEIGHT: 5,
  RAYCAST_OFFSET: 5,
  GRAVITY: 0.2,
  FALL_THRESHOLD: -10,
  GROUND_OFFSET: 0,
  INITIAL_Y: 10,
};

export const STAGE = {
  DOME_POSITION_Y: -7,
  DOME_SCALE: 20,
};

export const CAMERA = {
  pc: {
    fov: 50,
    distance: 8,
    height: 5,
    lookAtOffsetY: 1.5, // 注視点をプレイヤーより上にずらす（空を多く写す）
    position: [0, 5, 12] as [number, number, number],
  },
  mobile: {
    fov: 55,
    distance: 6,
    height: 4,
    lookAtOffsetY: 1.5,
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
  INITIAL_X: 0,
  INITIAL_Y: 10,
  INITIAL_Z: -15, // Computer(-7) より柱から離した位置
  BOUNDARY_RADIUS: 26, // 移動可能な最大半径
};

export const CRYSTAL = {
  SPEED: 2.0,
  ROAM_RADIUS: 10,
  MIN_RADIUS: 20,
  MAX_RADIUS: 25,
};

/** ステージ上のオブジェクト配置 */
export const LAYOUT = {
  /** Book/Box の原点からの距離（X 方向） */
  SIDE_DISTANCE: 10,
  /** Post/Computer の原点からの距離（Z 方向） */
  FRONT_BACK_DISTANCE: 10,
  /** 浮遊オブジェクトの基準の高さ */
  FLOAT_OBJECT_HEIGHT: 3,
  BOOK_SCALE: 3,
  BOX_SCALE: 2,
  POST_SCALE: 2,
  COMPUTER_SCALE: 2,
} as const;

/** 浮遊オブジェクトのふわふわ・横傾き（オブジェクトごとに差をつけて同期しない） */
export const FLOATING = {
  book: {
    FLOAT_SPEED: 1,
    FLOAT_AMPLITUDE: 0.3,
    TILT_SPEED: 2.5,
    TILT_ANGLE: 0.08,
  },
  post: {
    FLOAT_SPEED: 1,
    FLOAT_AMPLITUDE: 0.3,
    TILT_SPEED: 2.5,
    TILT_ANGLE: 0.08,
  },
  computer: {
    FLOAT_SPEED: 1.2,
    FLOAT_AMPLITUDE: 0.28,
    TILT_SPEED: 2.2,
    TILT_ANGLE: 0.07,
  },
  box: {
    FLOAT_SPEED: 0.9,
    FLOAT_AMPLITUDE: 0.32,
    TILT_SPEED: 2.8,
    TILT_ANGLE: 0.09,
  },
} as const;

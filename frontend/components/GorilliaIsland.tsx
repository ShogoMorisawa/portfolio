"use client";

import * as THREE from "three";
import React, { useRef, useState, Component, ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  useKeyboardControls,
  Environment,
  useTexture,
} from "@react-three/drei";

// ============================================
// 型定義
// ============================================
interface PlayerControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

// ============================================
// 設定定数
// ============================================
const GAME_CONFIG = {
  // プレイヤー設定
  PLAYER: {
    MOVEMENT_SPEED: 0.15,
    ROTATION_SPEED: 0.15,
    INITIAL_POSITION: [0, 2, 0] as [number, number, number],
    MODEL_SCALE: [1, 1, 1] as [number, number, number],
    MODEL_PATH: "/cocolilia_v1.glb",
  },
  // 島・地形設定
  TERRAIN: {
    ISLAND_RADIUS: 15,
    ISLAND_HEIGHT: 2,
    ISLAND_SEGMENTS: 32,
    ISLAND_POSITION: [0, -1, 0] as [number, number, number],
    OCEAN_SIZE: 500,
    OCEAN_POSITION: [0, -2, 0] as [number, number, number],
    SAND_TEXTURE_PATH: "/texture/sand.jpg", // 砂テクスチャのパス
    SAND_TEXTURE_REPEAT: [8, 8] as [number, number], // テクスチャの繰り返し回数
  },
  // 物理・判定設定
  PHYSICS: {
    RAYCAST_OFFSET: 5, // 接地判定レイを飛ばす高さ
    GROUND_OBJECT_NAME: "ground",
    GRAVITY: 0.2, // 落下速度
    FALL_THRESHOLD: -5, // 落下判定の閾値
  },
  // カメラ設定
  CAMERA: {
    OFFSET: new THREE.Vector3(0, 8, 12),
    LERP_FACTOR: 0.1,
  },
  // ライティング設定
  LIGHTING: {
    AMBIENT_INTENSITY: 0.7,
    DIRECTIONAL_POSITION: [10, 20, 10] as [number, number, number],
    DIRECTIONAL_INTENSITY: 1.5,
    SHADOW_MAP_SIZE: [1024, 1024] as [number, number],
  },
  // 環境設定
  ENVIRONMENT: {
    FOG_COLOR: "#87CEEB",
    FOG_NEAR: 20,
    FOG_FAR: 50,
    ENVIRONMENT_PRESET: "city" as const,
  },
  // 装飾オブジェクト設定
  DECORATIONS: {
    TREE_1: {
      POSITION: [5, 0.5, -5] as [number, number, number],
      RADIUS: 1,
      HEIGHT: 4,
      SEGMENTS: 8,
      COLOR: "#27AE60",
    },
    TREE_2: {
      POSITION: [-4, 0.5, 3] as [number, number, number],
      RADIUS: 1.5,
      HEIGHT: 3,
      SEGMENTS: 8,
      COLOR: "#27AE60",
    },
  },
} as const;

// ============================================
// カスタムフック: プレイヤー移動ロジック
// ============================================
const usePlayerMovement = (playerRef: React.RefObject<THREE.Group | null>) => {
  const [, getKeys] = useKeyboardControls();
  const [currentRotation, setCurrentRotation] = useState(0);

  useFrame(() => {
    if (!playerRef.current) return;

    const keys = getKeys();
    const { forward, backward, left, right } =
      keys as unknown as PlayerControls;

    // 移動方向の計算
    let moveX = 0;
    let moveZ = 0;

    if (forward) moveZ -= 1;
    if (backward) moveZ += 1;
    if (left) moveX -= 1;
    if (right) moveX += 1;

    // 入力がある場合のみ移動処理
    if (moveX !== 0 || moveZ !== 0) {
      // 正規化（斜め移動が速くならないように）
      const direction = new THREE.Vector3(moveX, 0, moveZ).normalize();

      // 目標角度の計算
      const targetRotation = Math.atan2(direction.x, direction.z);

      // 滑らかに回転（簡易版）
      // 注意: 完全にスムーズにするにはQuaternion推奨
      const rotationDiff = targetRotation - currentRotation;
      let smoothRotation = currentRotation;

      // 180度またぎの処理（最短回転方向を選択）
      if (Math.abs(rotationDiff) > Math.PI) {
        const adjustedDiff =
          rotationDiff > 0
            ? rotationDiff - Math.PI * 2
            : rotationDiff + Math.PI * 2;
        smoothRotation += adjustedDiff * GAME_CONFIG.PLAYER.ROTATION_SPEED;
      } else {
        smoothRotation += rotationDiff * GAME_CONFIG.PLAYER.ROTATION_SPEED;
      }

      setCurrentRotation(smoothRotation);
      playerRef.current.rotation.y = smoothRotation;

      // 座標更新
      playerRef.current.position.x +=
        direction.x * GAME_CONFIG.PLAYER.MOVEMENT_SPEED;
      playerRef.current.position.z +=
        direction.z * GAME_CONFIG.PLAYER.MOVEMENT_SPEED;
    }
  });
};

// ============================================
// カスタムフック: 接地判定
// ============================================
const useGroundRaycast = (playerRef: React.RefObject<THREE.Group | null>) => {
  const { scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const downVector = useRef(new THREE.Vector3(0, -1, 0));

  useFrame(() => {
    if (!playerRef.current) return;

    // プレイヤーの少し上から真下にレイを飛ばす
    const rayOrigin = playerRef.current.position.clone();
    rayOrigin.y += GAME_CONFIG.PHYSICS.RAYCAST_OFFSET;

    raycaster.current.set(rayOrigin, downVector.current);

    // シーン内の "ground" という名前を持つオブジェクトと交差判定
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    const groundHit = intersects.find(
      (hit) => hit.object.name === GAME_CONFIG.PHYSICS.GROUND_OBJECT_NAME
    );

    if (groundHit) {
      // 地面の高さに合わせてY座標を更新
      playerRef.current.position.y = groundHit.point.y;
    } else {
      // ヒットしない場合（島から落ちた時など）のフォールバック
      if (playerRef.current.position.y > GAME_CONFIG.PHYSICS.FALL_THRESHOLD) {
        playerRef.current.position.y -= GAME_CONFIG.PHYSICS.GRAVITY;
      }
    }
  });
};

// ============================================
// カスタムフック: カメラ追従
// ============================================
const useCameraFollow = (playerRef: React.RefObject<THREE.Group | null>) => {
  const { camera } = useThree();

  useFrame(() => {
    if (!playerRef.current) return;

    // プレイヤーの後ろ・斜め上にカメラの目標位置を設定
    const targetCameraPos = playerRef.current.position
      .clone()
      .add(GAME_CONFIG.CAMERA.OFFSET);

    // 現在のカメラ位置から目標位置へ滑らかに移動 (Lerp)
    camera.position.lerp(targetCameraPos, GAME_CONFIG.CAMERA.LERP_FACTOR);

    // カメラは常にプレイヤーを見る
    camera.lookAt(playerRef.current.position);
  });
};

// ============================================
// プレイヤーコンポーネント
// ============================================
const Player = () => {
  const playerRef = useRef<THREE.Group>(null);

  // GLTFモデルの読み込み
  const { scene: modelScene } = useGLTF(GAME_CONFIG.PLAYER.MODEL_PATH);

  // アニメーション用にクローンを作成（複数のシーンで使い回す場合の安全策）
  const model = React.useMemo(() => modelScene.clone(), [modelScene]);

  // カスタムフックの使用
  usePlayerMovement(playerRef);
  useGroundRaycast(playerRef);
  useCameraFollow(playerRef);

  return (
    <group ref={playerRef} position={GAME_CONFIG.PLAYER.INITIAL_POSITION}>
      <primitive object={model} scale={GAME_CONFIG.PLAYER.MODEL_SCALE} />
    </group>
  );
};

// ============================================
// 島コンポーネント（テクスチャ付き）
// ============================================
const IslandWithTexture = () => {
  // 砂テクスチャの読み込み
  // コールバック関数でテクスチャの設定を適用
  const sandTexture = useTexture(
    GAME_CONFIG.TERRAIN.SAND_TEXTURE_PATH,
    (texture) => {
      // テクスチャの繰り返し設定（これがないと巨大な画像が1枚伸びて貼られる）
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(
        GAME_CONFIG.TERRAIN.SAND_TEXTURE_REPEAT[0],
        GAME_CONFIG.TERRAIN.SAND_TEXTURE_REPEAT[1]
      );
    }
  );

  return (
    <mesh
      position={GAME_CONFIG.TERRAIN.ISLAND_POSITION}
      receiveShadow
      name={GAME_CONFIG.PHYSICS.GROUND_OBJECT_NAME}
    >
      <cylinderGeometry
        args={[
          GAME_CONFIG.TERRAIN.ISLAND_RADIUS,
          GAME_CONFIG.TERRAIN.ISLAND_RADIUS,
          GAME_CONFIG.TERRAIN.ISLAND_HEIGHT,
          GAME_CONFIG.TERRAIN.ISLAND_SEGMENTS,
        ]}
      />
      <meshStandardMaterial color="#F4D03F" map={sandTexture} roughness={1} />
    </mesh>
  );
};

// ============================================
// 島コンポーネント（テクスチャなしのフォールバック）
// ============================================
const IslandFallback = () => {
  return (
    <mesh
      position={GAME_CONFIG.TERRAIN.ISLAND_POSITION}
      receiveShadow
      name={GAME_CONFIG.PHYSICS.GROUND_OBJECT_NAME}
    >
      <cylinderGeometry
        args={[
          GAME_CONFIG.TERRAIN.ISLAND_RADIUS,
          GAME_CONFIG.TERRAIN.ISLAND_RADIUS,
          GAME_CONFIG.TERRAIN.ISLAND_HEIGHT,
          GAME_CONFIG.TERRAIN.ISLAND_SEGMENTS,
        ]}
      />
      <meshStandardMaterial color="#F4D03F" roughness={0.8} />
    </mesh>
  );
};

// ============================================
// エラーバウンダリーコンポーネント
// ============================================
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

class TextureErrorBoundary extends Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("テクスチャの読み込みに失敗しました:", error);
    console.warn("フォールバック表示に切り替えます");
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// ============================================
// 島コンポーネント（エラーハンドリング付き）
// ============================================
const Island = () => {
  return (
    <TextureErrorBoundary fallback={<IslandFallback />}>
      <React.Suspense fallback={<IslandFallback />}>
        <IslandWithTexture />
      </React.Suspense>
    </TextureErrorBoundary>
  );
};

// ============================================
// 海コンポーネント
// ============================================
const Ocean = () => {
  return (
    <mesh
      position={GAME_CONFIG.TERRAIN.OCEAN_POSITION}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry
        args={[GAME_CONFIG.TERRAIN.OCEAN_SIZE, GAME_CONFIG.TERRAIN.OCEAN_SIZE]}
      />
      <meshStandardMaterial color="#48C9B0" transparent opacity={0.8} />
    </mesh>
  );
};

// ============================================
// 装飾オブジェクト（木）コンポーネント
// ============================================
const Tree = ({
  position,
  radius,
  height,
  segments,
  color,
}: {
  position: [number, number, number];
  radius: number;
  height: number;
  segments: number;
  color: string;
}) => {
  return (
    <mesh position={position} castShadow>
      <coneGeometry args={[radius, height, segments]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// ============================================
// ステージ（島と海）コンポーネント
// ============================================
const Level = () => {
  return (
    <group>
      <Island />
      <Ocean />
      <Tree
        position={GAME_CONFIG.DECORATIONS.TREE_1.POSITION}
        radius={GAME_CONFIG.DECORATIONS.TREE_1.RADIUS}
        height={GAME_CONFIG.DECORATIONS.TREE_1.HEIGHT}
        segments={GAME_CONFIG.DECORATIONS.TREE_1.SEGMENTS}
        color={GAME_CONFIG.DECORATIONS.TREE_1.COLOR}
      />
      <Tree
        position={GAME_CONFIG.DECORATIONS.TREE_2.POSITION}
        radius={GAME_CONFIG.DECORATIONS.TREE_2.RADIUS}
        height={GAME_CONFIG.DECORATIONS.TREE_2.HEIGHT}
        segments={GAME_CONFIG.DECORATIONS.TREE_2.SEGMENTS}
        color={GAME_CONFIG.DECORATIONS.TREE_2.COLOR}
      />
    </group>
  );
};

// ============================================
// ライティングコンポーネント
// ============================================
const Lighting = () => {
  return (
    <>
      <ambientLight intensity={GAME_CONFIG.LIGHTING.AMBIENT_INTENSITY} />
      <directionalLight
        position={GAME_CONFIG.LIGHTING.DIRECTIONAL_POSITION}
        intensity={GAME_CONFIG.LIGHTING.DIRECTIONAL_INTENSITY}
        castShadow
        shadow-mapSize={GAME_CONFIG.LIGHTING.SHADOW_MAP_SIZE}
      />
    </>
  );
};

// ============================================
// 環境設定コンポーネント
// ============================================
const EnvironmentSettings = () => {
  return (
    <>
      <Environment preset={GAME_CONFIG.ENVIRONMENT.ENVIRONMENT_PRESET} />
      <fog
        attach="fog"
        args={[
          GAME_CONFIG.ENVIRONMENT.FOG_COLOR,
          GAME_CONFIG.ENVIRONMENT.FOG_NEAR,
          GAME_CONFIG.ENVIRONMENT.FOG_FAR,
        ]}
      />
    </>
  );
};

// ============================================
// メインコンポーネント
// ============================================
const GorilliaIsland = () => {
  return (
    <>
      <Lighting />
      <EnvironmentSettings />
      <Level />
      <React.Suspense fallback={null}>
        <Player />
      </React.Suspense>
    </>
  );
};

export default GorilliaIsland;

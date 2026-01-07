"use client";

import * as THREE from "three";
import React, { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useKeyboardControls, Environment } from "@react-three/drei";

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
    MODEL_PATH: "/coco-v2.glb",
  },
  // 島・地形設定
  TERRAIN: {
    ISLAND_RADIUS: 15,
    ISLAND_HEIGHT: 2,
    ISLAND_SEGMENTS: 32,
    ISLAND_POSITION: [0, -1, 0] as [number, number, number],
    ISLAND_SURFACE_HEIGHT: 1.5, // 島の表面の目標Y座標（海の上に出す高さ）
    OCEAN_SIZE: 500,
    OCEAN_POSITION: [0, -2, 0] as [number, number, number],
    SAND_TEXTURE_PATH: "/texture/sand.jpg", // 砂テクスチャのパス
    SAND_TEXTURE_REPEAT: [8, 8] as [number, number], // テクスチャの繰り返し回数
  },
  // 物理・判定設定
  PHYSICS: {
    RAYCAST_OFFSET: 5, // 接地判定レイを飛ばす高さ
    GROUND_OBJECT_NAME: "ground", // 地面オブジェクトの名前（"ground"で始まる名前すべてに対応）
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
      // Three.jsでは、rotation.y = 0がZ軸正方向（前方）を向く
      // モデルの初期向きに合わせて調整
      const targetRotation = Math.atan2(direction.x, direction.z) - Math.PI / 2;

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

    // シーン内の "ground" で始まる名前を持つオブジェクトと交差判定
    // "ground", "ground.001", "ground.002" などに対応
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    const groundHit = intersects.find((hit) =>
      hit.object.name.startsWith(GAME_CONFIG.PHYSICS.GROUND_OBJECT_NAME)
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
interface PlayerProps {
  islandSurfaceY?: number;
}

const Player = ({ islandSurfaceY }: PlayerProps) => {
  const playerRef = useRef<THREE.Group>(null);

  // GLTFモデルの読み込み
  const { scene: modelScene } = useGLTF(GAME_CONFIG.PLAYER.MODEL_PATH);

  // アニメーション用にクローンを作成（複数のシーンで使い回す場合の安全策）
  const model = React.useMemo(() => modelScene.clone(), [modelScene]);

  // 島の表面の高さに基づいて初期位置を計算
  // 島の表面の上に適切なオフセット（2ユニット）を追加
  const initialPosition = React.useMemo(() => {
    const surfaceY = islandSurfaceY ?? 0;
    const playerOffset = 2; // プレイヤーを島の表面から2ユニット上に配置
    return [0, surfaceY + playerOffset, 0] as [number, number, number];
  }, [islandSurfaceY]);

  // 初期位置が設定されたらプレイヤーの位置を更新
  React.useEffect(() => {
    if (playerRef.current && islandSurfaceY !== undefined) {
      playerRef.current.position.set(...initialPosition);
    }
  }, [islandSurfaceY, initialPosition]);

  // カスタムフックの使用
  usePlayerMovement(playerRef);
  useGroundRaycast(playerRef);
  useCameraFollow(playerRef);

  return (
    <group ref={playerRef} position={initialPosition}>
      <primitive object={model} scale={GAME_CONFIG.PLAYER.MODEL_SCALE} />
    </group>
  );
};

// ============================================
// 新しい島コンポーネント (Blenderモデル読み込み版)
// ============================================
interface IslandModelProps {
  onSurfaceHeightCalculated?: (surfaceY: number) => void;
}

const IslandModel = ({ onSurfaceHeightCalculated }: IslandModelProps) => {
  // publicフォルダに置いたファイル名を指定
  const { scene } = useGLTF("/island.glb");
  const islandRef = useRef<THREE.Group>(null);

  // シーン内のオブジェクト設定とバウンディングボックス計算
  React.useLayoutEffect(() => {
    // バウンディングボックスを計算して島の位置を自動調整
    const box = new THREE.Box3().setFromObject(scene);
    const surfaceY = box.max.y; // 島の表面のY座標（モデル座標系）

    // 島の表面が設定された高さになるように位置を調整
    const targetSurfaceY = GAME_CONFIG.TERRAIN.ISLAND_SURFACE_HEIGHT;
    const offsetY = targetSurfaceY - surfaceY;

    // 島の位置を設定
    if (islandRef.current) {
      islandRef.current.position.y = offsetY;
    }

    // 調整後の表面の高さを親コンポーネントに通知
    // 調整後は表面がtargetSurfaceYになるので、その値を渡す
    if (onSurfaceHeightCalculated) {
      onSurfaceHeightCalculated(targetSurfaceY);
    }

    // シーン内のオブジェクト設定
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;

        // 【重要】Blenderで地面の名前を "ground" または "ground.001" などに設定していれば、
        // レイキャストは "ground" で始まる名前を検出します
        // デバッグ用: オブジェクト名を確認したい場合は以下のコメントを外してください
        // console.log("Mesh name:", obj.name);
      }
    });
  }, [scene, onSurfaceHeightCalculated]);

  return (
    <group ref={islandRef}>
      <primitive object={scene} />
    </group>
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
// ステージ（島と海）コンポーネント
// ============================================
interface LevelProps {
  onIslandSurfaceHeightCalculated?: (surfaceY: number) => void;
}

const Level = ({ onIslandSurfaceHeightCalculated }: LevelProps) => {
  return (
    <group>
      {/* 以前の <Island /> の代わりに新しいモデルを表示 */}
      <React.Suspense fallback={null}>
        <IslandModel
          onSurfaceHeightCalculated={onIslandSurfaceHeightCalculated}
        />
      </React.Suspense>
      {/* 海はそのまま */}
      <Ocean />
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
  // 島の表面の高さを状態として管理
  const [islandSurfaceY, setIslandSurfaceY] = useState<number | undefined>(
    undefined
  );

  // 島の表面の高さが計算されたら状態を更新
  const handleIslandSurfaceHeightCalculated = (surfaceY: number) => {
    setIslandSurfaceY(surfaceY);
  };

  return (
    <>
      <Lighting />
      <EnvironmentSettings />
      <Level
        onIslandSurfaceHeightCalculated={handleIslandSurfaceHeightCalculated}
      />
      <React.Suspense fallback={null}>
        <Player islandSurfaceY={islandSurfaceY} />
      </React.Suspense>
    </>
  );
};

export default GorilliaIsland;

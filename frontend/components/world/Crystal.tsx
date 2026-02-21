"use client";

import * as THREE from "three";
import React, { useRef, useState } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { GLTF } from "three-stdlib";
import { useInputStore } from "@/lib/world/store";
import { CRYSTAL } from "@/lib/world/config";

interface CrystalProps {
  id: string;
  position: [number, number, number];
  message: string;
  scale?: number | [number, number, number];
  sectorStart: number;
  sectorSize: number;
  playerRef: React.RefObject<THREE.Group | null>;
  isFrozen?: boolean;
}

type GLTFResult = GLTF & {
  nodes: {
    Body: THREE.Mesh;
    Left_Eye: THREE.Mesh;
  };
  materials: {
    Body: THREE.MeshStandardMaterial;
    Eye: THREE.MeshStandardMaterial;
  };
};

export function Model({
  id,
  position: initialPos,
  message,
  scale = 0.25,
  sectorStart,
  sectorSize,
  playerRef,
  isFrozen = false,
}: CrystalProps) {
  const group = useRef<THREE.Group>(null);
  const { nodes } = useGLTF(
    "/models/crystal-transformed.glb",
  ) as unknown as GLTFResult;
  const matcap = useTexture("/textures/crystal_texture.jpg");

  const setActiveCrystalId = useInputStore((state) => state.setActiveCrystalId);
  const setActiveMessage = useInputStore((state) => state.setActiveMessage);
  const setTargetPosition = useInputStore((state) => state.setTargetPosition);
  const activeCrystalId = useInputStore((state) => state.activeCrystalId);
  const isTalking = useInputStore((state) => state.isTalking);

  const SPEED = CRYSTAL.SPEED;
  const MIN_RADIUS = CRYSTAL.MIN_RADIUS;
  const MAX_RADIUS = CRYSTAL.MAX_RADIUS;
  const [target, setTarget] = useState(
    new THREE.Vector3(initialPos[0], initialPos[1], initialPos[2]),
  );

  const getNextPosition = (currentPos: THREE.Vector3) => {
    const nextPos = new THREE.Vector3();
    const angle = sectorStart + Math.random() * sectorSize;
    const r = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * Math.random();
    const dx = Math.cos(angle) * r;
    const dz = Math.sin(angle) * r;
    nextPos.set(dx, currentPos.y, dz);

    return nextPos;
  };

  // タブを離れて戻ったとき: delta が大きい＝一時停止していたので、ワープせず「今の位置から新しい目的地だけ決める」
  const PAUSE_THRESHOLD = 0.5;
  const MAX_DELTA = 0.1; // 1フレームで進める最大時間（ワープ防止）
  const ARRIVAL_RADIUS = 0.5; // この距離以内なら「到着」とみなして次の目的地を決める
  const MIN_DIRECTION_LENGTH = 1e-6; // これ以下ならゼロベクトルとみなし normalize をスキップ（NaN防止）

  useFrame((state, delta) => {
    if (!group.current) return;
    if (isFrozen) return;
    const currentPos = group.current.position;

    // ココちゃん(Player)との距離を優先（playerRefが空の時はカメラでフォールバック）
    let distToPlayer = currentPos.distanceTo(state.camera.position);
    if (playerRef.current) {
      distToPlayer = currentPos.distanceTo(playerRef.current.position);
    }

    // ヒステリシス: 担当中は10mまで維持、新規は8m以内で反応
    const threshold = activeCrystalId === id ? 7 : 5;
    const isNearby = distToPlayer < threshold;

    // 「席が空いてる(null)」かつ「自分が近い」時だけ座る（早い者勝ち）
    if (isNearby && activeCrystalId === null && !isTalking) {
      setActiveCrystalId(id);
      setActiveMessage(message);
    }
    // 自分が担当だったけど、遠くに行っちゃったら席を空ける
    else if (!isNearby && activeCrystalId === id && !isTalking) {
      setActiveCrystalId(null);
      setActiveMessage(null);
    }

    // 自分がアクティブなら、カメラのターゲット座標を更新し続ける
    if (activeCrystalId === id) {
      setTargetPosition([currentPos.x, currentPos.y, currentPos.z]);
    }

    // 「自分が担当の時」または「今まさに担当になろうとしている時」だけ止まる
    const isMyTurn =
      activeCrystalId === id || (activeCrystalId === null && isNearby);

    if (isMyTurn) {
      // 🟢 STOPモード（担当なので止まって対応）
      // 毎フレーム lookAt を実行 → 動くココちゃんを目で追い続ける（ひまわり効果）
      const lookAtTarget = playerRef?.current
        ? playerRef.current.position
        : state.camera.position;
      // clone() しないと本物の座標を書き換えてバグる（参照渡しの罠）
      const lookTarget = lookAtTarget.clone();
      lookTarget.y = currentPos.y; // 目線の高さを自分に合わせる（Y軸は固定）
      group.current.lookAt(lookTarget);
    } else {
      // 🔵 MOVEモード（担当じゃないので、近くても無視して歩く）
      const distToTarget = new THREE.Vector2(
        currentPos.x,
        currentPos.z,
      ).distanceTo(new THREE.Vector2(target.x, target.z));

      // タブ復帰などで delta が大きい＝一時停止していた → ワープせず今の位置から新しい目的地だけ決める
      const wasPaused = delta > PAUSE_THRESHOLD;
      const nextTarget = wasPaused ? getNextPosition(currentPos) : null;
      if (nextTarget) setTarget(nextTarget);

      const dt = wasPaused ? 0 : Math.min(delta, MAX_DELTA);

      if (!wasPaused && distToTarget < ARRIVAL_RADIUS) {
        setTarget(getNextPosition(currentPos));
      } else if (dt > 0) {
        const dest = nextTarget ?? target;
        const direction = new THREE.Vector3().subVectors(
          dest,
          currentPos,
        );
        const len = direction.length();
        if (len > MIN_DIRECTION_LENGTH) {
          direction.normalize();
          currentPos.x += direction.x * SPEED * dt;
          currentPos.z += direction.z * SPEED * dt;
        }
      }

      const lookTarget = (nextTarget ?? target).clone();
      lookTarget.y = currentPos.y;
      group.current.lookAt(lookTarget);
    }

    currentPos.y =
      initialPos[1] + Math.sin(state.clock.elapsedTime * 2) * 0.5;
  });

  // モデルの「正面」が Three.js の -Z とずれているため、90度補正
  // （lookAt は -Z をターゲットに向けるが、crystal-transformed.glb の顔は別方向を向いている）
  const FRONT_OFFSET_Y = -Math.PI / 2;

  return (
    <group ref={group} position={initialPos} dispose={null} scale={scale}>
      {/* モデルの正面補正: crystal-transformed.glb の顔が -Z と90度ずれている */}
      <group rotation={[0, FRONT_OFFSET_Y, 0]}>
        <mesh geometry={nodes.Body.geometry}>
          <meshMatcapMaterial matcap={matcap} color={"#ffffff"} />
        </mesh>

        <mesh
          geometry={nodes.Left_Eye.geometry}
          position={[1.706, 0.656, -0.536]}
          rotation={[-Math.PI / 2, -0.351, 1.968]}
        >
          <meshBasicMaterial color="lemonchiffon" />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload("/models/crystal-transformed.glb");

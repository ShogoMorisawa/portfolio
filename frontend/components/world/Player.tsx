"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { useInputStore } from "@/lib/world/store";
import { PLAYER, CAMERA } from "@/lib/world/config";

interface PlayerProps {
  groundRef: React.RefObject<THREE.Object3D | null>;
  isMobile: boolean;
}

const Player = ({ groundRef, isMobile }: PlayerProps) => {
  const group = useRef<THREE.Group>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const downVector = useRef(new THREE.Vector3(0, -1, 0));
  const { scene, animations } = useGLTF("models/coco.glb");
  const { actions, names } = useAnimations(animations, group);

  const playerHeightOffset = React.useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    return -box.min.y;
  }, [scene]);

  const joystick = useInputStore((state) => state.joystick);

  // isMobile に応じて使う設定を切り替える
  const cameraSettings = isMobile ? CAMERA.mobile : CAMERA.pc;

  const [keys, setKeys] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          setKeys((k) => ({ ...k, up: true }));
          break;
        case "ArrowDown":
          setKeys((k) => ({ ...k, down: true }));
          break;
        case "ArrowLeft":
          setKeys((k) => ({ ...k, left: true }));
          break;
        case "ArrowRight":
          setKeys((k) => ({ ...k, right: true }));
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          setKeys((k) => ({ ...k, up: false }));
          break;
        case "ArrowDown":
          setKeys((k) => ({ ...k, down: false }));
          break;
        case "ArrowLeft":
          setKeys((k) => ({ ...k, left: false }));
          break;
        case "ArrowRight":
          setKeys((k) => ({ ...k, right: false }));
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    const player = group.current;

    // --- 入力の統合 ---
    // キーボード入力とジョイスティック入力を合算する
    let moveForward = 0; // 前後: 1(前) ~ -1(後)
    let rotateY = 0; // 旋回: 1(左) ~ -1(右)

    // キーボード入力の反映
    if (keys.up) moveForward += 1;
    if (keys.down) moveForward -= 1;
    if (keys.left) rotateY += 1;
    if (keys.right) rotateY -= 1;

    // ジョイスティック入力の反映（yが前後、xが旋回に対応）
    if (joystick.isMoving) {
      moveForward += joystick.y;
      rotateY -= joystick.x;
    }

    // --- アニメーション制御 ---
    if (names.length > 0) {
      const action = actions[names[0]];
      if (action) {
        if (Math.abs(moveForward) > 0.1) {
          action.setEffectiveTimeScale(moveForward > 0 ? 1 : -1);
          action.play();
        } else {
          action.stop();
        }
      }
    }

    // --- 移動と回転の適用 ---
    player.rotation.y += rotateY * PLAYER.ROTATION_SPEED * delta;

    const moveX =
      Math.sin(player.rotation.y) * PLAYER.MOVE_SPEED * moveForward * delta;
    const moveZ =
      Math.cos(player.rotation.y) * PLAYER.MOVE_SPEED * moveForward * delta;

    player.position.x += moveX;
    player.position.z += moveZ;

    // XZ平面での原点からの距離を計算
    const distanceFromCenter = Math.sqrt(
      player.position.x * player.position.x +
        player.position.z * player.position.z,
    );

    // 半径を超えていたら、境界線上に押し戻す
    if (distanceFromCenter > PLAYER.BOUNDARY_RADIUS) {
      const ratio = PLAYER.BOUNDARY_RADIUS / distanceFromCenter;
      player.position.x *= ratio;
      player.position.z *= ratio;
    }

    if (groundRef.current) {
      const rayOrigin = player.position.clone();
      rayOrigin.y += PLAYER.RAYCAST_OFFSET;
      raycaster.current.set(rayOrigin, downVector.current);

      const intersects = raycaster.current.intersectObjects(
        [groundRef.current],
        true,
      );

      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        player.position.y =
          hitPoint.y + playerHeightOffset + PLAYER.GROUND_OFFSET;
      } else {
        if (player.position.y > PLAYER.FALL_THRESHOLD) {
          player.position.y -= PLAYER.GRAVITY;
        }
      }
    }

    const targetPosition = player.position.clone();

    const cameraOffsetX =
      Math.sin(player.rotation.y) * cameraSettings.distance;
    const cameraOffsetZ =
      Math.cos(player.rotation.y) * cameraSettings.distance;

    const desiredCameraPos = new THREE.Vector3(
      targetPosition.x - cameraOffsetX,
      targetPosition.y + cameraSettings.height,
      targetPosition.z - cameraOffsetZ,
    );

    state.camera.position.lerp(desiredCameraPos, 0.1);
    // lookAtOffsetY で注視点を上にずらし、プレイヤーを下に、空を多く写す
    const lookAtTarget = targetPosition.clone();
    lookAtTarget.y += cameraSettings.lookAtOffsetY;
    state.camera.lookAt(lookAtTarget);
  });

  return (
    <primitive ref={group} object={scene} position={[0, PLAYER.INITIAL_Y, 0]} />
  );
};

export default Player;

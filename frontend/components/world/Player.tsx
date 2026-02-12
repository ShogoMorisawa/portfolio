"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useInputStore } from "@/lib/world/store";
import { PLAYER, CAMERA } from "@/lib/world/config";
import { Model as Coco } from "./Coco";

interface PlayerProps {
  groundRef: React.RefObject<THREE.Object3D | null>;
  isMobile: boolean;
  playerRef: React.RefObject<THREE.Group | null>;
}

const Player = ({ groundRef, isMobile, playerRef }: PlayerProps) => {
  const raycaster = useRef(new THREE.Raycaster());
  const downVector = useRef(new THREE.Vector3(0, -1, 0));

  const PLAYER_HEIGHT_OFFSET = 0.5;

  const joystick = useInputStore((state) => state.joystick);
  const isTalking = useInputStore((state) => state.isTalking);
  const targetPosition = useInputStore((state) => state.targetPosition);
  const cameraSettings = isMobile ? CAMERA.mobile : CAMERA.pc;

  const [keys, setKeys] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const [isMoving, setIsMoving] = useState(false);
  const [moveDirection, setMoveDirection] = useState(1);

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
    if (!playerRef.current) return;
    const player = playerRef.current;

    // --- 1. 入力値の整理 (正規化) ---
    let rawX = 0;
    let rawY = 0;

    if (!isTalking) {
      if (keys.up) rawY += 1;
      if (keys.down) rawY -= 1;
      if (keys.left) rawX -= 1;
      if (keys.right) rawX += 1;

      if (joystick.isMoving) {
        rawX += joystick.x;
        rawY += joystick.y;
      }
    }

    const inputLen = Math.hypot(rawX, rawY);
    const normX = inputLen > 1 ? rawX / inputLen : rawX;
    const normY = inputLen > 1 ? rawY / inputLen : rawY;

    // --- 2. アニメーションフラグの更新 ---
    const moving = inputLen > 0.1;
    setIsMoving(moving);
    if (moving) {
      setMoveDirection(normY < -0.5 ? -1 : 1);
    }

    // --- 3. 旋回と移動の計算 ---
    // 旋回は左右入力のみ、移動は前後入力のみ（ストレイフなし）
    player.rotation.y -= normX * PLAYER.ROTATION_SPEED * delta;

    const forwardX = Math.sin(player.rotation.y);
    const forwardZ = Math.cos(player.rotation.y);

    const moveX = forwardX * normY * PLAYER.MOVE_SPEED * delta;
    const moveZ = forwardZ * normY * PLAYER.MOVE_SPEED * delta;
    player.position.x += moveX;
    player.position.z += moveZ;

    // --- 境界制限 ---
    const distanceFromCenter = Math.sqrt(
      player.position.x * player.position.x +
        player.position.z * player.position.z,
    );
    if (distanceFromCenter > PLAYER.BOUNDARY_RADIUS) {
      const ratio = PLAYER.BOUNDARY_RADIUS / distanceFromCenter;
      player.position.x *= ratio;
      player.position.z *= ratio;
    }

    // --- 接地判定 ---
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
          hitPoint.y + PLAYER_HEIGHT_OFFSET + PLAYER.GROUND_OFFSET;
      } else {
        if (player.position.y > PLAYER.FALL_THRESHOLD) {
          player.position.y -= PLAYER.GRAVITY;
        }
      }
    }

    // --- カメラ制御 ---
    const desiredCameraPos = new THREE.Vector3();
    const lookAtTarget = new THREE.Vector3();

    if (isTalking && targetPosition) {
      // 会話モード: クリスタルの真正面にカメラを置く
      const [tx, ty, tz] = targetPosition;
      const targetVec = new THREE.Vector3(tx, ty, tz);

      // クリスタルからプレイヤーへの方向ベクトル（水平方向のみ）
      const dir = new THREE.Vector3(
        player.position.x - tx,
        0,
        player.position.z - tz,
      ).normalize();

      const distance = 5;

      // カメラ位置 = クリスタル位置 + (方向 × 距離)
      desiredCameraPos.set(
        tx + dir.x * distance,
        ty + 0.5,
        tz + dir.z * distance,
      );

      lookAtTarget.copy(targetVec);
    } else {
      // 通常モード: プレイヤーを追従
      const playerTarget = player.position.clone();
      const cameraOffsetX =
        Math.sin(player.rotation.y) * cameraSettings.distance;
      const cameraOffsetZ =
        Math.cos(player.rotation.y) * cameraSettings.distance;
      desiredCameraPos.set(
        playerTarget.x - cameraOffsetX,
        playerTarget.y + cameraSettings.height,
        playerTarget.z - cameraOffsetZ,
      );
      lookAtTarget.copy(playerTarget);
      lookAtTarget.y += cameraSettings.lookAtOffsetY;
    }

    state.camera.position.lerp(desiredCameraPos, 0.1);
    state.camera.lookAt(lookAtTarget);
  });

  return (
    <group ref={playerRef} position={[0, PLAYER.INITIAL_Y, 0]}>
      <Coco isMoving={isMoving} moveDirection={moveDirection} />
    </group>
  );
};

export default Player;

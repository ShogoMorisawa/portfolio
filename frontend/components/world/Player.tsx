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

    // --- 入力処理 ---
    let moveForward = 0;
    let rotateY = 0;

    if (keys.up) moveForward += 1;
    if (keys.down) moveForward -= 1;
    if (keys.left) rotateY += 1;
    if (keys.right) rotateY -= 1;

    if (joystick.isMoving) {
      moveForward += joystick.y;
      rotateY -= joystick.x;
    }

    // --- Cocoへの命令用フラグ更新 ---
    const moving = Math.abs(moveForward) > 0.1;
    setIsMoving(moving);
    if (moving) {
      setMoveDirection(moveForward > 0 ? 1 : -1);
    }

    // --- 移動と回転 ---
    player.rotation.y += rotateY * PLAYER.ROTATION_SPEED * delta;
    const moveX =
      Math.sin(player.rotation.y) * PLAYER.MOVE_SPEED * moveForward * delta;
    const moveZ =
      Math.cos(player.rotation.y) * PLAYER.MOVE_SPEED * moveForward * delta;
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

    // --- カメラ追従 ---
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

    const lookAtTarget = targetPosition.clone();
    lookAtTarget.y += cameraSettings.lookAtOffsetY;
    state.camera.lookAt(lookAtTarget);
  });

  return (
    <group ref={playerRef} position={[0, PLAYER.INITIAL_Y, 0]}>
      <Coco isMoving={isMoving} moveDirection={moveDirection} />
    </group>
  );
};

export default Player;

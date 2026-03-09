"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useUIStore } from "@/shared/uiStore";
import type { ScreenTier } from "@/shared/useDeviceType";
import Coco from "./Coco";
import { LAYOUT, PLAYER, getCameraConfig } from "./worldConfig";

interface PlayerProps {
  groundRef: React.RefObject<THREE.Object3D | null>;
  playerRef: React.RefObject<THREE.Group | null>;
  screenTier: ScreenTier;
}

export default function Player({ groundRef, playerRef, screenTier }: PlayerProps) {
  const raycaster = useRef(new THREE.Raycaster());
  const downVector = useRef(new THREE.Vector3(0, -1, 0));
  const hasInitializedRotation = useRef(false);
  const previousMovingRef = useRef(false);
  const previousDirectionRef = useRef(1);

  const joystick = useUIStore((state) => state.joystick);
  const activeOverlay = useUIStore((state) => state.activeOverlay);
  const targetPosition = useUIStore((state) => state.targetPosition);
  const introSequence = useUIStore((state) => state.introSequence);
  const introFocusPosition = useUIStore((state) => state.introFocusPosition);
  const isDialogueOpen = activeOverlay === "dialogue";
  const isComputerOpen = activeOverlay === "computer";
  const isIntroInputLocked =
    introSequence === "approach" || introSequence === "message";
  const isIntroCameraActive = introSequence === "message";
  const cameraSettings = getCameraConfig(screenTier);

  const [keys, setKeys] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const [isMoving, setIsMoving] = useState(false);
  const [moveDirection, setMoveDirection] = useState(1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
          setKeys((current) => ({ ...current, up: true }));
          break;
        case "ArrowDown":
          setKeys((current) => ({ ...current, down: true }));
          break;
        case "ArrowLeft":
          setKeys((current) => ({ ...current, left: true }));
          break;
        case "ArrowRight":
          setKeys((current) => ({ ...current, right: true }));
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
          setKeys((current) => ({ ...current, up: false }));
          break;
        case "ArrowDown":
          setKeys((current) => ({ ...current, down: false }));
          break;
        case "ArrowLeft":
          setKeys((current) => ({ ...current, left: false }));
          break;
        case "ArrowRight":
          setKeys((current) => ({ ...current, right: false }));
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

    if (!hasInitializedRotation.current) {
      player.rotation.y = PLAYER.INITIAL_ROTATION_Y;
      hasInitializedRotation.current = true;
    }

    let rawX = 0;
    let rawY = 0;

    if (!isDialogueOpen && !isComputerOpen && !isIntroInputLocked) {
      if (keys.up) rawY += 1;
      if (keys.down) rawY -= 1;
      if (keys.left) rawX -= 1;
      if (keys.right) rawX += 1;

      if (joystick.isMoving) {
        rawX += joystick.x;
        rawY += joystick.y;
      }
    }

    const inputLength = Math.hypot(rawX, rawY);
    const normalizedX = inputLength > 1 ? rawX / inputLength : rawX;
    const normalizedY = inputLength > 1 ? rawY / inputLength : rawY;

    const moving = inputLength > 0.1;
    if (moving !== previousMovingRef.current) {
      previousMovingRef.current = moving;
      setIsMoving(moving);
    }

    if (moving) {
      const nextDirection = normalizedY < -0.5 ? -1 : 1;
      if (nextDirection !== previousDirectionRef.current) {
        previousDirectionRef.current = nextDirection;
        setMoveDirection(nextDirection);
      }
    }

    player.rotation.y -= normalizedX * PLAYER.ROTATION_SPEED * delta;

    const forwardX = Math.sin(player.rotation.y);
    const forwardZ = Math.cos(player.rotation.y);

    player.position.x += forwardX * normalizedY * PLAYER.MOVE_SPEED * delta;
    player.position.z += forwardZ * normalizedY * PLAYER.MOVE_SPEED * delta;

    const distanceFromCenter = Math.hypot(player.position.x, player.position.z);
    if (distanceFromCenter > PLAYER.BOUNDARY_RADIUS) {
      const ratio = PLAYER.BOUNDARY_RADIUS / distanceFromCenter;
      player.position.x *= ratio;
      player.position.z *= ratio;
    }

    if (groundRef.current) {
      const rayOrigin = player.position.clone();
      rayOrigin.y += PLAYER.RAYCAST_OFFSET;
      raycaster.current.set(rayOrigin, downVector.current);
      const intersects = raycaster.current.intersectObjects([groundRef.current], true);

      if (intersects.length > 0) {
        player.position.y = intersects[0].point.y + 0.5 + PLAYER.GROUND_OFFSET;
      } else if (player.position.y > PLAYER.FALL_THRESHOLD) {
        player.position.y -= PLAYER.GRAVITY;
      }
    }

    const desiredCameraPosition = new THREE.Vector3();
    const lookAtTarget = new THREE.Vector3();

    if (isIntroCameraActive && introFocusPosition) {
      const [targetX, targetY, targetZ] = introFocusPosition;
      const focusTarget = new THREE.Vector3(targetX, targetY, targetZ);
      const direction = new THREE.Vector3(
        player.position.x - targetX,
        0,
        player.position.z - targetZ,
      );

      if (direction.lengthSq() < 1e-4) {
        direction.set(0, 0, 1);
      } else {
        direction.normalize();
      }

      desiredCameraPosition.set(
        targetX + direction.x * 4.5,
        targetY + 1,
        targetZ + direction.z * 4.5,
      );
      lookAtTarget.copy(focusTarget);
    } else if (isComputerOpen) {
      const centerX = 0;
      const centerY = LAYOUT.COMPUTER_HEIGHT;
      const centerZ = -LAYOUT.OBJECT_RING_RADIUS;
      desiredCameraPosition.set(centerX, centerY + 0.5, centerZ + 6);
      lookAtTarget.set(centerX, centerY, centerZ);
    } else if (isDialogueOpen && targetPosition) {
      const [targetX, targetY, targetZ] = targetPosition;
      const crystalTarget = new THREE.Vector3(targetX, targetY, targetZ);
      const direction = new THREE.Vector3(
        player.position.x - targetX,
        0,
        player.position.z - targetZ,
      ).normalize();

      desiredCameraPosition.set(
        targetX + direction.x * 5,
        targetY + 0.5,
        targetZ + direction.z * 5,
      );
      lookAtTarget.copy(crystalTarget);
    } else {
      const playerTarget = player.position.clone();
      desiredCameraPosition.set(
        playerTarget.x - Math.sin(player.rotation.y) * cameraSettings.distance,
        playerTarget.y + cameraSettings.height,
        playerTarget.z - Math.cos(player.rotation.y) * cameraSettings.distance,
      );
      lookAtTarget.copy(playerTarget);
      lookAtTarget.y += cameraSettings.lookAtOffsetY;
    }

    state.camera.position.lerp(desiredCameraPosition, 0.1);
    state.camera.lookAt(lookAtTarget);
  });

  return (
    <group
      ref={playerRef}
      position={[PLAYER.INITIAL_X, PLAYER.INITIAL_Y, PLAYER.INITIAL_Z]}
    >
      <Coco isMoving={isMoving} moveDirection={moveDirection} />
    </group>
  );
}

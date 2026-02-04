"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { PLAYER } from "@/lib/world/config";

interface PlayerProps {
  groundRef: React.RefObject<THREE.Object3D | null>;
}

const Player = ({ groundRef }: PlayerProps) => {
  const group = useRef<THREE.Group>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const downVector = useRef(new THREE.Vector3(0, -1, 0));
  const { scene, animations } = useGLTF("models/coco.glb");
  const { actions, names } = useAnimations(animations, group);

  const playerHeightOffset = React.useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    return -box.min.y;
  }, [scene]);

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

    if (names.length > 0) {
      const action = actions[names[0]];
      if (action) {
        if (keys.up) {
          /* eslint-disable-next-line -- Three.js AnimationAction requires direct assignment */
          action.timeScale = 1;
          action.paused = false;
          action.play();
        } else if (keys.down) {
          action.timeScale = -1;
          action.paused = false;
          action.play();
        } else {
          action.paused = true;
        }
      }
    }

    if (keys.left) player.rotation.y += PLAYER.ROTATION_SPEED * delta;
    if (keys.right) player.rotation.y -= PLAYER.ROTATION_SPEED * delta;

    if (keys.up || keys.down) {
      const direction = keys.up ? 1 : -1;
      const moveX =
        Math.sin(player.rotation.y) * PLAYER.MOVE_SPEED * delta * direction;
      const moveZ =
        Math.cos(player.rotation.y) * PLAYER.MOVE_SPEED * delta * direction;

      player.position.x += moveX;
      player.position.z += moveZ;

      // XZ平面での原点からの距離を計算
      const distanceFromCenter = Math.sqrt(
        player.position.x * player.position.x +
          player.position.z * player.position.z,
      );

      // 半径を超えていたら、境界線上に押し戻す
      if (distanceFromCenter > PLAYER.BOUNDARY_RADIUS) {
        // 現在位置のベクトルを正規化し、最大半径を掛けるイメージ
        const ratio = PLAYER.BOUNDARY_RADIUS / distanceFromCenter;
        player.position.x *= ratio;
        player.position.z *= ratio;
      }
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

    const cameraOffsetX = Math.sin(player.rotation.y) * PLAYER.CAMERA_DISTANCE;
    const cameraOffsetZ = Math.cos(player.rotation.y) * PLAYER.CAMERA_DISTANCE;

    const desiredCameraPos = new THREE.Vector3(
      targetPosition.x - cameraOffsetX,
      targetPosition.y + PLAYER.CAMERA_HEIGHT,
      targetPosition.z - cameraOffsetZ,
    );

    state.camera.position.lerp(desiredCameraPos, 0.1);
    state.camera.lookAt(targetPosition);
  });

  return (
    <primitive ref={group} object={scene} position={[0, PLAYER.INITIAL_Y, 0]} />
  );
};

export default Player;

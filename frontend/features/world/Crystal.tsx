"use client";

import React, { useRef, useState } from "react";
import * as THREE from "three";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { GLTF } from "three-stdlib";
import { useUIStore } from "@/shared/uiStore";
import { CRYSTAL } from "./worldConfig";

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
};

export default function Crystal({
  id,
  position: initialPosition,
  message,
  scale = 0.25,
  sectorStart,
  sectorSize,
  playerRef,
  isFrozen = false,
}: CrystalProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes } = useGLTF("/models/crystal-transformed.glb") as unknown as GLTFResult;
  const matcap = useTexture("/textures/crystal_texture.jpg");

  const setActiveCrystal = useUIStore((state) => state.setActiveCrystal);
  const setNearbyState = useUIStore((state) => state.setNearbyState);
  const setTargetPosition = useUIStore((state) => state.setTargetPosition);
  const activeCrystalId = useUIStore((state) => state.activeCrystalId);
  const activeOverlay = useUIStore((state) => state.activeOverlay);
  const isDialogueOpen = activeOverlay === "dialogue";

  const [target, setTarget] = useState(
    new THREE.Vector3(initialPosition[0], initialPosition[1], initialPosition[2]),
  );

  const getNextPosition = (currentPosition: THREE.Vector3) => {
    const angle = sectorStart + Math.random() * sectorSize;
    const radius =
      CRYSTAL.MIN_RADIUS + (CRYSTAL.MAX_RADIUS - CRYSTAL.MIN_RADIUS) * Math.random();

    return new THREE.Vector3(
      Math.cos(angle) * radius,
      currentPosition.y,
      Math.sin(angle) * radius,
    );
  };

  useFrame((state, delta) => {
    if (!groupRef.current || isFrozen) return;

    const currentPosition = groupRef.current.position;
    const distanceToPlayer = playerRef.current
      ? currentPosition.distanceTo(playerRef.current.position)
      : currentPosition.distanceTo(state.camera.position);
    const threshold = activeCrystalId === id ? 7 : 5;
    const isNearby = distanceToPlayer < threshold;

    if (isNearby && activeCrystalId === null && !isDialogueOpen) {
      setActiveCrystal({ id, message });
    } else if (!isNearby && activeCrystalId === id && !isDialogueOpen) {
      setActiveCrystal(null);
    }

    if (activeCrystalId === id) {
      setTargetPosition([currentPosition.x, currentPosition.y, currentPosition.z]);
    }

    setNearbyState("crystal", activeCrystalId === id && isNearby && !isDialogueOpen);

    const isMyTurn = activeCrystalId === id || (activeCrystalId === null && isNearby);

    if (isMyTurn) {
      const lookTarget = (
        playerRef.current ? playerRef.current.position : state.camera.position
      ).clone();
      lookTarget.y = currentPosition.y;
      groupRef.current.lookAt(lookTarget);
    } else {
      const pauseThreshold = 0.5;
      const maxDelta = 0.1;
      const arrivalRadius = 0.5;
      const minDirectionLength = 1e-6;
      const distanceToTarget = new THREE.Vector2(
        currentPosition.x,
        currentPosition.z,
      ).distanceTo(new THREE.Vector2(target.x, target.z));

      const wasPaused = delta > pauseThreshold;
      const nextTarget = wasPaused ? getNextPosition(currentPosition) : null;
      if (nextTarget) setTarget(nextTarget);

      const frameDelta = wasPaused ? 0 : Math.min(delta, maxDelta);
      if (!wasPaused && distanceToTarget < arrivalRadius) {
        setTarget(getNextPosition(currentPosition));
      } else if (frameDelta > 0) {
        const destination = nextTarget ?? target;
        const direction = new THREE.Vector3().subVectors(destination, currentPosition);
        if (direction.length() > minDirectionLength) {
          direction.normalize();
          currentPosition.x += direction.x * CRYSTAL.SPEED * frameDelta;
          currentPosition.z += direction.z * CRYSTAL.SPEED * frameDelta;
        }
      }

      const lookTarget = (nextTarget ?? target).clone();
      lookTarget.y = currentPosition.y;
      groupRef.current.lookAt(lookTarget);
    }

    currentPosition.y = initialPosition[1] + Math.sin(state.clock.elapsedTime * 2) * 0.5;
  });

  return (
    <group ref={groupRef} position={initialPosition} dispose={null} scale={scale}>
      <group rotation={[0, -Math.PI / 2, 0]}>
        <mesh geometry={nodes.Body.geometry}>
          <meshMatcapMaterial matcap={matcap} color="#ffffff" />
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

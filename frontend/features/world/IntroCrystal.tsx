"use client";

import React, { useRef, useState } from "react";
import * as THREE from "three";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { GLTF } from "three-stdlib";
import { useUIStore } from "@/shared/uiStore";
import { getCrystalLookTarget, syncCrystalInteraction } from "./crystalInteraction";
import { CRYSTAL } from "./worldConfig";

interface IntroCrystalProps {
  id: string;
  initialPosition: [number, number, number];
  releasePosition: [number, number, number];
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

const INTRO_RELEASE_ARRIVAL_RADIUS = 0.6;
const INTRO_APPROACH_MIN_DURATION = 1.5;

export default function IntroCrystal({
  id,
  initialPosition,
  releasePosition,
  message,
  scale = 0.25,
  sectorStart,
  sectorSize,
  playerRef,
  isFrozen = false,
}: IntroCrystalProps) {
  const groupRef = useRef<THREE.Group>(null);
  const introApproachElapsedRef = useRef(0);
  const introSequence = useUIStore((state) => state.introSequence);
  const setIntroSequence = useUIStore((state) => state.setIntroSequence);
  const setIntroFocusPosition = useUIStore((state) => state.setIntroFocusPosition);
  const finishIntro = useUIStore((state) => state.finishIntro);
  const setActiveCrystal = useUIStore((state) => state.setActiveCrystal);
  const setNearbyState = useUIStore((state) => state.setNearbyState);
  const setTargetPosition = useUIStore((state) => state.setTargetPosition);
  const activeCrystalId = useUIStore((state) => state.activeCrystalId);
  const activeOverlay = useUIStore((state) => state.activeOverlay);
  const isDialogueOpen = activeOverlay === "dialogue";
  const { nodes } = useGLTF("/models/crystal-transformed.glb") as unknown as GLTFResult;
  const matcap = useTexture("/textures/crystal_texture.jpg");

  const [target, setTarget] = useState(
    new THREE.Vector3(releasePosition[0], releasePosition[1], releasePosition[2]),
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
    if (!groupRef.current) return;

    const currentPosition = groupRef.current.position;

    if (introSequence !== "done") {
      if (introSequence === "message") {
        setIntroFocusPosition([currentPosition.x, currentPosition.y, currentPosition.z]);
      } else if (introSequence === "release") {
        setIntroFocusPosition(null);
      }

      const playerPosition = playerRef.current?.position ?? state.camera.position;
      if (introSequence === "release") {
        const releaseLookTarget = new THREE.Vector3(
          releasePosition[0],
          currentPosition.y,
          releasePosition[2],
        );
        groupRef.current.lookAt(releaseLookTarget);
      } else {
        groupRef.current.lookAt(getCrystalLookTarget(playerPosition, currentPosition.y));
      }

      if (introSequence === "approach") {
        introApproachElapsedRef.current += delta;
        if (introApproachElapsedRef.current >= INTRO_APPROACH_MIN_DURATION) {
          setIntroSequence("message");
        }
      } else if (introSequence === "release") {
        const direction = new THREE.Vector3().subVectors(
          new THREE.Vector3(...releasePosition),
          currentPosition,
        );

        if (direction.length() <= INTRO_RELEASE_ARRIVAL_RADIUS) {
          setTarget(getNextPosition(currentPosition));
          finishIntro();
        } else {
          direction.y = 0;
          direction.normalize();
          currentPosition.x += direction.x * CRYSTAL.SPEED * delta * 1.8;
          currentPosition.z += direction.z * CRYSTAL.SPEED * delta * 1.8;
        }
      }

      currentPosition.y = initialPosition[1] + Math.sin(state.clock.elapsedTime * 2.4) * 0.5;
      return;
    }

    if (isFrozen) {
      currentPosition.y =
        releasePosition[1] + Math.sin(state.clock.elapsedTime * 2) * 0.5;
      return;
    }

    const playerPosition = playerRef.current?.position ?? state.camera.position;
    const { isMyTurn } = syncCrystalInteraction({
      id,
      message,
      currentPosition,
      playerPosition,
      activeCrystalId,
      isDialogueOpen,
      setActiveCrystal,
      setNearbyState,
      setTargetPosition,
    });

    if (isMyTurn) {
      groupRef.current.lookAt(getCrystalLookTarget(playerPosition, currentPosition.y));
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

    currentPosition.y = releasePosition[1] + Math.sin(state.clock.elapsedTime * 2) * 0.5;
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

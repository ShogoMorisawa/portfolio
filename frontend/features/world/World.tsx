"use client";

import React, { Suspense, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import BookObject from "@/features/book/BookObject";
import BoxObject from "@/features/box/BoxObject";
import ComputerObject from "@/features/computer/ComputerObject";
import PostObject from "@/features/post/PostObject";
import { useUIStore } from "@/shared/uiStore";
import { useDeviceType } from "@/shared/useDeviceType";
import Crystal from "./Crystal";
import Dome from "./Dome";
import Floor from "./Floor";
import IntroCrystal from "./IntroCrystal";
import Player from "./Player";
import { SectionImagesPreloader } from "./SectionImagesPreloader";
import { CAMERA, CRYSTAL, LAYOUT } from "./worldConfig";

export default function World() {
  const groundRef = useRef<THREE.Object3D | null>(null);
  const playerRef = useRef<THREE.Group>(null);
  const isMobile = useDeviceType();
  const activeOverlay = useUIStore((state) => state.activeOverlay);
  const shouldFreezeCrystals = activeOverlay !== "none";
  const cameraConfig = isMobile ? CAMERA.mobile : CAMERA.pc;

  const crystals = useMemo(() => {
    const seedHolder = { value: 1337 };
    const rand = () => {
      seedHolder.value = (seedHolder.value * 1664525 + 1013904223) % 4294967296;
      return seedHolder.value / 4294967296;
    };

    const messages = [
      "You’re a prism. Just being here is enough to make a rainbow.",
      "A lie is a white flag—an admission that your true self has no worth.",
      "I’m made of the bright shards of everyone I’ve ever met.",
      "Don’t smear mud on others and cloud their sight. Don’t smear mud on yourself and profane your own light.",
    ];

    return messages.map((message, index) => {
      const sectorSize = (Math.PI * 2) / messages.length;
      const sectorStart = index * sectorSize;
      const theta = sectorStart + rand() * sectorSize;
      const radius =
        CRYSTAL.MIN_RADIUS + (CRYSTAL.MAX_RADIUS - CRYSTAL.MIN_RADIUS) * rand();

      return {
        key: `crystal-${index}`,
        id: `crystal-${index}`,
        position: [Math.cos(theta) * radius, 2, Math.sin(theta) * radius] as [
          number,
          number,
          number,
        ],
        scale: 1,
        message,
        sectorStart,
        sectorSize,
      };
    });
  }, []);

  const introCrystal = crystals[2];
  const regularCrystals = crystals.filter((crystal) => crystal.id !== introCrystal?.id);

  return (
    <div className="w-full h-full bg-black">
      <Canvas
        flat
        key={isMobile ? "mobile" : "pc"}
        dpr={[1, 2]}
        frameloop="always"
        camera={{
          fov: cameraConfig.fov,
          position: cameraConfig.position,
        }}
      >
        <Suspense fallback={null}>
          <Dome />
          <Environment preset="city" background={false} environmentIntensity={2} />
          <ambientLight intensity={2} />
          <Sparkles
            count={1000}
            scale={35}
            position={[0, 6, 0]}
            size={20}
            speed={1}
            opacity={1}
            color="#ffffff"
            noise={0.5}
          />

          <Floor groundRef={groundRef} />
          <BookObject
            position={[LAYOUT.OBJECT_RING_RADIUS, LAYOUT.BOOK_HEIGHT, 0]}
            scale={LAYOUT.BOOK_SCALE}
            rotation={[0, 0, 0]}
            playerRef={playerRef}
          />
          <PostObject
            position={[0, LAYOUT.POST_HEIGHT, LAYOUT.OBJECT_RING_RADIUS]}
            scale={LAYOUT.POST_SCALE}
            rotation={[0, Math.PI, 0]}
            playerRef={playerRef}
          />
          <BoxObject
            position={[-LAYOUT.OBJECT_RING_RADIUS, LAYOUT.BOX_HEIGHT, 0]}
            scale={LAYOUT.BOX_SCALE}
            rotation={[0, Math.PI / 2, 0]}
            playerRef={playerRef}
          />
          <ComputerObject
            position={[0, LAYOUT.COMPUTER_HEIGHT, -LAYOUT.OBJECT_RING_RADIUS]}
            scale={LAYOUT.COMPUTER_SCALE}
            playerRef={playerRef}
          />
          <Player groundRef={groundRef} isMobile={isMobile} playerRef={playerRef} />

          {introCrystal && (
            <IntroCrystal
              key={introCrystal.key}
              id={introCrystal.id}
              initialPosition={[-3.2, 2, -3.2]}
              releasePosition={introCrystal.position}
              scale={introCrystal.scale}
              message={introCrystal.message}
              sectorStart={introCrystal.sectorStart}
              sectorSize={introCrystal.sectorSize}
              playerRef={playerRef}
              isFrozen={shouldFreezeCrystals}
            />
          )}

          {regularCrystals.map((crystal) => (
            <Crystal
              key={crystal.key}
              id={crystal.id}
              position={crystal.position}
              scale={crystal.scale}
              message={crystal.message}
              sectorStart={crystal.sectorStart}
              sectorSize={crystal.sectorSize}
              playerRef={playerRef}
              isFrozen={shouldFreezeCrystals}
            />
          ))}

          <SectionImagesPreloader />
        </Suspense>
      </Canvas>
    </div>
  );
}

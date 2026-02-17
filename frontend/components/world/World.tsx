"use client";

import React, { Suspense, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Sparkles, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

import Dome from "./Dome";
import Floor from "./Floor";
import Player from "./Player";
import { Model as Crystal } from "./Crystal";
import { Model as Book } from "./Book";
import { Model as Box } from "./Box";
import { Model as Post } from "./Post";
import { Model as Computer } from "./Computer";
import { CAMERA, CRYSTAL, LAYOUT } from "@/lib/world/config";
import { useDeviceType } from "@/hooks/useDeviceType";

export default function World() {
  const groundRef = useRef<THREE.Object3D | null>(null);
  const playerRef = useRef<THREE.Group>(null);
  const isMobile = useDeviceType();

  // スマホなら CAMERA.mobile、PCなら CAMERA.pc を使う
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
      const r =
        CRYSTAL.MIN_RADIUS + (CRYSTAL.MAX_RADIUS - CRYSTAL.MIN_RADIUS) * rand();
      const x = Math.cos(theta) * r;
      const y = 2;
      const z = Math.sin(theta) * r;
      const scale = 1;
      return {
        key: `crystal-${index}`,
        id: `crystal-${index}`,
        position: [x, y, z] as [number, number, number],
        scale,
        message,
        sectorStart,
        sectorSize,
      };
    });
  }, []);

  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        flat
        key={isMobile ? "mobile" : "pc"}
        dpr={[1, 2]}
        camera={{
          fov: cameraConfig.fov,
          position: cameraConfig.position,
        }}
      >
        <Suspense fallback={null}>
          <Dome />

          <Environment
            preset="city"
            background={false}
            environmentIntensity={0.8}
          />
          <ambientLight intensity={1} />

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
          {/* 90°ごとに円形配置: 0°=+X, 90°=+Z, 180°=-X, 270°=-Z */}
          <Book
            position={[
              LAYOUT.OBJECT_RING_RADIUS,
              LAYOUT.FLOAT_OBJECT_HEIGHT,
              0,
            ]}
            scale={LAYOUT.BOOK_SCALE}
            rotation={[1.65, 0, 1]}
          />
          <Post
            position={[
              0,
              LAYOUT.FLOAT_OBJECT_HEIGHT,
              LAYOUT.OBJECT_RING_RADIUS,
            ]}
            scale={LAYOUT.POST_SCALE}
            rotation={[0, Math.PI, 0]}
          />
          <Box
            position={[
              -LAYOUT.OBJECT_RING_RADIUS,
              LAYOUT.FLOAT_OBJECT_HEIGHT,
              0,
            ]}
            scale={LAYOUT.BOX_SCALE}
            rotation={[0, Math.PI / 2, 0]}
          />
          <Computer
            position={[
              0,
              LAYOUT.FLOAT_OBJECT_HEIGHT,
              -LAYOUT.OBJECT_RING_RADIUS,
            ]}
            scale={LAYOUT.COMPUTER_SCALE}
          />
          <Player
            groundRef={groundRef}
            isMobile={isMobile}
            playerRef={playerRef}
          />

          {crystals.map((crystal) => (
            <Crystal
              key={crystal.key}
              id={crystal.id}
              position={crystal.position}
              scale={crystal.scale}
              message={crystal.message}
              sectorStart={crystal.sectorStart}
              sectorSize={crystal.sectorSize}
              playerRef={playerRef}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}

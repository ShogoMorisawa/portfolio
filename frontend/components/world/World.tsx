"use client";

import React, { Suspense, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

import Dome from "./Dome";
import Floor from "./Floor";
import Player from "./Player";
import { Model as Crystal } from "./Crystal";
import { CAMERA } from "@/lib/world/config";
import { useDeviceType } from "@/hooks/useDeviceType";

export default function World() {
  const groundRef = useRef<THREE.Object3D | null>(null);
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
      "こんにちは (日本語)",
      "Hello (English)",
      "Hola (Español)",
      "Bonjour (Français)",
      "Hallo (Deutsch)",
      "Ciao (Italiano)",
      "Olá (Português)",
      "안녕하세요 (한국어)",
    ];

    return Array.from({ length: 8 }, (_, index) => {
      const x = (rand() - 0.5) * 30;
      const y = 2;
      const z = (rand() - 0.5) * 30;
      const scale = 0.4;
      return {
        key: `crystal-${index}`,
        position: [x, y, z] as [number, number, number],
        scale,
        message: messages[index % messages.length],
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

          <Floor groundRef={groundRef} />
          <Player groundRef={groundRef} isMobile={isMobile} />

          {crystals.map((crystal) => (
            <Crystal
              key={crystal.key}
              position={crystal.position}
              scale={crystal.scale}
              message={crystal.message}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}

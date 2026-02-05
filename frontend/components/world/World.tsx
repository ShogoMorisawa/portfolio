"use client";

import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

import Dome from "./Dome";
import Floor from "./Floor";
import Player from "./Player";
import { CAMERA } from "@/lib/world/config";
import { useDeviceType } from "@/hooks/useDeviceType";

export default function World() {
  const groundRef = useRef<THREE.Object3D | null>(null);
  const isMobile = useDeviceType();

  // スマホなら CAMERA.mobile、PCなら CAMERA.pc を使う
  const cameraConfig = isMobile ? CAMERA.mobile : CAMERA.pc;

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
        <Dome />

        <Environment
          preset="city"
          background={false}
          environmentIntensity={0.8}
        />
        <ambientLight intensity={1} />

        <Floor groundRef={groundRef} />
        <Player groundRef={groundRef} isMobile={isMobile} />
      </Canvas>
    </div>
  );
}

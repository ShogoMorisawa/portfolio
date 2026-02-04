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

export default function World() {
  const groundRef = useRef<THREE.Object3D | null>(null);

  return (
    <div className="w-full h-screen bg-black">
      <Canvas dpr={[1, 2]} camera={{ fov: CAMERA.pc.fov, position: CAMERA.pc.position }}>
        <Dome />

        <Environment
          preset="city"
          background={false}
          environmentIntensity={0.8}
        />

        <ambientLight intensity={1} />

        <Floor groundRef={groundRef} />
        <Player groundRef={groundRef} />

        <EffectComposer enableNormalPass={false}>
          <Bloom />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

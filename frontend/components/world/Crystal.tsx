"use client";

import * as THREE from "three";
import React, { useRef, useState } from "react";
import { Html, useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { GLTF } from "three-stdlib";

interface CrystalProps {
  position: [number, number, number];
  message: string;
  scale?: number | [number, number, number];
}

type GLTFResult = GLTF & {
  nodes: {
    Body: THREE.Mesh;
    Left_Eye: THREE.Mesh;
  };
  materials: {
    Body: THREE.MeshStandardMaterial;
    Eye: THREE.MeshStandardMaterial;
  };
};

export function Model({ position, message, scale = 0.25 }: CrystalProps) {
  const group = useRef<THREE.Group>(null);
  const { nodes } = useGLTF(
    "/models/crystal-transformed.glb",
  ) as unknown as GLTFResult;
  const matcap = useTexture("/textures/crystal_texture.jpg");

  const [showText, setShowText] = useState(false);
  const showTextRef = useRef(false);

  useFrame((state) => {
    if (!group.current) return;

    group.current.position.x = position[0];
    group.current.position.z = position[2];
    group.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.5;

    const dist = group.current.position.distanceTo(state.camera.position);
    const nextShowText = dist < 10;
    if (showTextRef.current !== nextShowText) {
      showTextRef.current = nextShowText;
      setShowText(nextShowText);
    }
  });

  return (
    <group ref={group} dispose={null} scale={scale}>
      {showText && (
        <Html position={[0, 2, 0]} center>
          <div className="bg-white/90 px-4 py-2 rounded-xl text-black font-bold text-sm whitespace-nowrap shadow-lg animate-bounce">
            {message}
          </div>
        </Html>
      )}

      <mesh geometry={nodes.Body.geometry}>
        <meshMatcapMaterial matcap={matcap} color={"#ffffff"} />
      </mesh>

      <mesh
        geometry={nodes.Left_Eye.geometry}
        position={[1.706, 0.656, -0.536]}
        rotation={[-Math.PI / 2, -0.351, 1.968]}
      >
        <meshBasicMaterial color="lemonchiffon" />
      </mesh>
    </group>
  );
}

useGLTF.preload("/models/crystal-transformed.glb");

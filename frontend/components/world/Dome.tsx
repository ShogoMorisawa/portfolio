"use client";

import React from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

import { STAGE } from "@/lib/world/config";

const Dome = () => {
  const domeData = useGLTF("models/dome.glb");
  const matcap = useTexture("textures/dome_texture.jpg");
  const domeMesh = domeData.nodes.Dome as THREE.Mesh | undefined;

  if (!domeMesh?.geometry) return null;

  return (
    <group dispose={null} position={[0, STAGE.DOME_POSITION_Y, 0]}>
      <mesh geometry={domeMesh.geometry} scale={[1.8, 1.8, 1.8]}>
        <meshMatcapMaterial
          matcap={matcap}
          side={THREE.DoubleSide}
          color="#ffffff"
        />
      </mesh>
    </group>
  );
};

export default Dome;

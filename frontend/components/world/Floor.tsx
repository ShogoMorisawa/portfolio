"use client";

import React from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

import { STAGE } from "@/lib/world/config";

interface FloorProps {
  groundRef: React.RefObject<THREE.Object3D | null>;
}

const Floor = ({ groundRef }: FloorProps) => {
  const { nodes } = useGLTF("models/floor.glb");
  const floorNode = (nodes.Floor || nodes.floor) as THREE.Mesh | undefined;
  const floorGeometry = floorNode?.geometry;
  const matcap = useTexture("textures/floor_texture.jpg");

  if (!floorGeometry) return null;

  return (
    <group ref={groundRef as React.RefObject<THREE.Group>} dispose={null}>
      <mesh
        geometry={floorGeometry}
        rotation={[0, 0, 0]}
        scale={[STAGE.DOME_SCALE, STAGE.DOME_SCALE, STAGE.DOME_SCALE]}
      >
        <meshMatcapMaterial matcap={matcap} color="#ffffff" />
      </mesh>
    </group>
  );
};

export default Floor;

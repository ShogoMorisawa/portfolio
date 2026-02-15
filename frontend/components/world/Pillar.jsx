import React from "react";
import * as THREE from "three";
import { useGLTF, useTexture } from "@react-three/drei";

export function Model(props) {
  const { nodes } = useGLTF("/models/pillar-transformed.glb");
  const domeTexture = useTexture("/textures/dome_texture.jpg");
  console.log(nodes);

  // 六角柱の一辺を正面に: 30° で面が正面に
  const hexFaceFront = Math.PI / 6; 
  return (
    <group {...props} dispose={null}>
      {/* 柱本体は GLB から（六角柱の一辺が正面を向くよう Y 回転） */}
      <mesh geometry={nodes.Pillar.geometry} position={[0, 5, 0]} rotation={[0, hexFaceFront, 0]}>
        <meshMatcapMaterial
          key="pillar-mat"
          matcap={domeTexture}
          color="#ffffff"
        />
      </mesh>

      {/* モニターは React 側で板として追加（ホログラム・文字制御用） */}
      <mesh position={[0, 2, -0.87]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.85, 0.5]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload("/models/pillar-transformed.glb");

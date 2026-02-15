/*
Post: Book 同様ふわふわ浮遊 + 横に傾いて戻る（扇形の角度範囲で揺れ）
*/

import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const FLOAT_SPEED = 1;
const FLOAT_AMPLITUDE = 0.3;
const TILT_SPEED = 2.5;
const TILT_ANGLE = 0.08; // 扇形の範囲（ラジアン）

export function Model(props) {
  const { position = [0, 0, 0], rotation = [0, 0, 0], ...rest } = props;
  const groupRef = useRef(null);
  const { nodes } = useGLTF("/models/post-transformed.glb");

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const [x, baseY, z] = position;
    groupRef.current.position.set(
      x,
      baseY + Math.sin(t * FLOAT_SPEED) * FLOAT_AMPLITUDE,
      z,
    );
    groupRef.current.rotation.set(
      rotation[0],
      rotation[1],
      rotation[2] + Math.sin(t * TILT_SPEED) * TILT_ANGLE,
    );
  });

  return (
    <group ref={groupRef} {...rest} dispose={null}>
      <mesh geometry={nodes.mesh_0.geometry} material={nodes.mesh_0.material} />
    </group>
  );
}

useGLTF.preload("/models/post-transformed.glb")

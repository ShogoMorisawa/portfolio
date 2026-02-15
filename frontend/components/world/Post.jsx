import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { FLOATING } from "@/lib/world/config";

const { FLOAT_SPEED, FLOAT_AMPLITUDE, TILT_SPEED, TILT_ANGLE } = FLOATING.post;

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

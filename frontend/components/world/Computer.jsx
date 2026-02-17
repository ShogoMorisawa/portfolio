import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { FLOATING } from "@/lib/world/config";

const { FLOAT_SPEED, FLOAT_AMPLITUDE, TILT_SPEED, TILT_ANGLE } =
  FLOATING.computer;

/** GLB のメッシュノード名（computer-transformed.glb のノード名） */
const COMPUTER_MESH_NODE_KEY = "mesh_0";

export function Model(props) {
  const { position = [0, 0, 0], rotation = [0, 0, 0], ...rest } = props;
  const groupRef = useRef(null);
  const { nodes } = useGLTF("/models/computer-transformed.glb");
  const meshNode = nodes[COMPUTER_MESH_NODE_KEY];

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

  if (!meshNode?.geometry) return null;

  return (
    <group ref={groupRef} {...rest} dispose={null}>
      <mesh
        geometry={meshNode.geometry}
        material={meshNode.material}
      />
    </group>
  );
}

useGLTF.preload("/models/computer-transformed.glb")

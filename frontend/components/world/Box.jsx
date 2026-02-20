import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { FLOATING, BOX } from "@/lib/world/config";
import { useInputStore } from "@/lib/world/store";

const { FLOAT_SPEED, FLOAT_AMPLITUDE, TILT_SPEED, TILT_ANGLE } = FLOATING.box;

/** GLB のメッシュノード名（box-transformed.glb のノード名） */
const BOX_MESH_NODE_KEY = "mesh_0";

export function Model(props) {
  const { position = [0, 0, 0], rotation = [0, 0, 0], playerRef, ...rest } = props;
  const groupRef = useRef(null);
  const { nodes } = useGLTF("/models/box-transformed.glb");
  const meshNode = nodes[BOX_MESH_NODE_KEY];
  const setIsBoxNearby = useInputStore((s) => s.setIsBoxNearby);
  const boxView = useInputStore((s) => s.boxView);

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

    // プレイヤーとの距離で TAP 表示のオンオフ（Box UI 表示中は更新しない）
    if (boxView !== "closed") return;
    const boxPos = groupRef.current.position;
    const playerPos = playerRef?.current?.position ?? state.camera.position;
    const dist = boxPos.distanceTo(playerPos);
    setIsBoxNearby(dist < BOX.NEARBY_THRESHOLD);
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

useGLTF.preload("/models/box-transformed.glb")

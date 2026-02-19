import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { FLOATING, BOOK } from "@/lib/world/config";
import { useInputStore } from "@/lib/world/store";

const { FLOAT_SPEED, FLOAT_AMPLITUDE, TILT_SPEED, TILT_ANGLE } = FLOATING.book;

/** GLB のメッシュノード名（book-transformed.glb のノード名） */
const BOOK_MESH_NODE_KEY = "Mesh_0";

export function Model(props) {
  const { position = [0, 0, 0], rotation = [0, 0, 0], playerRef, ...rest } = props;
  const groupRef = useRef(null);
  const { nodes } = useGLTF("/models/book-transformed.glb");
  const meshNode = nodes[BOOK_MESH_NODE_KEY];
  const setIsBookNearby = useInputStore((s) => s.setIsBookNearby);
  const isTalking = useInputStore((s) => s.isTalking);
  const isAdventureBookOpen = useInputStore((s) => s.isAdventureBookOpen);

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

    // プレイヤーとの距離で TAP 表示のオンオフ（会話中・ぼうけんのしょ表示中は無効）
    if (isTalking || isAdventureBookOpen) return;
    const bookPos = groupRef.current.position;
    const playerPos = playerRef?.current?.position ?? state.camera.position;
    const dist = bookPos.distanceTo(playerPos);
    setIsBookNearby(dist < BOOK.NEARBY_THRESHOLD);
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

useGLTF.preload("/models/book-transformed.glb");

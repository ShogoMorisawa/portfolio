import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { FLOATING, BOOK } from "@/lib/world/config";
import { useInputStore } from "@/lib/world/store";
import {
  FloatingWorldModel,
  type FloatingModelProps,
} from "./FloatingWorldModel";

/** GLB のメッシュノード名（book-transformed.glb のノード名） */
const BOOK_MESH_NODE_KEY = "Mesh_0";
const BOOK_MODEL_PATH = "/models/book-transformed.glb";

type BookProps = FloatingModelProps & {
  playerRef?: RefObject<THREE.Group | null>;
};

export function Model(props: BookProps) {
  const { position = [0, 0, 0], rotation = [0, 0, 0], playerRef, ...rest } = props;
  const setIsBookNearby = useInputStore((s) => s.setIsBookNearby);
  const isTalking = useInputStore((s) => s.isTalking);
  const isAdventureBookOpen = useInputStore((s) => s.isAdventureBookOpen);
  const prevNearbyRef = useRef<boolean | null>(null);

  return (
    <FloatingWorldModel
      {...rest}
      position={position}
      rotation={rotation}
      modelPath={BOOK_MODEL_PATH}
      meshNodeKey={BOOK_MESH_NODE_KEY}
      floating={FLOATING.book}
      onFrame={({ state, group }) => {
        // プレイヤーとの距離で TAP 表示のオンオフ（会話中・ぼうけんのしょ表示中は無効）
        if (isTalking || isAdventureBookOpen) return;
        const playerPos = playerRef?.current?.position ?? state.camera.position;
        const dist = group.position.distanceTo(playerPos);
        const isNearby = dist < BOOK.NEARBY_THRESHOLD;
        if (prevNearbyRef.current !== isNearby) {
          prevNearbyRef.current = isNearby;
          setIsBookNearby(isNearby);
        }
      }}
    />
  );
}

useGLTF.preload(BOOK_MODEL_PATH);

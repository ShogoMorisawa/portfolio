import { type RefObject } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { FLOATING, BOX } from "@/lib/world/config";
import { useInputStore } from "@/lib/world/store";
import {
  FloatingWorldModel,
  type FloatingModelProps,
} from "./FloatingWorldModel";

/** GLB のメッシュノード名（box-transformed.glb のノード名） */
const BOX_MESH_NODE_KEY = "mesh_0";
const BOX_MODEL_PATH = "/models/box-transformed.glb";

type BoxProps = FloatingModelProps & {
  playerRef?: RefObject<THREE.Group | null>;
};

export function Model(props: BoxProps) {
  const { position = [0, 0, 0], rotation = [0, 0, 0], playerRef, ...rest } = props;
  const setIsBoxNearby = useInputStore((s) => s.setIsBoxNearby);
  const boxView = useInputStore((s) => s.boxView);

  return (
    <FloatingWorldModel
      {...rest}
      position={position}
      rotation={rotation}
      modelPath={BOX_MODEL_PATH}
      meshNodeKey={BOX_MESH_NODE_KEY}
      floating={FLOATING.box}
      onFrame={({ state, group }) => {
        // プレイヤーとの距離で TAP 表示のオンオフ（Box UI 表示中は更新しない）
        if (boxView !== "closed") return;
        const playerPos = playerRef?.current?.position ?? state.camera.position;
        const dist = group.position.distanceTo(playerPos);
        setIsBoxNearby(dist < BOX.NEARBY_THRESHOLD);
      }}
    />
  );
}

useGLTF.preload(BOX_MODEL_PATH);

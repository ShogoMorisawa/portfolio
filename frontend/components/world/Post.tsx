import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { FLOATING, POST } from "@/lib/world/config";
import { useInputStore } from "@/lib/world/store";
import {
  FloatingWorldModel,
  type FloatingModelProps,
} from "./FloatingWorldModel";

/** GLB のメッシュノード名（post-transformed.glb のノード名） */
const POST_MESH_NODE_KEY = "mesh_0";
const POST_MODEL_PATH = "/models/post-transformed.glb";

type PostProps = FloatingModelProps & {
  playerRef?: RefObject<THREE.Group | null>;
};

export function Model(props: PostProps) {
  const { position = [0, 0, 0], rotation = [0, 0, 0], playerRef, ...rest } =
    props;
  const setIsPostNearby = useInputStore((s) => s.setIsPostNearby);
  const isPostOpen = useInputStore((s) => s.isPostOpen);
  const prevNearbyRef = useRef<boolean | null>(null);

  return (
    <FloatingWorldModel
      {...rest}
      position={position}
      rotation={rotation}
      modelPath={POST_MODEL_PATH}
      meshNodeKey={POST_MESH_NODE_KEY}
      floating={FLOATING.post}
      onFrame={({ state, group }) => {
        if (isPostOpen) return;
        const playerPos = playerRef?.current?.position ?? state.camera.position;
        const dist = group.position.distanceTo(playerPos);
        const isNearby = dist < POST.NEARBY_THRESHOLD;
        if (prevNearbyRef.current !== isNearby) {
          prevNearbyRef.current = isNearby;
          setIsPostNearby(isNearby);
        }
      }}
    />
  );
}

useGLTF.preload(POST_MODEL_PATH);

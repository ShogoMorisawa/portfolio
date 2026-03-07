import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { FloatingWorldModel, type FloatingModelProps } from "@/features/world/FloatingWorldModel";
import { FLOATING, POST } from "@/features/world/worldConfig";
import { useUIStore } from "@/shared/uiStore";

const POST_MESH_NODE_KEY = "mesh_0";
const POST_MODEL_PATH = "/models/post-transformed.glb";

type PostObjectProps = FloatingModelProps & {
  playerRef?: RefObject<THREE.Group | null>;
};

export default function PostObject({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  playerRef,
  ...rest
}: PostObjectProps) {
  const activeOverlay = useUIStore((state) => state.activeOverlay);
  const setNearbyState = useUIStore((state) => state.setNearbyState);
  const previousNearbyRef = useRef<boolean | null>(null);

  return (
    <FloatingWorldModel
      {...rest}
      position={position}
      rotation={rotation}
      modelPath={POST_MODEL_PATH}
      meshNodeKey={POST_MESH_NODE_KEY}
      floating={FLOATING.post}
      onFrame={({ state, group }) => {
        if (activeOverlay !== "none") {
          if (previousNearbyRef.current) {
            previousNearbyRef.current = false;
            setNearbyState("post", false);
          }
          return;
        }

        const playerPosition = playerRef?.current?.position ?? state.camera.position;
        const isNearby = group.position.distanceTo(playerPosition) < POST.NEARBY_THRESHOLD;
        if (previousNearbyRef.current !== isNearby) {
          previousNearbyRef.current = isNearby;
          setNearbyState("post", isNearby);
        }
      }}
    />
  );
}

useGLTF.preload(POST_MODEL_PATH);

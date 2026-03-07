import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { FloatingWorldModel, type FloatingModelProps } from "@/features/world/FloatingWorldModel";
import { BOX, FLOATING } from "@/features/world/worldConfig";
import { useUIStore } from "@/shared/uiStore";

const BOX_MESH_NODE_KEY = "mesh_0";
const BOX_MODEL_PATH = "/models/box-transformed.glb";

type BoxObjectProps = FloatingModelProps & {
  playerRef?: RefObject<THREE.Group | null>;
};

export default function BoxObject({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  playerRef,
  ...rest
}: BoxObjectProps) {
  const activeOverlay = useUIStore((state) => state.activeOverlay);
  const setNearbyState = useUIStore((state) => state.setNearbyState);
  const previousNearbyRef = useRef<boolean | null>(null);

  return (
    <FloatingWorldModel
      {...rest}
      position={position}
      rotation={rotation}
      modelPath={BOX_MODEL_PATH}
      meshNodeKey={BOX_MESH_NODE_KEY}
      floating={FLOATING.box}
      onFrame={({ state, group }) => {
        if (activeOverlay !== "none") {
          if (previousNearbyRef.current) {
            previousNearbyRef.current = false;
            setNearbyState("box", false);
          }
          return;
        }

        const playerPosition = playerRef?.current?.position ?? state.camera.position;
        const isNearby = group.position.distanceTo(playerPosition) < BOX.NEARBY_THRESHOLD;
        if (previousNearbyRef.current !== isNearby) {
          previousNearbyRef.current = isNearby;
          setNearbyState("box", isNearby);
        }
      }}
    />
  );
}

useGLTF.preload(BOX_MODEL_PATH);

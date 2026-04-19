import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { FloatingWorldModel, type FloatingModelProps } from "@/features/world/FloatingWorldModel";
import { BOOK, FLOATING } from "@/features/world/worldConfig";
import { useUIStore } from "@/shared/uiStore";

const BOOK_MESH_NODE_KEY = "Mesh_0";
const BOOK_MODEL_PATH = "/models/book-transformed.glb";

type BookObjectProps = FloatingModelProps & {
  playerRef?: RefObject<THREE.Group | null>;
};

export default function BookObject({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  playerRef,
  ...rest
}: BookObjectProps) {
  const activeOverlay = useUIStore((state) => state.activeOverlay);
  const setNearbyState = useUIStore((state) => state.setNearbyState);
  const previousNearbyRef = useRef<boolean | null>(null);

  return (
    <FloatingWorldModel
      {...rest}
      position={position}
      rotation={rotation}
      modelPath={BOOK_MODEL_PATH}
      meshNodeKey={BOOK_MESH_NODE_KEY}
      floating={FLOATING.book}
      onFrame={({ state, group }) => {
        if (activeOverlay !== "none") {
          if (previousNearbyRef.current) {
            previousNearbyRef.current = false;
            setNearbyState("book", false);
          }
          return;
        }

        const playerPosition = playerRef?.current?.position ?? state.camera.position;
        const isNearby = group.position.distanceTo(playerPosition) < BOOK.NEARBY_THRESHOLD;
        if (previousNearbyRef.current !== isNearby) {
          previousNearbyRef.current = isNearby;
          setNearbyState("book", isNearby);
        }
      }}
    />
  );
}

useGLTF.preload(BOOK_MODEL_PATH);

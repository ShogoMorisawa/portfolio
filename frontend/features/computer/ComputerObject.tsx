import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { FloatingWorldModel, type FloatingModelProps } from "@/features/world/FloatingWorldModel";
import { COMPUTER, FLOATING } from "@/features/world/worldConfig";
import { useUIStore } from "@/shared/uiStore";

const COMPUTER_MESH_NODE_KEY = "mesh_0";
const COMPUTER_MODEL_PATH = "/models/computer-transformed.glb";
const STATIC_FLOATING = {
  FLOAT_SPEED: 0,
  FLOAT_AMPLITUDE: 0,
  TILT_SPEED: 0,
  TILT_ANGLE: 0,
} as const;

type ComputerObjectProps = FloatingModelProps & {
  playerRef?: RefObject<THREE.Group | null>;
};

export default function ComputerObject({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  playerRef,
  ...rest
}: ComputerObjectProps) {
  const activeOverlay = useUIStore((state) => state.activeOverlay);
  const isComputerOpen = activeOverlay === "computer";
  const setNearbyState = useUIStore((state) => state.setNearbyState);
  const previousNearbyRef = useRef<boolean | null>(null);

  return (
    <FloatingWorldModel
      {...rest}
      position={position}
      rotation={rotation}
      modelPath={COMPUTER_MODEL_PATH}
      meshNodeKey={COMPUTER_MESH_NODE_KEY}
      floating={isComputerOpen ? STATIC_FLOATING : FLOATING.computer}
      onFrame={({ state, group }) => {
        if (activeOverlay !== "none") {
          if (previousNearbyRef.current) {
            previousNearbyRef.current = false;
            setNearbyState("computer", false);
          }
          return;
        }

        const playerPosition = playerRef?.current?.position ?? state.camera.position;
        const isNearby =
          group.position.distanceTo(playerPosition) < COMPUTER.NEARBY_THRESHOLD;
        if (previousNearbyRef.current !== isNearby) {
          previousNearbyRef.current = isNearby;
          setNearbyState("computer", isNearby);
        }
      }}
    />
  );
}

useGLTF.preload(COMPUTER_MODEL_PATH);

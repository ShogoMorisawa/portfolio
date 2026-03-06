import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { FLOATING, COMPUTER } from "@/lib/world/config";
import { useInputStore } from "@/lib/world/store";
import {
  FloatingWorldModel,
  type FloatingModelProps,
} from "./FloatingWorldModel";

/** GLB のメッシュノード名（computer-transformed.glb のノード名） */
const COMPUTER_MESH_NODE_KEY = "mesh_0";
const COMPUTER_MODEL_PATH = "/models/computer-transformed.glb";
const STATIC_FLOATING = {
  FLOAT_SPEED: 0,
  FLOAT_AMPLITUDE: 0,
  TILT_SPEED: 0,
  TILT_ANGLE: 0,
} as const;

type ComputerProps = FloatingModelProps & {
  playerRef?: RefObject<THREE.Group | null>;
};

export function Model(props: ComputerProps) {
  const {
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    playerRef,
    ...rest
  } = props;
  const setIsComputerNearby = useInputStore((s) => s.setIsComputerNearby);
  const isComputerOpen = useInputStore((s) => s.isComputerOpen);
  const prevNearbyRef = useRef<boolean | null>(null);

  return (
    <FloatingWorldModel
      {...rest}
      position={position}
      rotation={rotation}
      modelPath={COMPUTER_MODEL_PATH}
      meshNodeKey={COMPUTER_MESH_NODE_KEY}
      floating={isComputerOpen ? STATIC_FLOATING : FLOATING.computer}
      onFrame={({ state, group }) => {
        if (isComputerOpen) return;
        const playerPos = playerRef?.current?.position ?? state.camera.position;
        const dist = group.position.distanceTo(playerPos);
        const isNearby = dist < COMPUTER.NEARBY_THRESHOLD;
        if (prevNearbyRef.current !== isNearby) {
          prevNearbyRef.current = isNearby;
          setIsComputerNearby(isNearby);
        }
      }}
    />
  );
}

useGLTF.preload(COMPUTER_MODEL_PATH);

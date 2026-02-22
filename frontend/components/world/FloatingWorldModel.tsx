import { useRef, type ComponentPropsWithoutRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame, type RootState } from "@react-three/fiber";

type Vec3 = [number, number, number];

type FloatingParams = {
  FLOAT_SPEED: number;
  FLOAT_AMPLITUDE: number;
  TILT_SPEED: number;
  TILT_ANGLE: number;
};

export type FloatingModelProps = Omit<ComponentPropsWithoutRef<"group">, "position" | "rotation"> & {
  position?: Vec3;
  rotation?: Vec3;
};

type FloatingFrameContext = {
  state: RootState;
  group: THREE.Group;
};

type FloatingWorldModelProps = FloatingModelProps & {
  modelPath: string;
  meshNodeKey: string;
  floating: FloatingParams;
  onFrame?: (ctx: FloatingFrameContext) => void;
};

type GLTFNodesResult = {
  nodes: Record<string, THREE.Mesh>;
};

export function FloatingWorldModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  modelPath,
  meshNodeKey,
  floating,
  onFrame,
  ...rest
}: FloatingWorldModelProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const { nodes } = useGLTF(modelPath) as unknown as GLTFNodesResult;
  const meshNode = nodes[meshNodeKey];

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const [x, baseY, z] = position;
    groupRef.current.position.set(
      x,
      baseY + Math.sin(t * floating.FLOAT_SPEED) * floating.FLOAT_AMPLITUDE,
      z,
    );
    groupRef.current.rotation.set(
      rotation[0],
      rotation[1],
      rotation[2] + Math.sin(t * floating.TILT_SPEED) * floating.TILT_ANGLE,
    );
    onFrame?.({ state, group: groupRef.current });
  });

  if (!meshNode?.geometry) return null;

  return (
    <group ref={groupRef} {...rest} dispose={null}>
      <mesh geometry={meshNode.geometry} material={meshNode.material} />
    </group>
  );
}

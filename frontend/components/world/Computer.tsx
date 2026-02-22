import { useGLTF } from "@react-three/drei";
import { FLOATING } from "@/lib/world/config";
import {
  FloatingWorldModel,
  type FloatingModelProps,
} from "./FloatingWorldModel";

/** GLB のメッシュノード名（computer-transformed.glb のノード名） */
const COMPUTER_MESH_NODE_KEY = "mesh_0";
const COMPUTER_MODEL_PATH = "/models/computer-transformed.glb";

export function Model(props: FloatingModelProps) {
  const { position = [0, 0, 0], rotation = [0, 0, 0], ...rest } = props;
  return (
    <FloatingWorldModel
      {...rest}
      position={position}
      rotation={rotation}
      modelPath={COMPUTER_MODEL_PATH}
      meshNodeKey={COMPUTER_MESH_NODE_KEY}
      floating={FLOATING.computer}
    />
  );
}

useGLTF.preload(COMPUTER_MODEL_PATH);

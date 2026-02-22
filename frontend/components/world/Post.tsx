import { useGLTF } from "@react-three/drei";
import { FLOATING } from "@/lib/world/config";
import {
  FloatingWorldModel,
  type FloatingModelProps,
} from "./FloatingWorldModel";

/** GLB のメッシュノード名（post-transformed.glb のノード名） */
const POST_MESH_NODE_KEY = "mesh_0";
const POST_MODEL_PATH = "/models/post-transformed.glb";

export function Model(props: FloatingModelProps) {
  const { position = [0, 0, 0], rotation = [0, 0, 0], ...rest } = props;
  return (
    <FloatingWorldModel
      {...rest}
      position={position}
      rotation={rotation}
      modelPath={POST_MODEL_PATH}
      meshNodeKey={POST_MESH_NODE_KEY}
      floating={FLOATING.post}
    />
  );
}

useGLTF.preload(POST_MODEL_PATH);

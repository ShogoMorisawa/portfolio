/*
Coco モデル: coco.glb をそのまま表示（変換済み用の骨・目アタッチ等は行わない）
*/

import * as THREE from "three";
import React, { useEffect, useImperativeHandle, useLayoutEffect } from "react";
import { useGLTF, useAnimations, useTexture } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

interface CocoProps {
  isMoving: boolean;
  moveDirection: number; // 1: 前進, -1: 後退
}

export const Model = React.forwardRef<
  THREE.Group,
  React.ComponentPropsWithoutRef<"group"> & CocoProps
>(({ isMoving, moveDirection, ...props }, ref) => {
  const group = React.useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/coco.glb");
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, group);
  const matcap = useTexture("/textures/coco_texture.png");

  useImperativeHandle(ref, () => group.current!);

  // Body に coco_texture の matcap を適用
  useLayoutEffect(() => {
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh && obj.name === "Body") {
        (obj as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
          matcap,
          color: 0xffffff,
        });
      }
    });
  }, [clone, matcap]);

  useEffect(() => {
    const actionName = Object.keys(actions)[0];
    const action = actions[actionName];
    if (action) {
      if (isMoving) {
        action.setEffectiveTimeScale(moveDirection);
        action.play();
      } else {
        action.stop();
      }
    }
  }, [isMoving, moveDirection, actions]);

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={clone} />
    </group>
  );
});

Model.displayName = "Coco";

useGLTF.preload("/models/coco.glb");

/*
Coco モデル: coco.glb をそのまま表示（変換済み用の骨・目アタッチ等は行わない）
*/

import React, { useEffect, useImperativeHandle, useLayoutEffect } from "react";
import * as THREE from "three";
import { useAnimations, useGLTF, useTexture } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

interface CocoProps {
  isMoving: boolean;
  moveDirection: number;
}

const Coco = React.forwardRef<
  THREE.Group,
  React.ComponentPropsWithoutRef<"group"> & CocoProps
>(({ isMoving, moveDirection, ...props }, ref) => {
  const group = React.useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/coco.glb");
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, group);
  const matcap = useTexture("/textures/coco_texture.png");

  useImperativeHandle(ref, () => group.current!);

  useLayoutEffect(() => {
    clone.traverse((object) => {
      if ((object as THREE.Mesh).isMesh && object.name === "Body") {
        (object as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
          matcap,
          color: 0xffffff,
        });
      }
    });
  }, [clone, matcap]);

  useEffect(() => {
    const actionName = Object.keys(actions)[0];
    const action = actions[actionName];
    if (!action) return;

    if (isMoving) {
      action.setEffectiveTimeScale(moveDirection);
      action.play();
      return;
    }

    action.stop();
  }, [actions, isMoving, moveDirection]);

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={clone} />
    </group>
  );
});

Coco.displayName = "Coco";

useGLTF.preload("/models/coco.glb");

export default Coco;

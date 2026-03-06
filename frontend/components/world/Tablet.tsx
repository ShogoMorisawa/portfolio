"use client";

import { useEffect, useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { LAYOUT } from "@/lib/world/config";
import { useInputStore } from "@/lib/world/store";

/** tablet-transformed.glb を使う場合は "/models/tablet-transformed.glb" に変更。変換: gltf-transform optimize tablet.glb tablet-transformed.glb */
const TABLET_MODEL_PATH = "/models/tablet.glb";

type GLTFResult = {
  nodes: Record<string, THREE.Mesh>;
  scene: THREE.Group;
};

/** タブレット画面に画像を貼った平面。1マテリアルで map を差し替えて表示を安定させる */
function TabletScreen({
  imageList,
  currentIndex,
}: {
  imageList: string[];
  currentIndex: number;
}) {
  const textures = useTexture(imageList);
  const textureArray = useMemo(
    () => (Array.isArray(textures) ? textures : [textures]),
    [textures],
  );
  const normalizedIndex =
    textureArray.length > 0
      ? ((currentIndex % textureArray.length) + textureArray.length) %
        textureArray.length
      : 0;
  const texture = textureArray[normalizedIndex] ?? null;

  useEffect(() => {
    textureArray.forEach((tex) => {
      if (!tex) return;
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
    });
  }, [textureArray]);

  const [rx, ry, rz] = LAYOUT.TABLET_SCREEN_ROTATION;
  if (!texture) return null;
  return (
    <mesh
      position={[
        LAYOUT.TABLET_SCREEN_OFFSET_X,
        LAYOUT.TABLET_SCREEN_OFFSET_Y,
        LAYOUT.TABLET_SCREEN_OFFSET_Z,
      ]}
      rotation={[rx, ry, rz]}
    >
      <planeGeometry args={[LAYOUT.TABLET_SCREEN_WIDTH, LAYOUT.TABLET_SCREEN_HEIGHT]} />
      <meshBasicMaterial
        map={texture}
        toneMapped={false}
        transparent={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** ガラス風マテリアル（透過・屈折・反射） */
function useGlassMaterial() {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f0f0f0",
        transparent: true,
        transmission: 1,
        thickness: 0.15,
        roughness: 0,
        metalness: 0,
        ior: 1.5,
        attenuationDistance: 0.5,
        attenuationColor: new THREE.Color("#f0f0f0"),
        side: THREE.DoubleSide,
      }),
    [],
  );
}

/** コンピューターセクション表示時に画面中央に表示するタブレットモデル（ガラス素材） */
export function Model() {
  const isComputerOpen = useInputStore((s) => s.isComputerOpen);
  const tabletScreenImageIndex = useInputStore((s) => s.tabletScreenImageIndex);
  const { nodes, scene } = useGLTF(TABLET_MODEL_PATH) as unknown as GLTFResult;
  const glassMaterial = useGlassMaterial();

  const sceneWithGlass = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        obj.material = glassMaterial;
      }
    });
    return cloned;
  }, [scene, glassMaterial]);

  if (!isComputerOpen) return null;

  const cx = 0;
  const cy = LAYOUT.TABLET_HEIGHT;
  const cz = -LAYOUT.OBJECT_RING_RADIUS + LAYOUT.TABLET_OFFSET_Z;
  const position: [number, number, number] = [cx, cy, cz];
  const scale = LAYOUT.TABLET_SCALE;
  const rotation = LAYOUT.TABLET_ROTATION;

  const meshNode =
    nodes["mesh_0"] ?? nodes["Mesh_0"] ?? Object.values(nodes)[0];

  const imageList =
    LAYOUT.TABLET_SCREEN_IMAGES.length > 0
      ? LAYOUT.TABLET_SCREEN_IMAGES
      : LAYOUT.TABLET_SCREEN_IMAGE
        ? [LAYOUT.TABLET_SCREEN_IMAGE]
        : [];
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {meshNode?.geometry ? (
        <mesh geometry={meshNode.geometry} material={glassMaterial} />
      ) : (
        <primitive object={sceneWithGlass} />
      )}
      {imageList.length > 0 ? (
        <TabletScreen
          imageList={imageList}
          currentIndex={tabletScreenImageIndex}
        />
      ) : null}
    </group>
  );
}

useGLTF.preload(TABLET_MODEL_PATH);

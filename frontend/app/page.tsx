"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Box } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { Suspense } from "react";

function CoColiliaModel() {
  const { scene } = useGLTF("/cocolilia_v1.glb");
  return (
    <RigidBody position={[0, 5, 0]} colliders="hull" restitution={0.5}>
      <primitive object={scene} scale={2} position={[0, 0, 0]} />
    </RigidBody>
  );
}

function Floor() {
  return (
    <RigidBody type="fixed" position={[0, -2, 0]}>
      <Box args={[20, 1, 20]}>
        <meshStandardMaterial color="gray" />
      </Box>
    </RigidBody>
  );
}

export default function Home() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        {/* ライトの設定 */}
        <Environment preset="city" />
        <ambientLight intensity={0.5} />

        <Physics debug={true}>
          {/* モデルの設定 */}
          <Suspense fallback={null}>
            <CoColiliaModel />
          </Suspense>

          {/* 床 */}
          <Floor />
        </Physics>

        {/* コントロールの設定 */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Suspense } from "react";

function CoColiliaModel() {
  const { scene } = useGLTF("/cocolilia_v1.glb");
  return <primitive object={scene} scale={2} position={[0, 0, 0]} />;
}

export default function Home() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        {/* ライトの設定 */}
        <Environment preset="city" />
        <ambientLight intensity={0.5} />

        {/* モデルの設定 */}
        <Suspense fallback={null}>
          <CoColiliaModel />
        </Suspense>

        {/* コントロールの設定 */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

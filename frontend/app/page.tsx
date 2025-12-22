"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  Box,
  useKeyboardControls,
  KeyboardControls,
} from "@react-three/drei";
import { Physics, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { Suspense, useRef } from "react";
import Gorillia from "./components/Gorillia";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
  { name: "jump", keys: ["Space"] },
];

function CoColiliaModel() {
  const { scene } = useGLTF("/cocolilia_v1.glb");
  const rigidBody = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls();

  useFrame(() => {
    // 今どのキーが押されているかをget
    const { forward, backward, left, right, jump } = get();
    // まだボディが生成されていない場合はreturn
    if (!rigidBody.current) return;
    //力の強さを設定
    const torqueStrength = 1;

    if (forward) {
      rigidBody.current.applyTorqueImpulse(
        {
          x: -torqueStrength,
          y: 0,
          z: 0,
        },
        true
      );
      rigidBody.current.applyImpulse(
        {
          x: 0,
          y: 0,
          z: -1,
        },
        true
      );
    }
    if (backward) {
      rigidBody.current.applyTorqueImpulse(
        {
          x: torqueStrength,
          y: 0,
          z: 0,
        },
        true
      );
      rigidBody.current.applyImpulse(
        {
          x: 0,
          y: 0,
          z: 1,
        },
        true
      );
    }
    if (left) {
      rigidBody.current.applyTorqueImpulse(
        {
          x: 0,
          y: 0,
          z: torqueStrength,
        },
        true
      );
      rigidBody.current.applyImpulse(
        {
          x: -1,
          y: 0,
          z: 0,
        },
        true
      );
    }
    if (right) {
      rigidBody.current.applyTorqueImpulse(
        {
          x: 0,
          y: 0,
          z: -torqueStrength,
        },
        true
      );
      rigidBody.current.applyImpulse(
        {
          x: 1,
          y: 0,
          z: 0,
        },
        true
      );
    }
    if (jump) {
      rigidBody.current.applyImpulse({ x: 0, y: 10, z: 0 }, true);
    }
  });

  return (
    <RigidBody
      ref={rigidBody}
      position={[0, 20, 0]}
      colliders="hull"
      restitution={0.5}
      linearDamping={0.5}
      angularDamping={0.5}
    >
      <primitive object={scene} scale={1} />
    </RigidBody>
  );
}

export default function Home() {
  return (
    <div className="w-full h-full bg-black">
      <KeyboardControls map={keyboardMap}>
        <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
          {/* ライトの設定 */}
          <Environment preset="city" />
          <ambientLight intensity={0.5} />

          <Physics debug={false}>
            {/* モデルの設定 */}
            <Suspense fallback={null}>
              <CoColiliaModel />
            </Suspense>

            {/* ゴーリリア */}
            <Gorillia />
          </Physics>

          {/* コントロールの設定 */}
          <OrbitControls />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}

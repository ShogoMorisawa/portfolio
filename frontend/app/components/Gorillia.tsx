import { RigidBody } from "@react-three/rapier";

export default function Gorillia() {
  return (
    <RigidBody type="fixed" colliders="trimesh" friction={1} restitution={0}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshStandardMaterial color="#EFE0B9" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 12]}>
        <sphereGeometry args={[7, 64, 64]} />
        <meshStandardMaterial color="#EFE0B9" roughness={0.8} />
      </mesh>
    </RigidBody>
  );
}

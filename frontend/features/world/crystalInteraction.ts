import * as THREE from "three";

type SyncCrystalInteractionParams = {
  id: string;
  message: string;
  currentPosition: THREE.Vector3;
  playerPosition: THREE.Vector3;
  activeCrystalId: string | null;
  isDialogueOpen: boolean;
  setActiveCrystal: (payload: { id: string; message: string } | null) => void;
  setNearbyState: (target: "crystal", isNearby: boolean) => void;
  setTargetPosition: (pos: [number, number, number] | null) => void;
};

type CrystalInteractionResult = {
  isMyTurn: boolean;
  isNearby: boolean;
};

export function syncCrystalInteraction({
  id,
  message,
  currentPosition,
  playerPosition,
  activeCrystalId,
  isDialogueOpen,
  setActiveCrystal,
  setNearbyState,
  setTargetPosition,
}: SyncCrystalInteractionParams): CrystalInteractionResult {
  const threshold = activeCrystalId === id ? 7 : 5;
  const isNearby = currentPosition.distanceTo(playerPosition) < threshold;

  if (isNearby && activeCrystalId === null && !isDialogueOpen) {
    setActiveCrystal({ id, message });
  } else if (!isNearby && activeCrystalId === id && !isDialogueOpen) {
    setActiveCrystal(null);
  }

  if (activeCrystalId === id) {
    setTargetPosition([currentPosition.x, currentPosition.y, currentPosition.z]);
  }

  setNearbyState("crystal", activeCrystalId === id && isNearby && !isDialogueOpen);

  return {
    isMyTurn: activeCrystalId === id || (activeCrystalId === null && isNearby),
    isNearby,
  };
}

export function getCrystalLookTarget(
  playerPosition: THREE.Vector3,
  currentY: number,
): THREE.Vector3 {
  const lookTarget = playerPosition.clone();
  lookTarget.y = currentY;
  return lookTarget;
}

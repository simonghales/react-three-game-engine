import React, { useCallback } from 'react';
import { useFrame } from 'react-three-fiber';
import { useGetPhysicsStepTimeRemainingRatio } from '../shared/PhysicsSync';
import { useLerpMeshes } from '../shared/MeshSubscriptions';

const R3FPhysicsObjectUpdater: React.FC = ({ children }) => {
  const getPhysicsStepTimeRemainingRatio = useGetPhysicsStepTimeRemainingRatio();
  const lerpMeshes = useLerpMeshes();

  const onFrame = useCallback((state: any, delta: number) => {
    lerpMeshes(getPhysicsStepTimeRemainingRatio);
  }, [getPhysicsStepTimeRemainingRatio, lerpMeshes]);

  useFrame(onFrame);

  return <>{children}</>;
};

export default R3FPhysicsObjectUpdater;

import { Buffers } from './shared/types';

export const generateBuffers = (maxNumberOfPhysicsObjects: number): Buffers => {
  return {
    positions: new Float32Array(maxNumberOfPhysicsObjects * 2),
    angles: new Float32Array(maxNumberOfPhysicsObjects),
  };
};

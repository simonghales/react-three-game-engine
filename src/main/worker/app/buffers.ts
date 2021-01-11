import { useEffect, useState } from 'react';
import { Buffers } from '../shared/types';

export const useBuffers = (maxNumberOfDynamicObjects: number): Buffers => {
  const [buffers] = useState(() => ({
    positions: new Float32Array(maxNumberOfDynamicObjects * 2),
    angles: new Float32Array(maxNumberOfDynamicObjects),
  }));

  useEffect(() => {
    buffers.positions = new Float32Array(maxNumberOfDynamicObjects * 2);
    buffers.angles = new Float32Array(maxNumberOfDynamicObjects);
  }, [maxNumberOfDynamicObjects]);

  return buffers;
};

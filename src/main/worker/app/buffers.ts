import { useEffect, useState } from 'react';
import { Buffers } from '../shared/types';
import { useDidMount } from '../../../utils/hooks';

export const generateBuffers = (maxNumberOfDynamicObjects: number): Buffers => {
  return {
    positions: new Float32Array(maxNumberOfDynamicObjects * 2),
    angles: new Float32Array(maxNumberOfDynamicObjects),
  };
};

export const useBuffers = (maxNumberOfDynamicObjects: number): Buffers => {
  const [buffers] = useState(() => generateBuffers(maxNumberOfDynamicObjects));

  const didMount = useDidMount();

  useEffect(() => {
    if (didMount()) {
      const { positions, angles } = generateBuffers(maxNumberOfDynamicObjects);
      buffers.positions = positions;
      buffers.angles = angles;
    }
  }, [maxNumberOfDynamicObjects]);

  return buffers;
};

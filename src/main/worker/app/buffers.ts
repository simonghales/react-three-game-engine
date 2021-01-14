import {useEffect, useRef, useState} from 'react';
import { Buffers } from '../shared/types';
import { useDidMount } from '../../../utils/hooks';

export const generateBuffers = (maxNumberOfDynamicObjects: number): Buffers => {
  return {
    positions: new Float32Array(maxNumberOfDynamicObjects * 2),
    angles: new Float32Array(maxNumberOfDynamicObjects),
  };
};

export const useBuffers = (maxNumberOfDynamicObjects: number, debug: string): Buffers => {
  const isMountRef = useRef(true)
  const [buffers] = useState(() => generateBuffers(maxNumberOfDynamicObjects));

  useEffect(() => {
    if (isMountRef.current) {
      isMountRef.current = false
      return
    }
    const { positions, angles } = generateBuffers(maxNumberOfDynamicObjects);
    buffers.positions = positions;
    buffers.angles = angles;
  }, [maxNumberOfDynamicObjects]);

  return buffers;
};

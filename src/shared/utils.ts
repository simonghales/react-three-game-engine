import { Buffers } from '../main/worker/shared/types';
import { Object3D } from 'three';

export const getPositionAndAngle = (
  buffers: Buffers,
  index: number
): {
  position: [number, number];
  angle: number;
} | null => {
  if (index !== undefined && buffers.positions.length) {
    const start = index * 2;
    const position = (buffers.positions.slice(start, start + 2) as unknown) as [
      number,
      number
    ];
    return {
      position,
      angle: buffers.angles[index],
    };
  } else {
    return null;
  }
};
export const applyPositionAngle = (
  buffers: Buffers,
  object: Object3D | null,
  index: number,
  applyAngle: boolean = false
) => {
  if (index !== undefined && buffers.positions.length && !!object) {
    const start = index * 2;
    const position = buffers.positions.slice(start, start + 2);
    object.position.x = position[0];
    object.position.y = position[1];
    if (applyAngle) {
      object.rotation.z = buffers.angles[index];
    }
  } else {
    // console.warn('no match?')
  }
};

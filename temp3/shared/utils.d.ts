import { Buffers } from '../main/worker/shared/types';
import { Object3D } from 'three';
export declare const getPositionAndAngle: (buffers: Buffers, index: number) => {
    position: [number, number];
    angle: number;
} | null;
export declare const applyPositionAngle: (buffers: Buffers, object: Object3D | null, index: number, applyAngle?: boolean) => void;

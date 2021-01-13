import React from 'react';
import { Object3D } from 'three';
import { ValidUUID } from '../main/worker/shared/types';
export declare type ContextState = {
    lerpMeshes: (getPhysicsStepTimeRemainingRatio: (time: number) => number) => void;
    updateMeshes: (positions: Float32Array, angles: Float32Array, immediate: boolean) => void;
    addSubscription: (uuid: ValidUUID, object: Object3D, applyAngle: boolean) => () => void;
};
export declare const Context: React.Context<ContextState>;
export declare const useLerpMeshes: () => (getPhysicsStepTimeRemainingRatio: (time: number) => number) => void;
export declare const useAddMeshSubscription: () => (uuid: ValidUUID, object: Object3D, applyAngle: boolean) => () => void;
export declare const useSubscribeMesh: (uuid: ValidUUID, object: Object3D, applyAngle?: boolean, isDynamic?: boolean) => void;
export declare const useUpdateMeshes: () => (positions: Float32Array, angles: Float32Array, immediate: boolean) => void;
declare const MeshSubscriptions: React.FC;
export default MeshSubscriptions;

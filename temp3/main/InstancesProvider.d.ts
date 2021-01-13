import React from "react";
declare type InstanceData = {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
};
declare type UpdateInstanceFn = (data: InstanceData) => void;
declare type AddInstanceFn = (data: InstanceData) => [UpdateInstanceFn, () => void];
export declare const useCreateInstancedMesh: () => (meshKey: string, addInstance: AddInstanceFn) => () => void;
export declare const useAddInstance: (meshKey: string) => AddInstanceFn;
export declare const useInstancedMesh: (meshKey: string, data: InstanceData) => (data: InstanceData) => void;
export declare const Instance: React.FC<{
    meshKey: string;
} & InstanceData>;
export declare const InstancedMesh: React.FC<{
    meshKey: string;
    maxInstances: number;
    gltfPath: string;
}>;
export declare const InstancesProvider: React.FC;
export {};

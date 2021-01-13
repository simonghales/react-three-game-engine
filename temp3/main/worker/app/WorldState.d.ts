import React, { MutableRefObject } from 'react';
import { ValidUUID } from '../shared/types';
import { Body } from 'planck-js';
declare type BodiesMap = Map<ValidUUID, Body>;
declare type DynamicBodies = Set<ValidUUID>;
declare type CollisionListeners = Set<ValidUUID>;
declare type ContextState = {
    bodies: BodiesMap;
    dynamicBodies: DynamicBodies;
    collisionListeners: CollisionListeners;
    bodiesNeedSync: boolean;
    setBodiesNeedSync: (bool: boolean) => void;
    bodiesNeedSyncRef: MutableRefObject<boolean>;
    logicBodiesNeedSyncRef: MutableRefObject<boolean>;
};
export declare const useWorldState: () => ContextState;
export declare const WorldState: React.FC;
export {};

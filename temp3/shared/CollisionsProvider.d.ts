import React from 'react';
import { ValidUUID } from '../main/worker/shared/types';
import { CollisionEventProps } from '../main/worker/planckjs/data';
declare type CollisionsProviderContextState = {
    addCollisionHandler: (started: boolean, uuid: ValidUUID, callback: (data: any, fixtureIndex: number, isSensor: boolean) => void) => void;
    removeCollisionHandler: (started: boolean, uuid: ValidUUID) => void;
    handleBeginCollision: (data: CollisionEventProps) => void;
    handleEndCollision: (data: CollisionEventProps) => void;
};
export declare const useCollisionsProviderContext: () => CollisionsProviderContextState;
declare const CollisionsProvider: React.FC;
export default CollisionsProvider;

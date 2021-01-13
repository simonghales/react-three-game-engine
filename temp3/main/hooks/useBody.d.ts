import { AddBodyDef, UpdateBodyData } from '../worker/planckjs/bodies';
import { MutableRefObject } from 'react';
import { Object3D } from 'three';
import { ValidUUID } from '../worker/shared/types';
import { Vec2 } from 'planck-js';
export declare type BodyApi = {
    applyForceToCenter: (vec: Vec2, uuid?: ValidUUID) => void;
    applyLinearImpulse: (vec: Vec2, pos: Vec2, uuid?: ValidUUID) => void;
    setPosition: (vec: Vec2, uuid?: ValidUUID) => void;
    setLinearVelocity: (vec: Vec2, uuid?: ValidUUID) => void;
    setAngle: (angle: number, uuid?: ValidUUID) => void;
    updateBody: (data: UpdateBodyData, uuid?: ValidUUID) => void;
};
export declare const useBodyApi: (passedUuid: ValidUUID) => BodyApi;
export declare type BodyParams = {
    listenForCollisions?: boolean;
    applyAngle?: boolean;
    cacheKey?: string;
    uuid?: ValidUUID;
    fwdRef?: MutableRefObject<Object3D>;
};
export declare const useBody: (propsFn: () => AddBodyDef, bodyParams?: BodyParams) => [MutableRefObject<Object3D>, BodyApi, ValidUUID];

import { WorldDef } from 'planck-js';
export declare enum WorkerMessageType {
    INIT = 0,
    STEP = 1,
    LOGIC_FRAME = 2,
    ADD_BODY = 3,
    REMOVE_BODY = 4,
    SET_BODY = 5,
    UPDATE_BODY = 6,
    PHYSICS_STEP_PROCESSED = 7
}
export declare enum WorkerOwnerMessageType {
    FRAME = 0,
    PHYSICS_STEP = 1,
    SYNC_BODIES = 2,
    BEGIN_COLLISION = 3,
    END_COLLISION = 4,
    MESSAGE = 5,
    INITIATED = 6
}
export declare type Buffers = {
    positions: Float32Array;
    angles: Float32Array;
};
export declare type ValidUUID = string | number;
export declare type PhysicsProps = {
    config?: {
        maxNumberOfDynamicObjects?: number;
        updateRate?: number;
    };
    worldParams?: WorldDef;
};

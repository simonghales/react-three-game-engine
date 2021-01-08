export enum WorkerMessageType {
    INIT,
    STEP,
    LOGIC_FRAME,
    ADD_BODY,
    REMOVE_BODY,
    SET_BODY,
    UPDATE_BODY,
    PHYSICS_STEP_PROCESSED,
}

export enum WorkerOwnerMessageType {
    FRAME,
    PHYSICS_STEP,
    SYNC_BODIES,
    BEGIN_COLLISION,
    END_COLLISION,
    MESSAGE,
}

export type Buffers = {
    positions: Float32Array,
    angles: Float32Array,
}

export type ValidUUID = string | null
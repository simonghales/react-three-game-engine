
export enum AvailableFeatures {
    PHYSICS = 'PHYSICS',
    CONSUME_PHYSICS = 'CONSUME_PHYSICS',
}

export type AvailableFeaturesData = {
    [key: string]: AvailableFeatures,
}

export enum WorkerMessageTypes {
    REQUEST_AVAILABLE_FEATURES = 'REQUEST_AVAILABLE_FEATURES',
    AVAILABLE_FEATURES = 'AVAILABLE_FEATURES',
    READY_FOR_PHYSICS = 'READY_FOR_PHYSICS',
    PHYSICS_UPDATE = 'PHYSICS_UPDATE',
    PHYSICS_PROCESSED = 'PHYSICS_PROCESSED',
    PHYSICS_CONFIRMED = 'PHYSICS_CONFIRMED',
    PHYSICS_BODY_METHOD = 'PHYSICS_BODY_METHOD',
}

export type WorkerMessageData = {
    type: WorkerMessageTypes,
    data?: any,
    [key: string]: any,
}
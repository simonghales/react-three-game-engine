import { WorldDef } from 'planck-js';

export enum WorkerMessageType {
  INIT,
  STEP,
  LOGIC_FRAME,
  ADD_BODY,
  REMOVE_BODY,
  SET_BODY,
  UPDATE_BODY,
  PHYSICS_STEP_PROCESSED,
  READY_FOR_PHYSICS,
}

export enum WorkerOwnerMessageType {
  FRAME,
  PHYSICS_STEP,
  SYNC_BODIES,
  BEGIN_COLLISION,
  END_COLLISION,
  MESSAGE,
  INITIATED,
}

export type Buffers = {
  positions: Float32Array;
  angles: Float32Array;
};

export type ValidUUID = string | number;

export type PhysicsProps = {
  config?: {
    maxNumberOfDynamicObjects?: number;
    updateRate?: number;
  };
  worldParams?: WorldDef;
};

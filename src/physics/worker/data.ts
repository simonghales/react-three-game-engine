import {Buffers} from "./shared/types";
import {generateBuffers} from "./utils";

export const storedData: {
    physicsTick: number,
    unsyncedBodies: boolean,
    unsyncedLogicBodies: boolean,
    maxNumberOfPhysicsObjects: number,
    buffers: Buffers,
    logicBuffers: Buffers,
    mainWorker: null | Worker,
    logicWorker: null | MessagePort
} = {
    physicsTick: 0,
    unsyncedBodies: false,
    unsyncedLogicBodies: false,
    maxNumberOfPhysicsObjects: 0,
    buffers: generateBuffers(0),
    logicBuffers: generateBuffers(0),
    mainWorker: null,
    logicWorker: null,
}
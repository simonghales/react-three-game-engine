import {syncData} from "./planckjs/world";
import {dynamicBodiesUuids} from "./planckjs/shared";
import {storedData} from "./data";
import {Buffers, WorkerOwnerMessageType} from "./shared/types";

export const setBodiesSynced = () => {
    storedData.unsyncedBodies = false
}

export const setLogicBodiesSynced = () => {
    storedData.unsyncedLogicBodies = false
}

export const syncBodies = () => {
    storedData.unsyncedBodies = true
    storedData.unsyncedLogicBodies = true
}

const sendPhysicsUpdate = (target: Worker | MessagePort, buffer: Buffers, handleBodies: (message: any) => any) => {
    const {positions, angles} = buffer
    if (!(positions.byteLength !== 0 && angles.byteLength !== 0)) {
        return
    }
    syncData(positions, angles)
    const rawMessage: any = {
        type: WorkerOwnerMessageType.PHYSICS_STEP,
        physicsTick: storedData.physicsTick,
    }
    handleBodies(rawMessage)
    const message = {
        ...rawMessage,
        positions,
        angles,
    }
    target.postMessage(message, [positions.buffer, angles.buffer])
}

const sendPhysicsUpdateToLogic = () => {
    if (!storedData.logicWorker) return
    sendPhysicsUpdate(storedData.logicWorker, storedData.logicBuffers, (message: any) => {
        if (storedData.unsyncedLogicBodies) {
            message['bodies'] = dynamicBodiesUuids
            setLogicBodiesSynced()
        }
    })
}

const sendPhysicsUpdateToMain = () => {
    if (!storedData.mainWorker) return
    sendPhysicsUpdate(storedData.mainWorker, storedData.buffers, (message: any) => {
        if (storedData.unsyncedBodies) {
            message['bodies'] = dynamicBodiesUuids
            setBodiesSynced()
        }
    })
}

export const stepProcessed = (isMain: boolean, lastProcessedPhysicsTick: number, positions: Float32Array, angles: Float32Array) => {
    const buffer = isMain ? storedData.buffers : storedData.logicBuffers
    buffer.positions = positions
    buffer.angles = angles
    if (lastProcessedPhysicsTick < storedData.physicsTick) {
        if (isMain) {
            sendPhysicsUpdateToMain()
        } else {
            sendPhysicsUpdateToLogic()
        }
    }
}
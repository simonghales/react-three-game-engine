import {storedData} from "./data";
import {stepWorld, syncData} from "./planckjs/world";
import {PHYSICS_UPDATE_RATE} from "./planckjs/config";
import {generateBuffers} from "./utils";
import {Buffers, WorkerOwnerMessageType} from "./shared/types";
import {dynamicBodiesUuids} from "./planckjs/shared";
import {setBodiesSynced, setLogicBodiesSynced} from "./shared";

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

const beginPhysicsLoop = () => {

    setInterval(() => {
        storedData.physicsTick += 1
        stepWorld()
        sendPhysicsUpdateToMain()
        sendPhysicsUpdateToLogic()
    }, PHYSICS_UPDATE_RATE)

}

export const init = ({maxNumberOfPhysicsObjects = 100}: {maxNumberOfPhysicsObjects?: number}) => {
    storedData.maxNumberOfPhysicsObjects = maxNumberOfPhysicsObjects
    storedData.buffers = generateBuffers(maxNumberOfPhysicsObjects)
    if (storedData.logicWorker) {
        storedData.logicBuffers = generateBuffers(maxNumberOfPhysicsObjects)
    }
    beginPhysicsLoop()
}
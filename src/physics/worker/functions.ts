import {storedData} from "./data";
import {WorkerOwnerMessageType} from "./shared/types";

export const sendCollisionBeginEvent = (uuid: string, data: any, fixtureIndex: number, isSensor: boolean) => {

    const update = {
        type: WorkerOwnerMessageType.BEGIN_COLLISION,
        props: {
            uuid,
            data,
            fixtureIndex,
            isSensor,
        }
    }
    if (storedData.mainWorker) {
        storedData.mainWorker.postMessage(update)
    }
    if (storedData.logicWorker) {
        storedData.logicWorker.postMessage(update)
    }

}

export const sendCollisionEndEvent = (uuid: string, data: any, fixtureIndex: number, isSensor: boolean) => {

    const update = {
        type: WorkerOwnerMessageType.END_COLLISION,
        props: {
            uuid,
            data,
            fixtureIndex,
            isSensor,
        }
    }
    if (storedData.mainWorker) {
        storedData.mainWorker.postMessage(update)
    }
    if (storedData.logicWorker) {
        storedData.logicWorker.postMessage(update)
    }

}
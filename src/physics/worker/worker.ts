import {WorkerMessageType} from "./shared/types";
import {handleLogicWorkerMessage} from "./logicWorker";
import {init} from "./methods";
import {storedData} from "./data";
import {stepProcessed} from "./shared";
import {addBody, removeBody, setBody, updateBody} from "./planckjs/bodies";

const selfWorker = self as unknown as Worker

storedData.mainWorker = selfWorker

selfWorker.onmessage = (event: MessageEvent) => {

    if (event.data.command) {
        handleLogicWorkerMessage(event)
        return
    }

    const {type, props = {}} = event.data as {
        type: WorkerMessageType,
        props: any,
    };
    switch (type) {
        case WorkerMessageType.PHYSICS_STEP_PROCESSED:
            stepProcessed(true, event.data.physicsTick, event.data.positions, event.data.angles)
            break;
        case WorkerMessageType.INIT:
            init(props)
            break;
        case WorkerMessageType.ADD_BODY:
            addBody(props)
            break;
        case WorkerMessageType.REMOVE_BODY:
            removeBody(props)
            break;
        case WorkerMessageType.SET_BODY:
            setBody(props)
            break;
        case WorkerMessageType.UPDATE_BODY:
            updateBody(props)
            break;
    }

}
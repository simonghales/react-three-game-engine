import {createElement, FC} from "react";
import {PhysicsProps, WorkerMessageType} from "./shared/types";
import {render} from "react-nil";
import {PHYSICS_UPDATE_RATE} from "./planckjs/config";

export const physicsWorkerHandler = (selfWorker: Worker) => {

    selfWorker.onmessage = (event: MessageEvent) => {
        const { type, props = {} } = event.data as {
            type: WorkerMessageType;
            props: any;
        };
        switch (type) {
            case WorkerMessageType.INIT:
                const { worldParams = {}, config = {} } = props as PhysicsProps;
                const {
                    maxNumberOfDynamicObjects = 100,
                    updateRate = PHYSICS_UPDATE_RATE,
                } = config;
                render(
                    createElement(
                        require('./worker/app/index').App,
                        {
                            worker: selfWorker,
                            config: {
                                maxNumberOfDynamicObjects,
                                updateRate,
                            },
                            worldParams,
                        },
                        null
                    )
                );
                break;
        }
    };
};
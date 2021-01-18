import {createElement, FC} from "react";
import {PhysicsProps, WorkerMessageType} from "./shared/types";
import {render} from "react-nil";

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
                    updateRate = 1000 / 30,
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
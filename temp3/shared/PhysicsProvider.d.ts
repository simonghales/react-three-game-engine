import React from 'react';
import { AddBodyProps, RemoveBodyProps, SetBodyProps, UpdateBodyProps } from '../main/worker/planckjs/bodies';
export declare type ContextState = {
    workerAddBody: (props: AddBodyProps) => void;
    workerRemoveBody: (props: RemoveBodyProps) => void;
    workerSetBody: (props: SetBodyProps) => void;
    workerUpdateBody: (props: UpdateBodyProps) => void;
};
export declare const Context: React.Context<ContextState>;
export declare const usePhysicsProvider: () => ContextState;
declare const PhysicsProvider: React.FC<{
    worker: Worker | MessagePort;
}>;
export default PhysicsProvider;

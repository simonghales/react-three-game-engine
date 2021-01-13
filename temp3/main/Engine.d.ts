import { FC } from 'react';
import { MappedComponents } from '../shared/types';
import { PhysicsProps } from "./worker/shared/types";
export declare const Engine: FC<PhysicsProps & {
    logicWorker?: Worker;
    logicMappedComponents?: MappedComponents;
}>;

import React from 'react';
import { WorldDef } from 'planck-js';
export declare const App: React.FC<{
    config: {
        maxNumberOfDynamicObjects: number;
        updateRate: number;
    };
    worldParams: WorldDef;
    worker: Worker;
}>;

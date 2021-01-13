import { FC } from 'react';
export declare const useGetPhysicsStepTimeRemainingRatio: () => (time: number) => number;
export declare const useFixedUpdate: (callback: (delta: number) => void) => void;
declare const PhysicsSync: FC<{
    worker: Worker | MessagePort;
    noLerping?: boolean;
}>;
export default PhysicsSync;

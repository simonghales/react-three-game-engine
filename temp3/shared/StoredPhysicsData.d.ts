import { FC } from 'react';
declare type Bodies = {
    [uuid: string]: number;
};
export declare const useStoredData: () => {
    bodies: Bodies;
};
declare const StoredPhysicsData: FC;
export default StoredPhysicsData;

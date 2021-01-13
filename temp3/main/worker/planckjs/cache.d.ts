import { Body } from 'planck-js';
export declare const cachedBodies: {
    [key: string]: Body[];
};
export declare const getCachedBody: (key: string) => Body | null;
export declare const addCachedBody: (key: string, body: Body) => void;

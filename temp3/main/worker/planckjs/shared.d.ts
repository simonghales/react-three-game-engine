import { World } from "planck-js/lib";
import type { Body } from "planck-js/lib";
import { ValidUUID } from "../shared/types";
export declare const planckWorld: World;
export declare const dynamicBodiesUuids: ValidUUID[];
export declare const existingBodies: Map<ValidUUID, Body>;

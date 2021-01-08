
import {Vec2, World} from "planck-js/lib";
import type {Body} from "planck-js/lib"
import {ValidUUID} from "../shared/types";

export const planckWorld = World({
    allowSleep: true,
    gravity: Vec2(0, 0),
})

export const dynamicBodiesUuids: ValidUUID[] = []

export const existingBodies = new Map<ValidUUID, Body>()
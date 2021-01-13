import type { BodyDef, FixtureOpt, Body } from "planck-js";
import { ValidUUID } from "../shared/types";
export declare enum BodyType {
    static = "static",
    kinematic = "kinematic",
    dynamic = "dynamic"
}
export declare enum BodyShape {
    box = "box",
    circle = "circle"
}
export declare type FixtureBase = {
    shape: BodyShape;
    fixtureOptions?: Partial<FixtureOpt>;
};
export declare type BoxFixture = FixtureBase & {
    hx: number;
    hy: number;
    center?: [number, number];
};
export declare const createBoxFixture: ({ width, height, center, fixtureOptions }: {
    width?: number | undefined;
    height?: number | undefined;
    center?: [number, number] | undefined;
    fixtureOptions?: Partial<FixtureOpt> | undefined;
}) => BoxFixture;
export declare type CircleFixture = FixtureBase & {
    radius: number;
};
export declare const createCircleFixture: ({ radius, fixtureOptions }: {
    radius?: number | undefined;
    fixtureOptions?: Partial<FixtureOpt> | undefined;
}) => CircleFixture;
declare type Fixture = BoxFixture | CircleFixture;
declare type BasicBodyProps = Partial<BodyDef> & {
    fixtures?: Fixture[];
};
declare type AddBoxBodyProps = BasicBodyProps & {};
declare type AddCircleBodyProps = BasicBodyProps & {};
export declare type AddBodyDef = BasicBodyProps | AddBoxBodyProps | AddCircleBodyProps;
export declare type AddBodyProps = AddBodyDef & {
    uuid: ValidUUID;
    listenForCollisions: boolean;
    cacheKey?: string;
    attachToRope?: boolean;
};
export declare const addBody: ({ uuid, cacheKey, listenForCollisions, fixtures, attachToRope, ...props }: AddBodyProps) => Body;
export declare type RemoveBodyProps = {
    uuid: ValidUUID;
    cacheKey?: string;
};
export declare const removeBody: ({ uuid, cacheKey }: RemoveBodyProps) => void;
export declare type SetBodyProps = {
    uuid: ValidUUID;
    method: string;
    methodParams: any[];
};
export declare const setBody: ({ uuid, method, methodParams }: SetBodyProps) => void;
export declare type UpdateBodyData = {
    fixtureUpdate?: {
        groupIndex?: number;
        categoryBits?: number;
        maskBits?: number;
    };
};
export declare type UpdateBodyProps = {
    uuid: ValidUUID;
    data: UpdateBodyData;
};
export declare const updateBody: ({ uuid, data }: UpdateBodyProps) => void;
export {};

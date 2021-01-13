import React, { MutableRefObject, ReactElement } from "react";
import { ValidUUID } from "./worker/shared/types";
import { Object3D } from "three";
import { BodyApi, BodyParams } from "./hooks/useBody";
import { AddBodyDef } from "./worker/planckjs/bodies";
export declare const BodySync: React.FC<{
    children: ({ uuid, ref, api }: {
        uuid: ValidUUID;
        ref: MutableRefObject<Object3D>;
        api?: BodyApi;
    }) => ReactElement;
    uuid: ValidUUID;
    applyAngle?: boolean;
    isDynamic?: boolean;
    bodyRef?: MutableRefObject<Object3D>;
    wrapWithGroup?: boolean;
}>;
export declare const Body: React.FC<{
    children: ({ uuid, ref, api }: {
        uuid: ValidUUID;
        ref: MutableRefObject<Object3D>;
        api: BodyApi;
    }) => ReactElement;
    bodyDef: AddBodyDef;
    params?: BodyParams;
    wrapWithGroup?: boolean;
}>;

import React from "react";
import { Object3D } from "three";
export declare const useStoreMesh: (uuid: string, mesh: Object3D) => void;
export declare const useStoredMesh: (uuid: string) => Object3D | null;
declare const MeshRefs: React.FC;
export default MeshRefs;

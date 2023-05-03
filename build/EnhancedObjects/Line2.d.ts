import { Vector3 } from "three";
import { Line2 as Line2Base } from "three/examples/jsm/lines/Line2";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
export declare class Line2 extends Line2Base {
    constructor(material?: LineMaterial);
    updateGeoPoints(positions: Vector3[], ...indexes: number[]): void;
    protected setGeoPoints(positions: Vector3[]): void;
    protected createAttributes(positions: Vector3[]): boolean;
    protected fillPositionsArray(positions: Vector3[], target?: Float32Array): Float32Array;
}

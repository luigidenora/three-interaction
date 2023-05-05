import { Vector2, Vector3 } from "three";
import { Line2 as Line2Base } from "three/examples/jsm/lines/Line2";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
export declare class Line2 extends Line2Base {
    constructor(material?: LineMaterial);
    updatePoints(positions: Vector3[], ...indexes: number[]): void;
    protected setPoints(positions: Vector3[] | Vector2[]): void;
    protected createAttributes(positions: Vector3[] | Vector2[]): boolean;
    protected fillFloat32Array(positions: Vector3[] | Vector2[], target?: Float32Array): Float32Array;
    protected update(): void;
}

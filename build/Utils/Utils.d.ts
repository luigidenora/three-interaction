import { Object3D, Scene, Vector3 } from "three";
export declare class Utils {
    static eps: number;
    static areVector3Equals(v1: Vector3, v2: Vector3, eps?: number): boolean;
    static getSceneFromObj(obj: Object3D): Scene;
}

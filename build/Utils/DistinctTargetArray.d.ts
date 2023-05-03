import { Object3D } from "three";
export declare class DistinctTargetArray<T extends Object3D = Object3D> {
    private _set;
    data: T[];
    push(target: T): void;
    has(target: T): boolean;
    clear(): void;
}

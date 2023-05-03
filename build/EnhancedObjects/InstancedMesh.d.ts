import { BufferGeometry, Color, InstancedMesh as InstancedMeshBase, Material } from "three";
import { InstancedMeshSingle } from "./InstancedMeshSingle";
export declare class InstancedMesh extends InstancedMeshBase {
    activeId: number;
    hoveredId: number;
    instances: InstancedMeshSingle[];
    constructor(geometry: BufferGeometry, material: Material, count: number, singleInstanceType: typeof InstancedMeshSingle, color?: Color | number);
}

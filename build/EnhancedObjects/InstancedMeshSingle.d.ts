import { Color, EventDispatcher, Object3D, Quaternion, Vector3 } from "three";
import { Events } from "../Events/Events";
import { InstancedMesh } from "./InstancedMesh";
export declare class InstancedMeshSingle extends EventDispatcher {
    parent: InstancedMesh;
    instanceId: number;
    id: number;
    position: Vector3;
    scale: Vector3;
    quaternion: Quaternion;
    activable: boolean;
    active: boolean;
    activeUntilParent: boolean;
    hovered: boolean;
    enabled: boolean;
    enabledUntilParent: boolean;
    visibleUntilParent: boolean;
    get activableObj(): Object3D;
    constructor(parent: InstancedMesh, index: number, color?: Color);
    setColor(color: Color | number): void;
    getColor(color?: Color): Color;
    updateMatrix(): void;
    bindEvent<K extends keyof Events>(types: K | K[], listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void;
}

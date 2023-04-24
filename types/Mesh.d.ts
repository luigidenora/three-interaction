import { Mesh as MeshBase } from "three/index";
import { InteractionPrototype } from "../src/Patch/Object3D";
import { BindingPrototype, DetectChangesMode } from "three-binding/dist/Binding";
import { Object3D } from "three";
import { Events } from "../src/Events";

export class Mesh extends MeshBase implements InteractionPrototype, BindingPrototype {
    detectChangesMode: DetectChangesMode;
    detectChanges(): void;
    bindProperty<T extends keyof this>(property: T, getCallback: () => this[T], bindAfterParentAdded?: boolean): this;
    bindCallback(key: string, callback: () => void, bindAfterParentAdded?: boolean): this;
    unbindByKey(key: string): this;
    activable: boolean;
    get activableObj(): Object3D;
    active: boolean;
    activeUntilParent: boolean;
    hovered: boolean;
    enabled: boolean;
    enabledUntilParent: boolean;
    visibleUntilParent: boolean;
    interceptByRaycaster: boolean;
    objectsToRaycast: Object3D[];
    bindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void;
    triggerEventAncestor<K extends keyof Events>(type: K, args: Events[K]): void;
    override parent: Object3D;
    override children: Object3D[];
    
}

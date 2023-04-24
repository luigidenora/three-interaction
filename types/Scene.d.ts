import { Scene as SceneBase } from "three/index";
import { Object3D } from "three";
import { InteractionPrototype } from "../src/Patch";
import { Events } from "../src/Events";
import { BindingPrototype, DetectChangesMode } from "../node_modules/three-binding/dist/Binding";

export class Scene extends SceneBase implements InteractionPrototype, BindingPrototype {
    detectChangesMode: DetectChangesMode;
    detectChanges(): void;
    bindProperty<T extends keyof this>(property: T, getCallback: () => this[T], bindAfterParentAdded?: boolean): this;
    bindCallback(key: string, callback: () => void, bindAfterParentAdded?: boolean): this;
    unbindByKey(key: string): this;
    override parent: Object3D;
    override children: Object3D[];
    activable: boolean;
    activableObj: Object3D;
    active: boolean;
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
}

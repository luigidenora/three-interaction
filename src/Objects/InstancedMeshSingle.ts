import { Color, EventDispatcher, Object3D, Quaternion, Vector3 } from "three";
import { Events } from "../Events/Events";
import { InstancedMesh } from "./InstancedMesh";
import { EventsDispatcher } from "../Events/EventsDispatcher";

let id = 1;

export class InstancedMeshSingle extends EventDispatcher {
    public parent: InstancedMesh;
    public instanceId: number;
    public id: number;
    public position = new Vector3();
    public scale = new Vector3(1, 1, 1);
    public quaternion = new Quaternion();
    public activable = false;
    public active = false;
    public activeUntilParent = false;
    public hovered = false;
    public enabled = true; // TODO
    public enabledUntilParent: boolean; // TODO
    public visibleUntilParent: boolean; // TODO
    /** @internal */
    public __eventsDispatcher: EventsDispatcher;

    public get activableObj(): Object3D {
        return this.activable ? this as unknown as Object3D : this.parent.activableObj;
    }
    
    constructor(parent: InstancedMesh, index: number, color?: Color) {
        super();
        this.id = id++;
        this.parent = parent;
        this.instanceId = index;
        this.__eventsDispatcher = new EventsDispatcher(this);

        if (color) {
            this.setColor(color);
        }
    }

    public setColor(color: Color | number): void {
        if (typeof(color) === "number") {
            this.parent.setColorAt(this.instanceId, this.parent._tempColor.setHex(color));
        } else {
            this.parent.setColorAt(this.instanceId, color);
        }
        this.parent.instanceColor.needsUpdate = true;
    }

    public getColor(color = this.parent._tempColor): Color {
        this.parent.getColorAt(this.instanceId, color);
        return color;
    }

    public updateMatrix(): void {
        const matrix = this.parent._tempMatrix;
        matrix.compose(this.position, this.quaternion, this.scale);
        this.parent.setMatrixAt(this.instanceId, matrix);
        this.parent.instanceMatrix.needsUpdate = true;
    }

    public bindEvent<K extends keyof Events>(types: K | K[], listener: (args: Events[K]) => void): (args: Events[K]) => void {
        if (typeof (types) === "string") {
            return this.__eventsDispatcher.addEventListener(types, listener);
        }
        for (const type of types) {
            this.__eventsDispatcher.addEventListener(type, listener);
        }
        return listener;
    }

    public hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean {
        return this.__eventsDispatcher.hasEventListener(type, listener);
    }

    public unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void {
        this.__eventsDispatcher.removeEventListener(type, listener);
    }

    public triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void {
        this.__eventsDispatcher.dispatchEvent(type, args);
    }
}

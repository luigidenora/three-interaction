import { Object3D, Color, ColorRepresentation, EventDispatcher, Quaternion, Vector3 } from "three";
import { Events } from "../Events/Events";
import { InstancedMesh2 } from "./InstancedMesh2";
import { EventsDispatcher } from "../Events/EventsDispatcher";

let id = 1;

export class InstancedMeshSingle extends EventDispatcher {
    public parent: InstancedMesh2;
    public instanceId: number;
    public id: number;
    public position = new Vector3();
    public scale = new Vector3(1, 1, 1);
    public quaternion = new Quaternion();
    public focusable = false;
    public focused = false;
    public hovered = false;
    public enabled = true; //TODO handle all
    /** @internal */ public __eventsDispatcher: EventsDispatcher;

    public get enabledUntilParent(): boolean {
        let obj = this as unknown as Object3D;
        do {
            if (obj.enabled !== true) return false;
        } while (obj = obj.parent);
        return true;
    }

    constructor(parent: InstancedMesh2, index: number, color?: ColorRepresentation) {
        super();
        this.id = id++;
        this.parent = parent;
        this.instanceId = index;
        this.__eventsDispatcher = new EventsDispatcher(this);

        if (color !== undefined) {
            this.setColor(color);
        }
    }

    public setColor(color: ColorRepresentation): void {
        const parent = this.parent;
        parent.setColorAt(this.instanceId, parent._tempColor.set(color));
        parent.instanceColor.needsUpdate = true;
    }

    public getColor(color = this.parent._tempColor): Color {
        this.parent.getColorAt(this.instanceId, color);
        return color;
    }

    public updateMatrix(): void {
        const parent = this.parent;
        const matrix = parent._tempMatrix;
        matrix.compose(this.position, this.quaternion, this.scale);
        parent.setMatrixAt(this.instanceId, matrix);
        parent.instanceMatrix.needsUpdate = true;
    }

    public on<K extends keyof Events>(types: K | K[], listener: (event?: Events[K]) => void): (event?: Events[K]) => void {
        if (typeof (types) === "string") {
            return this.__eventsDispatcher.add(types, listener);
        }
        for (const type of types) {
            this.__eventsDispatcher.add(type, listener);
        }
        return listener;
    }

    public hasEvent<K extends keyof Events>(type: K, listener: (event?: Events[K]) => void): boolean {
        return this.__eventsDispatcher.has(type, listener);
    }

    public off<K extends keyof Events>(type: K, listener: (event?: Events[K]) => void): void {
        this.__eventsDispatcher.remove(type, listener);
    }

    public trigger<K extends keyof Events>(type: K, event?: Events[K]): void {
        this.__eventsDispatcher.dispatchManual(type, event);
    }

    public triggerAncestor<K extends keyof Events>(type: K, event?: Events[K]): void {
        this.__eventsDispatcher.dispatchAncestorManual(type, event);
    }
}

import { Color, EventDispatcher, Object3D, Quaternion, Vector3 } from "three";
import { Events } from "../Events/Events";
import { EventsDispatcher, InteractionPrototype } from "../index";
import { InstancedMesh } from "./InstancedMesh";
import { bindAutoUpdateMatrixInstancedMeshSingle } from "../Patch/AutoUpdateMatrix";

let id = 0;

export class InstancedMeshSingle extends EventDispatcher implements InteractionPrototype {
    public parent: InstancedMesh;
    public instanceId: number;
    public id: string;
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
    public _eventsDispatcher: EventsDispatcher;

    public get activableObj(): Object3D {
        return this.activable ? this as unknown as Object3D : this.parent.activableObj;
    }

    constructor(parent: InstancedMesh, index: number, color?: Color) {
        super();
        this.id = `_${id++}`;
        this.parent = parent;
        this.instanceId = index;
        this._eventsDispatcher = new EventsDispatcher(this);
        bindAutoUpdateMatrixInstancedMeshSingle(this);

        if (color) {
            this.setColor(color);
        }
    }

    public setColor(color: Color): void {
        this.parent.setColorAt(this.instanceId, color);
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
    }

    public bindEvent<K extends keyof Events>(types: K | K[], listener: (args: Events[K]) => void): (args: Events[K]) => void {
        if (typeof (types) === "string") {
            return this._eventsDispatcher.addEventListener((types as any).toLowerCase(), listener);
        }
        for (const type of types) {
            this._eventsDispatcher.addEventListener((type as any).toLowerCase(), listener);
        }
        return listener;
    }

    public hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean {
        return this._eventsDispatcher.hasEventListener((type as any).toLowerCase(), listener);
    }

    public unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void {
        this._eventsDispatcher.removeEventListener((type as any).toLowerCase(), listener);
    }

    public triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void {
        this._eventsDispatcher.dispatchDOMEvent((type as any).toLowerCase(), args);
    }

    public triggerEventAncestor<K extends keyof Events>(type: K, args: Events[K]): void {
        throw new Error("Method not implemented.");
    }
}

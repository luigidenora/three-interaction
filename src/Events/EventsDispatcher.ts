import { Object3D } from "three";
import { InteractionEvents, Events, EventExt, MiscUpdateEvents } from "./Events";
import { EventsCache } from "./MiscEventsManager";
import { applyObject3DRotationPatch, applyObject3DVector3Patch } from "../Patch/Object3D";
import { InstancedMeshSingle } from "../Objects/InstancedMeshSingle";

/** @internal */
export class EventsDispatcher {
    public listeners: { [P in keyof Events]?: ((args?: any) => void)[] } = {};

    constructor(public parent: Object3D | InstancedMeshSingle) { }

    public add<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
            if ((this.parent as Object3D).isObject3D) {
                EventsCache.push(type, this.parent as Object3D);
                if (type === "positionchange" || type === "scalechange") {
                    applyObject3DVector3Patch(this.parent as Object3D);
                } else if (type === "rotationchange") {
                    applyObject3DRotationPatch(this.parent as Object3D);
                } else if (type === "drop" || type === "dragenter" || type === "dragleave" || type === "dragover") {
                    (this.parent as Object3D).__isDropTarget = true;
                }
            }
        }
        if (this.listeners[type].indexOf(listener) === -1) {
            this.listeners[type].push(listener);
        }
        return listener;
    }

    public has<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean {
        return this.listeners[type]?.indexOf(listener) > -1;
    }

    public remove<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void {
        const index = this.listeners[type]?.indexOf(listener) ?? -1;
        if (index !== -1) {
            this.listeners[type].splice(index, 1);
            if (this.listeners[type].length === 0) {
                EventsCache.remove(type, this.parent as Object3D);
                (this.parent as Object3D).__isDropTarget = this.isDropTarget();
            }
        }
    }

    private isDropTarget(): boolean {
        return this.listeners["drop"]?.length > 0 || this.listeners["dragenter"]?.length > 0 || this.listeners["dragleave"]?.length > 0 || this.listeners["dragover"]?.length > 0;
    }

    public dispatchDOM<K extends keyof InteractionEvents>(type: K, event: InteractionEvents[K]): void {
        event._bubbles = false;
        event._stoppedImmediatePropagation = false;
        event._defaultPrevented = false;
        event._type = type;
        event._target = this.parent as Object3D;
        this.executeDOM(type, event);
    }

    public dispatchDOMAncestor<K extends keyof InteractionEvents>(type: K, event: InteractionEvents[K]): void {
        let target = this.parent as Object3D;
        event._bubbles = true;
        event._stoppedImmediatePropagation = false;
        event._defaultPrevented = false;
        event._type = type;
        event._target = target;
        while (target && event._bubbles) {
            target.__eventsDispatcher.executeDOM(type, event);
            target = target.parent;
        }
    }

    private executeDOM<K extends keyof InteractionEvents>(type: K, event: InteractionEvents[K]): void {
        if (!this.listeners[type]) return;
        const target = event.currentTarget = this.parent as Object3D;
        for (const callback of this.listeners[type]) {
            if (event._stoppedImmediatePropagation) break;
            callback.call(target, event); //TODO vedere se usare bind anzichè call
        }
    }

    public dispatch<T extends keyof MiscUpdateEvents>(type: T, args?: MiscUpdateEvents[T]): void {
        if (!this.listeners[type]) return;
        for (const callback of this.listeners[type]) {
            callback.call(this.parent, args);
        }
    }

    public dispatchManual<T extends keyof Events>(type: T, args?: Events[T]): void {
        if ((args as EventExt)?.cancelable !== undefined) {
            return this.dispatchDOM(type as keyof InteractionEvents, args as any);
        }
        this.dispatch(type as keyof MiscUpdateEvents, args as any);
    }

    public dispatchAncestorManual<T extends keyof Events>(type: T, args?: Events[T]): void {
        if ((args as EventExt)?.type) {
            this.dispatchDOMAncestor(type as keyof InteractionEvents, args as any);
        }
    }

}

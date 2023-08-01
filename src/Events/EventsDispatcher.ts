import { Object3D } from "three";
import { InteractionEvents, Events } from "./Events";
import { EventsCache } from "./MiscEventsManager";
import { applyObject3DRotationPatch, applyObject3DVector3Patch } from "../Patch/Object3D";
import { InstancedMeshSingle } from "../Objects/InstancedMeshSingle";

export class EventsDispatcher {
    public listeners: { [P in keyof Events]?: ((args?: any) => void)[] } = {};

    constructor(public parent: Object3D | InstancedMeshSingle) { }

    public add<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void {
        if (this.listeners[type] === undefined) {
            this.listeners[type] = [];
            if ((this.parent as Object3D).isObject3D) {
                EventsCache.push(type, this.parent as Object3D);
                if (type === "positionchange" || type === "scalechange") { //todo move
                    applyObject3DVector3Patch(this.parent as Object3D);
                } else if (type === "rotationchange") {
                    applyObject3DRotationPatch(this.parent as Object3D);
                }
            }
        }
        if (this.listeners[type].indexOf(listener) === -1) {
            this.listeners[type].push(listener);
        }
        return listener;
    }

    public has<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean {
        if (this.listeners[type]?.indexOf(listener) !== -1) {
            return true;
        }
        return false;
    }

    public remove<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void {
        const index = this.listeners[type]?.indexOf(listener) ?? -1;
        if (index !== -1) {
            this.listeners[type].splice(index, 1);
        }
    }

    public dispatchDOMEvent<K extends keyof InteractionEvents>(type: K, event: InteractionEvents[K]): void {
        event._bubbles = false;
        event._stoppedImmediatePropagation = false;
        event._defaultPrevented = false;
        event._type = type;
        event._target = this.parent as Object3D;
        this._dispatchDOMEvent(type, event);
    }

    private _dispatchDOMEvent<K extends keyof InteractionEvents>(type: K, event: InteractionEvents[K]): void {
        if (!this.listeners[type]) return;
        const target = event.currentTarget = this.parent as Object3D;
        for (const callback of this.listeners[type]) {
            if (event._stoppedImmediatePropagation) break;
            callback.call(target, event);
        }
    }

    public dispatchDOMEventAncestor<K extends keyof InteractionEvents>(type: K, event: InteractionEvents[K]): void {
        let target = this.parent;
        event._bubbles = true;
        event._stoppedImmediatePropagation = false;
        event._defaultPrevented = false;
        event._type = type;
        event._target = target as Object3D;
        while (target && event._bubbles) {
            target.__eventsDispatcher._dispatchDOMEvent(type, event);
            target = target.parent as Object3D;
        }
    }

    public dispatchEvent(type: keyof Events, args?: any): void {
        if (!this.listeners[type]) return;
        for (const callback of this.listeners[type]) {
            callback.call(this.parent, args);
        }
    }

}

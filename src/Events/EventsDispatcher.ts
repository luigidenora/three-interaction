import { Object3D } from "three";
import { applyEulerPatch } from "../Patch/Euler";
import { applyQuaternionPatch } from "../Patch/Quaternion";
import { applyVector3Patch } from "../Patch/Vector3";
import { DOMEvents, Events, Target } from "./Events";
import { EventsCache } from "./EventsCache";

export class EventsDispatcher {
    private _listeners: { [x: string]: ((args?: any) => void)[] } = {};

    constructor(public parent: Target) {
        parent.position && applyVector3Patch(parent.position, parent, "positionchange");
        parent.scale && applyVector3Patch(parent.scale, parent, "scalechange");
        parent.quaternion && applyQuaternionPatch(parent, "quaternionchange");
        (parent as Object3D).rotation && applyEulerPatch(parent as Object3D, "rotationchange");
    }
    public addEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void {
        if (!this._listeners[type]) {
            this._listeners[type] = [];
            EventsCache.push(type, this.parent);
        }
        if (this._listeners[type].indexOf(listener) === -1) {
            this._listeners[type].push(listener);
        }
        return listener;
    }

    public hasEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean {
        if (this._listeners[type]?.indexOf(listener) ?? -1 !== -1) {
            return true;
        }
        return false;
    }

    public removeEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void {
        const index = this._listeners[type]?.indexOf(listener) ?? -1;
        if (index !== -1) {
            this._listeners[type].splice(index, 1);
        }
    }

    public dispatchDOMEvent<K extends keyof DOMEvents>(type: K, event: DOMEvents[K]): void {
        event._bubbles = false;
        event._stoppedImmediatePropagation = false;
        event._defaultPrevented = false;
        event._type = type;
        event._target = this.parent;
        this._dispatchDOMEvent(type, event);
    }

    private _dispatchDOMEvent<K extends keyof DOMEvents>(type: K, event: DOMEvents[K]): void {
        if (!this._listeners[type]) return;
        const target = event.currentTarget = this.parent;
        // for (const callback of [...this._listeners[type]]) { // Make a copy, in case listeners are removed while iterating.
        for (const callback of this._listeners[type]) {
            if (event._stoppedImmediatePropagation) break;
            callback.call(target, event);
        }
    }

    public dispatchDOMEventAncestor<K extends keyof DOMEvents>(type: K, event: DOMEvents[K]): void {
        let target = this.parent;
        event._bubbles = true;
        event._stoppedImmediatePropagation = false;
        event._defaultPrevented = false;
        event._type = type;
        event._target = target;
        while (target && event._bubbles) {
            target._eventsDispatcher._dispatchDOMEvent(type, event);
            target = target.parent as Object3D;
        }
    }

    public dispatchEvent(type: keyof Events, args?: any): void {
        if (!this._listeners[type]) return;
        // for (const callback of [...this._listeners[type]]) { // Make a copy, in case listeners are removed while iterating.
        for (const callback of this._listeners[type]) {
            callback.call(this.parent, args);
        }
    }
}

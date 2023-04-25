import { Object3D } from "three";
import { Events, VectorChangedEvent } from "./Events";
import { EventsCache } from "./EventsCache";
import { eventChangedName } from "../Patch/Vector3";

export class EventsDispatcher {
    private _listeners: { [x: string]: ((args: any) => void)[] } = {};

    constructor(private _parent: Object3D) {
        this._parent.addEventListener(eventChangedName, (args) => {  //todo capire se ha senso metterlo qui
            if (args.name === "position") {
                this.dispatchEventAncestor("positionchange", new VectorChangedEvent("positionchange", this._parent, args.oldValue));
            } else if (args.name === "scale") {
                this.dispatchEventAncestor("scalechange", new VectorChangedEvent("scalechange", this._parent, args.oldValue));
            }
        });
    }

    //TODO multibind mousedown mouseup
    public addEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void {
        if (!this._listeners[type]) {
            this._listeners[type] = [];
            EventsCache.push(type, this._parent);
        }
        this._listeners[type].indexOf(listener) === -1 && this._listeners[type].push(listener);
        return listener;
    }

    public hasEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean {
        return this._listeners[type]?.indexOf(listener) !== -1 ?? false;
    }

    public removeEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void {
        const index = this._listeners[type]?.indexOf(listener) ?? -1;
        index !== -1 && this._listeners[type].splice(index, 1);
    }

    public dispatchEvent<K extends keyof Events>(type: K, args: Events[K]): void {
        if (!this._listeners[type]) return;
        for (const callback of [...this._listeners[type]]) { // Make a copy, in case listeners are removed while iterating.
            if ((args as any)._stoppedImmediatePropagation) break;
            callback.call(this._parent, args);
        }
    }

    public dispatchEventAncestor<K extends keyof Events>(type: K, event: Events[K]): void {
        let target = this._parent;
        while (target) {
            event.currentTarget = target;
            target.triggerEvent(type, event);
            if (!event.bubbles) break;
            target = target.parent;
        }
    }
}

import { Object3D } from "three";
import { EulerChangedEvent, Events, QuaternionChangedEvent, VectorChangedEvent } from "./Events";
import { EventsCache } from "./EventsCache";

/** @internal */ export const eventChangedName = "__changed";

export class EventsDispatcher {
    private _listeners: { [x: string]: ((args: any) => void)[] } = {};

    constructor(private _parent: Object3D) {
        this.bindPositionScaleRotationChanged();
    }

    private bindPositionScaleRotationChanged(): void {
        this._parent.addEventListener(eventChangedName, (args) => {
            switch (args.name) {
                case "position":
                    this.dispatchEvent("ownpositionchange", new VectorChangedEvent("ownpositionchange", this._parent, args.oldValue));
                    return this.dispatchEventAncestor("positionchange", new VectorChangedEvent("positionchange", this._parent, args.oldValue));
                case "scale":
                    this.dispatchEvent("ownscalechange", new VectorChangedEvent("ownscalechange", this._parent, args.oldValue));
                    return this.dispatchEventAncestor("scalechange", new VectorChangedEvent("scalechange", this._parent, args.oldValue));
                case "rotation":
                    this.dispatchEvent("ownrotationchange", new EulerChangedEvent("ownrotationchange", this._parent, args.oldValue));
                    return this.dispatchEventAncestor("rotationchange", new EulerChangedEvent("rotationchange", this._parent, args.oldValue));
                case "quaternion":
                    this.dispatchEvent("ownquaternionchange", new QuaternionChangedEvent("ownquaternionchange", this._parent, args.oldValue));
                    return this.dispatchEventAncestor("quaternionchange", new QuaternionChangedEvent("quaternionchange", this._parent, args.oldValue));
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
        args.stopPropagation(); //todo rendere tutti così
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

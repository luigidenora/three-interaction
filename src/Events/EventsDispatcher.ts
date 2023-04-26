import { Object3D } from "three";
import { positionChangedEvent, quaternionChangedEvent, rotationChangedEvent, scaleChangedEvent } from "../Patch/Object3D";
import { EulerChangedEvent, EventExt, Events, QuaternionChangedEvent, VectorChangedEvent } from "./Events";
import { EventsCache } from "./EventsCache";

export class EventsDispatcher {
    private _listeners: { [x: string]: ((args: any) => void)[] } = {};

    constructor(private _object3D: Object3D) {
        this.bindPositionScaleRotationChanged();
    }

    private bindPositionScaleRotationChanged(): void { //todo consider to move
        this._object3D.addEventListener(positionChangedEvent, (args) => {
            const event = new VectorChangedEvent(args.oldValue);
            this.dispatchEvent("ownpositionchange", event);
            this.dispatchEventAncestor("positionchange", event);
        });

        this._object3D.addEventListener(scaleChangedEvent, (args) => {
            const event = new VectorChangedEvent(args.oldValue);
            this.dispatchEvent("ownscalechange", event);
            this.dispatchEventAncestor("scalechange", event);
        });

        this._object3D.addEventListener(rotationChangedEvent, (args) => {
            const event = new EulerChangedEvent(args.oldValue);
            this.dispatchEvent("ownrotationchange", event);
            this.dispatchEventAncestor("rotationchange", event);
            //TODO rotazione generale evento
        });

        this._object3D.addEventListener(quaternionChangedEvent, (args) => {
            const event = new QuaternionChangedEvent(args.oldValue);
            this.dispatchEvent("ownquaternionchange", event);
            this.dispatchEventAncestor("quaternionchange", event);
            //TODO rotazione generale evento
        });
    }

    public addEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void {
        if (!this._listeners[type]) {
            this._listeners[type] = [];
            EventsCache.push(type, this._object3D);
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

    public dispatchEvent<K extends keyof Events>(type: K, event: Events[K]): void {
        event._bubbles = false;
        event._stoppedImmediatePropagation = false;
        event._defaultPrevented = false;
        event._type = type;
        event._target = this._object3D;
        this._dispatchEvent(type, event);
    }

    private _dispatchEvent<K extends keyof Events>(type: K, event: Events[K]): void {
        if (!this._listeners[type]) return;
        const object3D = event.currentTarget = this._object3D;
        // for (const callback of [...this._listeners[type]]) { // Make a copy, in case listeners are removed while iterating.
        for (const callback of this._listeners[type]) {
            if (event._stoppedImmediatePropagation) break;
            callback.call(object3D, event);
        }
    }

    public dispatchEventAncestor<K extends keyof Events>(type: K, event: Events[K]): void {
        let target = this._object3D;
        event._bubbles = true;
        event._stoppedImmediatePropagation = false;
        event._defaultPrevented = false;
        event._type = type;
        event._target = target;
        while (target && event._bubbles) {
            target._eventsDispatcher._dispatchEvent(type, event);
            target = target.parent;
        }
    }
}

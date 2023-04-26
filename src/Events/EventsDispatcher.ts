import { Object3D } from "three";
import { positionChangedEvent, quaternionChangedEvent, rotationChangedEvent, scaleChangedEvent } from "../Patch/Object3D";
import { EulerChangedEvent, Events, QuaternionChangedEvent, VectorChangedEvent } from "./Events";
import { EventsCache } from "./EventsCache";

export class EventsDispatcher {
    private _listeners: { [x: string]: ((args: any) => void)[] } = {};

    constructor(private _parent: Object3D) {
        this.bindPositionScaleRotationChanged();
    }

    private bindPositionScaleRotationChanged(): void {
        this._parent.addEventListener(positionChangedEvent, (args) => {
            const event = new VectorChangedEvent("ownpositionchange", args.target, args.oldValue);
            this.dispatchEvent("ownpositionchange", event);
            (event as any).type = "positionchange"; //TODO opt
            this.dispatchEventAncestor("positionchange", event);
        });

        this._parent.addEventListener(scaleChangedEvent, (args) => {
            const event = new VectorChangedEvent("ownscalechange", args.target, args.oldValue);
            this.dispatchEvent("ownscalechange", event);
            (event as any).type = "scalechange";
            this.dispatchEventAncestor("scalechange", event);
        });

        this._parent.addEventListener(rotationChangedEvent, (args) => {
            const event = new EulerChangedEvent("ownrotationchange", args.target, args.oldValue);
            this.dispatchEvent("ownrotationchange", event);
            (event as any).type = "rotationchange";
            this.dispatchEventAncestor("rotationchange", event);
            //TODO rotazione generale evento
        });

        this._parent.addEventListener(quaternionChangedEvent, (args) => {
            const event = new QuaternionChangedEvent("ownquaternionchange", args.target, args.oldValue);
            this.dispatchEvent("ownquaternionchange", event);
            (event as any).type = "quaternionchange";
            this.dispatchEventAncestor("quaternionchange", event);
            //TODO rotazione generale evento
        });
    }

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
        args.stopPropagation(); //todo rendere tutti così TODO mettere bubble nel costruttore
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

import { Object3D } from "three";
import { Events } from "./Events";

export class EventsDispatcher {
    private _listeners: { [x: string]: ((args: any) => void)[] } = {};

    constructor(private _parent: Object3D) { }

    //TODO multibind mousedown mouseup
    public addEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void {
        this._listeners[type] ?? (this._listeners[type] = []);
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
}

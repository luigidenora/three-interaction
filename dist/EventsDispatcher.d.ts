import { Object3D } from "three";
import { Events } from "./Events";
export declare class EventsDispatcher {
    private _parent;
    private _listeners;
    constructor(_parent: Object3D);
    addEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    removeEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    dispatchEvent<K extends keyof Events>(type: K, args: Events[K]): void;
}

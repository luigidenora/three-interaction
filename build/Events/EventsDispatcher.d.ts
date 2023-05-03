import { Object3D } from "three";
import { DOMEvents, Events } from "./Events";
import { InstancedMeshSingle } from "../EnhancedObjects/InstancedMeshSingle";
export declare class EventsDispatcher {
    parent: Object3D | InstancedMeshSingle;
    private _listeners;
    constructor(parent: Object3D | InstancedMeshSingle);
    addEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    removeEventListener<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    dispatchDOMEvent<K extends keyof DOMEvents>(type: K, event: DOMEvents[K]): void;
    private _dispatchDOMEvent;
    dispatchDOMEventAncestor<K extends keyof DOMEvents>(type: K, event: DOMEvents[K]): void;
    dispatchEvent(type: keyof Events, args?: any): void;
}

import { Object3D, Scene } from "three";
import { Events } from "./Events";
export declare class EventsCache {
    private static _allowedEventsSet;
    private static _events;
    static push(type: keyof Events, target: Object3D): void;
    private static pushScene;
    static remove(): void;
    static dispatchEvent<K extends keyof Events>(scene: Scene, type: K, event?: Events[K]): void;
}

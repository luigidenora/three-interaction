import { Camera, Object3D, Scene } from "three";
import { Events } from "./Events";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";

type SceneEventsCache = { [x: string]: DistinctTargetArray };

export class EventsCache {
   private static _allowedEventsSet = new Set(["rendererresize", "beforeanimate", "animate", "afteranimate"] as (keyof Events)[]);
   private static _events: { [x: number]: SceneEventsCache } = {};

   public static push(type: keyof Events, target: Object3D): void {
      const scene = target.scene;
      if (scene !== undefined && this._allowedEventsSet.has(type)) {
         this.pushScene(scene, type, target);
      }
   }

   public static update(target: Object3D): void {
      this.updateEvent(target, "rendererresize");
      this.updateEvent(target, "beforeanimate");
      this.updateEvent(target, "animate");
      this.updateEvent(target, "afteranimate");
   }

   private static updateEvent(target: Object3D, name: keyof Events): void {
      if (target.__eventsDispatcher.listeners[name]?.length > 0) {
         this.pushScene(target.scene, name, target);
      }
   }

   private static pushScene(scene: Scene, type: keyof Events, target: Object3D): void {
      const sceneCache = this._events[scene.id] ?? (this._events[scene.id] = {});
      const eventCache = sceneCache[type] ?? (sceneCache[type] = new DistinctTargetArray());
      eventCache.push(target);
   }

   public static removeAll(target: Object3D): void {
      const sceneCache = this._events[target.scene?.id];
      if (sceneCache) {
         for (const key in sceneCache) {
            const eventCache = sceneCache[key];
            eventCache.remove(target);
         }
      }
   }

   public static remove(type: keyof Events, target: Object3D): void {
      const sceneCache = this._events[target.scene?.id];
      if (sceneCache) {
         sceneCache[type]?.remove(target);
      }
   }

   public static dispatchEvent<K extends keyof Events>(scene: Scene, type: K, event?: Events[K]): void {
      const sceneCache = this._events[scene?.id];
      if (sceneCache?.[type]) {
         for (const target of sceneCache[type].data) {
            target.__eventsDispatcher.dispatch(type, event);
         }
      }
   }

   public static dispatchEventExcludeCameras<K extends keyof Events>(scene: Scene, type: K, event?: Events[K]): void {
      const sceneCache = this._events[scene?.id];
      if (sceneCache?.[type]) {
         for (const target of sceneCache[type].data) {
            if ((target as Camera).isCamera !== true) {
               target.__eventsDispatcher.dispatch(type, event);
            }
         }
      }
   }

}

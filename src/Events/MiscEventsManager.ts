import { Object3D, Scene } from "three";
import { Events } from "./Events";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";

type SceneEventsCache = { [x: string]: DistinctTargetArray };

export class EventsCache {
   private static _allowedEventsSet = new Set(["rendererresize", "framerendering", "animate"] as (keyof Events)[]);
   private static _events: { [x: number]: SceneEventsCache } = {};

   public static push(type: keyof Events, target: Object3D): void {
      const scene = target.__scene;
      if (scene !== undefined && this._allowedEventsSet.has(type)) {
         this.pushScene(scene, type, target);
      }
   }

   public static update(target: Object3D): void {
      let scene = target.__scene;
      if (target.__eventsDispatcher.listeners["rendererresize"]?.length > 0) {
         this.pushScene(scene, "rendererresize", target);
      }
      if (target.__eventsDispatcher.listeners["framerendering"]?.length > 0) {
         this.pushScene(scene, "framerendering", target);
      }
      if (target.__eventsDispatcher.listeners["animate"]?.length > 0) {
         this.pushScene(scene, "animate", target);
      }
   }

   private static pushScene(scene: Scene, type: keyof Events, target: Object3D): void {
      const sceneCache = this._events[scene.id] ?? (this._events[scene.id] = {});
      const eventCache = sceneCache[type] ?? (sceneCache[type] = new DistinctTargetArray());
      eventCache.push(target);
   }

   //TODO chiama after remove event listner
   public static remove(target: Object3D, scene: Scene): void {
      const sceneCache = this._events[scene?.id];
      if (sceneCache !== undefined) {
         for (const key in sceneCache) {
            const eventCache = sceneCache[key];
            eventCache.remove(target);
         }
      }
   }

   public static dispatchEvent<K extends keyof Events>(scene: Scene, type: K, event?: Events[K]): void {
      const sceneCache = this._events[scene?.id];
      if (sceneCache && sceneCache[type]) {
         for (const target of sceneCache[type].data) {
            target.__eventsDispatcher.dispatchEvent(type, event);
         }
      }
   }
}

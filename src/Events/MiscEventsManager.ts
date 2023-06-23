import { Object3D, Scene } from "three";
import { Utils } from "../Utils/Utils";
import { Events } from "./Events";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";

type SceneEventsCache = { [x: string]: DistinctTargetArray };

export class EventsCache {
   private static _allowedEventsSet = new Set(["rendererresize", "framerendering", "animate"] as (keyof Events)[]);
   private static _events: { [x: number]: SceneEventsCache } = {};

   public static push(type: keyof Events, target: Object3D): void {
      if (this._allowedEventsSet.has(type)) {
         let scene = Utils.getSceneFromObj(target);
         if (scene) {
            this.pushScene(scene, type, target);
         } else {
            const event = () => {
               scene = Utils.getSceneFromObj(target);
               this.pushScene(scene, type, target);
               target.removeEventListener("added", event);
            };
            target.addEventListener("added", event)
         }
      }
   }

   private static pushScene(scene: Scene, type: keyof Events, target: Object3D): void {
      const sceneCache = this._events[scene.id] ?? (this._events[scene.id] = {});
      const eventCache = sceneCache[type] ?? (sceneCache[type] = new DistinctTargetArray());
      eventCache.push(target);
   }

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

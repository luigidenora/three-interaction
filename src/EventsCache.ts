import { Object3D, Scene } from "three";
import { Events } from "./Events";
import { Utils } from "./Utils";

type SceneEventsCache = { [x: string]: { [x: number]: Object3D } };

export class EventsCache {
   private static _events: { [x: number]: SceneEventsCache } = {};

   public static push(type: keyof Events, target: Object3D): void {
      if (type === "canvasResize") {
         const scene = Utils.getSceneFromObj(target);
         if (scene) {
            const sceneCache = this._events[scene.id] ?? (this._events[scene.id] = {});
            const eventCache = sceneCache[type] ?? (sceneCache[type] = []);
            eventCache[target.id] = target;
         }
      }
   }

   public static remove(): void {
      //
   }

   public static trigger<K extends keyof Events>(scene: Scene, type: K, args: Events[K]): void {
      if (type === "canvasResize") {
         const sceneCache = this._events[scene?.id];
         if (sceneCache) {
            const eventCache = sceneCache[type];
            for (const key in eventCache) {
               args.target = eventCache[key];
               eventCache[key].triggerEvent(type, args);
            }
         }
      }
   }
}

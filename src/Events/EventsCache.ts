import { Scene } from "three";
import { Utils } from "../Utils";
import { Events, Target } from "./Events";

type SceneEventsCache = { [x: string]: Target[] };

export class EventsCache {
   private static _allowedEventsSet = new Set(["rendererresize", "framerendering", "animate"] as (keyof Events)[]);
   private static _events: { [x: number]: SceneEventsCache } = {};

   public static push(type: keyof Events, target: Target): void {
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

   private static pushScene(scene: Scene, type: keyof Events, target: Target): void {
      const sceneCache = this._events[scene.id] ?? (this._events[scene.id] = {});
      const eventCache = sceneCache[type] ?? (sceneCache[type] = []);
      if (eventCache.indexOf(target) === -1) {
         eventCache.push(target);
      }
   }

   public static remove(): void {
      // TODO
   }

   public static dispatchEvent<K extends keyof Events>(scene: Scene, type: K, event?: Events[K]): void {
      const sceneCache = this._events[scene?.id];
      if (sceneCache && sceneCache[type]) {
         for (const target of sceneCache[type]) {
            target._eventsDispatcher.dispatchEvent(type, event);
         }
      }
   }
}

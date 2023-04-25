import { Object3D, Scene } from "three";
import { Events } from "./Events";
import { Utils } from "../Utils";

type SceneEventsCache = { [x: string]: { [x: number]: Object3D } };

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
      const eventCache = sceneCache[type] ?? (sceneCache[type] = {});
      eventCache[target.id] = target;
   }

   public static remove(): void {
      // TODO
   }

   public static trigger<K extends keyof Events>(scene: Scene, type: K, args: Events[K]): void {
      const sceneCache = this._events[scene?.id];
      if (sceneCache) {
         const eventCache = sceneCache[type];
         for (const key in eventCache) {
            args.target = args.currentTarget = eventCache[key];
            eventCache[key].triggerEvent(type, args); //TODO fix immediate propagation
         }
      }
   }
}

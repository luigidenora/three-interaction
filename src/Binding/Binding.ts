import { Object3D, Scene } from "three";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";
import { Utils } from "../Utils/Utils";

/**
 * Executes all callbacks bound to objects with detectChangesMode set to 'auto'. 
 * @param scenes Scene or Scene array where execute bound callbacks.
 */
export function computeAutoBinding(scenes: Scene | Scene[]) {
  Binding.computeAll(scenes);
}

/** @internal */
export interface BindingCallback {
  callback: () => void;
  key: string;
}

/** @internal */
export class Binding {

  public static createProperty(key: string, target: Object3D, getValue: () => any): void {
    //if already exists throw exception  if (this.getIndexByKey(target, key) === -1)
    this.bindObjCallback({ key, callback: this.getBindingCallback(key, getValue, target) }, target);
    this.bindObjToScene(target);
  }

  private static getBindingCallback(key: string, getValue: () => any, target: Object3D): () => void {
    const needsUpdateKey = `__needsUpdate${key}`;
    const privateKey = `__${key}`;
    const needsUpdateCallback = () => { (target as any)[needsUpdateKey] = true };
    const bindedGetValue = getValue.bind(target); //todo check

    Object.defineProperty(target, key, {
      get: function (this: any) {
        if (this[needsUpdateKey] === true) {
          this[privateKey] = bindedGetValue();
          this[needsUpdateKey] = false;
        }
        return this[privateKey];
      }
    });

    return needsUpdateCallback;
  }

  private static bindObjCallback(bindingCallback: BindingCallback, target: Object3D): void {
    const boundCallbacks = target.__boundCallbacks ?? (target.__boundCallbacks = []);
    boundCallbacks.push(bindingCallback);
    bindingCallback.callback();
  }

  public static bindObjToScene(target: Object3D): void {
    if (!target.__manualDetection) {
      const scene = Utils.getSceneFromObj(target);
      if (scene) {
        const boundObjects = scene.__boundObjects ?? (scene.__boundObjects = new DistinctTargetArray());
        boundObjects.push(target);
      }
    }
  }

  public static bindObjAndChildrenToScene(target: Object3D, scene: Scene): void {
    if (!target.__manualDetection && target.__boundCallbacks) {
      const boundObjects = scene.__boundObjects ?? (scene.__boundObjects = new DistinctTargetArray()); //todo cache this param
      boundObjects.push(target);
    }

    for (const child of target.children) {
      this.bindObjAndChildrenToScene(child, scene);
    }
  }

  public static unbindObjAndChildrenFromScene(target: Object3D, scene: Scene): void {
    if (!target.__manualDetection) {
      const boundObjects = scene?.__boundObjects;  //todo cache this param e fixare le condizioni
      if (boundObjects !== undefined) {
        boundObjects.remove(target);
      }
    }

    if (scene) {
      for (const child of target.children) {
        this.unbindObjAndChildrenFromScene(child, scene);
      }
    }
  }

  private static executeAllCallbacks(target: Object3D): void {
    for (const bindingCallback of target.__boundCallbacks) {
      bindingCallback.callback();
    }
  }

  public static unbindByKey(target: Object3D, key: string): void {
    const index = this.getIndexByKey(target, key); //TODO FIX
    if (index !== -1) {
      target.__boundCallbacks.splice(index, 1);
    }
  }

  private static getIndexByKey(target: Object3D, key: string): number {
    const boundCallbacks = target.__boundCallbacks;
    if (boundCallbacks === undefined) return -1;
    for (let i = 0; i < boundCallbacks.length; i++) {
      if (boundCallbacks[i].key === key) return i;
    }
    return -1;
  }

  public static computeSingle(target: Object3D): void { //TODO remove
    this.executeAllCallbacks(target);
  }

  public static computeAll(scenes: Scene | Scene[]): void {
    if ((scenes as Scene).isScene) {
      this.computeScene(scenes as Scene);
    } else {
      for (const scene of scenes as Scene[]) {
        this.computeScene(scene);
      }
    }
  }

  private static computeScene(scene: Scene): void {
    if (scene.__boundObjects) {
      for (const target of scene.__boundObjects.data) {
        this.executeAllCallbacks(target);
      }
    }
  }
}

import { Euler, Object3D, Quaternion, Scene, Vector2, Vector3 } from "three";
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

  public static createCallback(key: string, target: Object3D, callback: () => void): void {
    if (this.getIndexByKey(target, key) === -1) {
      this.bindObjCallback({ key, callback }, target);
      this.bindObjToScene(target, false);
    }
  }

  public static createProperty(key: string, target: Object3D, getValue: () => any): void {
    if (this.getIndexByKey(target, key) === -1) {
      this.bindObjCallback(this.getPropBindingCallback(key, getValue, target), target);
      this.bindObjToScene(target, false);
    }
  }

  private static getPropBindingCallback(key: string, getValue: () => any, target: Object3D): BindingCallback {
    if (target.__manualDetection) {
      return { key, callback: this.getPropManualCallback(key, getValue, target) };
    }
    return { key, callback: this.getPropAutoCallback(key, getValue, target) };
  }

  private static getPropManualCallback(key: string, getValue: () => any, target: any): () => void {
    if ((target[key] as Vector3)?.isVector3 || (target[key] as Vector2)?.isVector2 ||
      (target[key] as Quaternion)?.isQuaternion || (target[key] as Euler)?.isEuler) {
      return function (this: any) { this[key].copy(getValue.call(this)) };
    } else {
      return function (this: any) { this[key] = getValue.call(this) };
    }
  }

  private static getPropAutoCallback(key: string, getValue: () => any, target: Object3D): () => void {
    const needsUpdateKey = `__needsUpdate${key}`;
    const privateKey = `__${key}`;
    const needsUpdateCallback = function (this: any) { this[needsUpdateKey] = true };

    Object.defineProperty(target, key, {
      get: function (this: any) {
        if (this[needsUpdateKey] === true) {
          this[privateKey] = getValue.call(this);
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
    this.executeCallback(target, bindingCallback);
  }

  public static bindObjToScene(target: Object3D, updateChildren: boolean, scene?: Scene): void {
    if (!target.__manualDetection && target.__boundCallbacks) {
      scene ||= Utils.getSceneFromObj(target);
      if (scene) {
        const boundObjects = scene.__boundObjects ?? (scene.__boundObjects = new DistinctTargetArray());
        boundObjects.push(target);
      }
    }

    if (updateChildren) {
      for (const child of target.children) {
        this.bindObjToScene(child, true, scene);
      }
    }
  }

  public static unbindObjFromScene(target: Object3D, scene: Scene): void {
    if (!target.__manualDetection) {
      const boundObjects = scene?.__boundObjects;
      if (boundObjects) {
        boundObjects.remove(target);
      }
    }

    if (scene) {
      for (const child of target.children) {
        this.unbindObjFromScene(child, scene);
      }
    }
  }

  private static executeCallback(target: Object3D, bindingCallback: BindingCallback): void {
    bindingCallback.callback.call(target);
  }

  private static executeAllCallbacks(target: Object3D): void {
    for (const callback of target.__boundCallbacks) {
      this.executeCallback(target, callback);
    }
  }

  public static unbindByKey(target: Object3D, key: string): void {
    const index = this.getIndexByKey(target, key);
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

  public static computeSingle(target: Object3D): void {
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

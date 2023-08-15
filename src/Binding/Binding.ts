import { Object3D, Scene } from "three";

/** @internal */
export interface BindingCallback {
  getValue: () => any;
  setValue: (value: any) => void;
  key: string;
}

/** @internal */
export class Binding {

  public static detectChanges(target: Object3D, resursive: boolean): void {
    this.executeAllCallbacks(target);
    if (resursive === true) {
      for (const child of target.children) {
        this.detectChanges(child, true);
      }
    }
  }

  public static bindProperty(key: string, target: Object3D, getValue: () => any, renderOnChange?: boolean): void {
    if (this.getIndexByKey(target, key) !== -1) {
      console.error("Cannot override property already bound.");
      return;
    }

    this.addToBoundCallbacks(key, target, getValue.bind(target), renderOnChange);
    if (target.scene !== undefined) {
      this.bindToScene(target);
    }
  }

  private static addToBoundCallbacks(key: string, target: Object3D, getValue: () => any, renderOnChange: boolean): void {
    target.__boundCallbacks ??= [];
    const setValue = this.createSetValue(key, target, getValue, renderOnChange);
    const bindingCallback: BindingCallback = { key, getValue, setValue };
    target.__boundCallbacks.push(bindingCallback);
    this.executeCallback(bindingCallback);
  }

  private static createSetValue(key: string, target: Object3D, getValue: () => any, renderOnChange: boolean): (value: any) => void {
    if (renderOnChange === true) {
      return (value) => {
        if (value !== (target as any)[key]) {
          (target as any)[key] = value;
          target.needsRender = true;
        }
      };
    }
    return (value) => {
      if (value !== (target as any)[key]) {
        (target as any)[key] = value;
      }
    };
  }

  private static getIndexByKey(target: Object3D, key: string): number {
    const boundCallbacks = target.__boundCallbacks;
    if (!boundCallbacks) return -1;
    for (let i = 0; i < boundCallbacks.length; i++) {
      if (boundCallbacks[i].key === key) return i;
    }
    return -1;
  }

  public static setManualDetectionMode(target: Object3D): void {
    if (target.__manualDetection === true) return;
    if (!target.__boundCallbacks) {
      target.__manualDetection = true;
    } else {
      console.error("Cannot change detectChangesMode if a binding is already created.");
    }
  }

  public static bindToScene(target: Object3D): void {
    if (target.__boundCallbacks?.length > 0) {
      target.scene.__boundObjects.push(target);
    }
  }

  public static unbindFromScene(target: Object3D): void {
    target.scene.__boundObjects.remove(target);
  }

  public static unbindProperty(target: Object3D, key: string): void {
    const index = this.getIndexByKey(target, key);
    if (index !== -1) {
      target.__boundCallbacks.splice(index, 1);
      if (target.scene) {
        this.unbindFromScene(target);
      }
    }
  }

  private static executeCallback(bindingCallback: BindingCallback): void {
    bindingCallback.setValue(bindingCallback.getValue());
  }

  private static executeAllCallbacks(target: Object3D): void {
    const callbacks = target.__boundCallbacks;
    for (const callback of callbacks) {
      this.executeCallback(callback);
    }
  }

  public static compute(scene: Scene): void {
    const boundObjs = scene.__boundObjects;
    for (const target of boundObjs.data) {
      this.executeAllCallbacks(target);
    }
  }

}

import { Object3D } from "three";
import { Main } from "../Objects/Main";

/** @internal */
export interface BindingCallback {
  setValue: () => void;
  key: string;
}

/** @internal */
export class Binding {

  public static bindProperty(key: string, target: Object3D, getValue: () => any): void {
    if (this.getIndexByKey(target, key) !== -1) {
      console.error("Cannot override property already bound.");
      return;
    }

    const getValueBinded = getValue.bind(target);
    this.defineProperty(key, getValueBinded, target);
    this.addToBoundCallbacks(key, getValueBinded, target);
  }

  private static getIndexByKey(target: Object3D, key: string): number {
    const boundCallbacks = target.__boundCallbacks;
    if (boundCallbacks === undefined) return -1;

    for (let i = 0; i < boundCallbacks.length; i++) {
      if (boundCallbacks[i].key === key) return i;
    }

    return -1;
  }

  private static defineProperty(key: string, getValue: () => any, target: Object3D): void {
    if (target.__manualDetection === true) {
      this.definePropertyManualDetection(key, target);
    } else {
      this.definePropertyAutoDetection(key, getValue, target);
    }
  }

  private static definePropertyManualDetection(key: string, target: Object3D): void {
    const privateKey = `__${key}`;

    Object.defineProperty(target, key, {
      get: function (this: any) {
        return this[privateKey];
      },
      set: function () { },
      configurable: true
    });
  }

  private static definePropertyAutoDetection(key: string, getValue: () => any, target: Object3D): void {
    const privateKey = `__${key}`;
    const lastTickKey = `__lastTick_${key}`;

    Object.defineProperty(target, key, {
      get: function (this: any) {
        if (this[lastTickKey] !== Main.ticks) {  //override with scene.ticks ?
          this[privateKey] = getValue();
          this[lastTickKey] = Main.ticks;
        }
        return this[privateKey];
      },
      set: function () { },
      configurable: true
    });
  }

  private static addToBoundCallbacks(key: string, getValue: () => any, target: Object3D): void {
    const boundCallbacks = target.__boundCallbacks ?? (target.__boundCallbacks = []);
    const privateKey = `__${key}`;
    const setValue = () => { (target as any)[privateKey] = getValue() };
    boundCallbacks.push({ key, setValue });
    setValue();
  }

  public static detectChanges(target: Object3D): void {
    for (const bindingCallback of target.__boundCallbacks) {
      bindingCallback.setValue();
    }
  }

  public static unbindProperty(target: Object3D, key: string): void {
    const index = this.getIndexByKey(target, key);
    if (index !== -1) {
      target.__boundCallbacks.splice(index, 1);

      const privateKey = `__${key}`;
      Object.defineProperty(target, key, {
        value: (target as any)[privateKey]
      });
    }
  }

  public static setManualDetectionMode(target: Object3D): void {
    if (target.__manualDetection === true) return;

    if (target.__boundCallbacks !== undefined) {
      for (const boundCallback of target.__boundCallbacks) {
        this.definePropertyManualDetection(boundCallback.key, target);
      }
    }

    target.__manualDetection = true;
  }
}

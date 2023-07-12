import { Object3D, Scene } from "three";
import { Main } from "../Core/Main";

/** @internal */
export interface BindingCallback {
  setValue: () => void;
  key: string;
}

/** @internal */
export class Binding { //TODO remove as class

  public static bindProperty(key: string, target: Object3D, getValue: () => any, renderOnChange?: boolean): void {
    if (this.getIndexByKey(target, key) !== -1) {
      console.error("Cannot override property already bound.");
      return;
    }

    const getValueBinded = getValue.bind(target);
    this.defineProperty(key, getValueBinded, target, renderOnChange);
    this.addToBoundCallbacks(key, getValueBinded, target, renderOnChange);
    if (target.scene !== undefined) {
      this.bindToScene(target);
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

  private static defineProperty(key: string, getValue: () => any, target: Object3D, renderOnChange: boolean): void {
    if (target.__manualDetection === true) {
      this.definePropertyManualDetection(key, target);
    } else {
      this.definePropertyAutoDetection(key, getValue, target, renderOnChange);
    }
  }

  private static definePropertyManualDetection(key: string, target: Object3D): void {
    const privateKey = `__bound__${key}`;

    Object.defineProperty(target, key, {
      get: function (this: any) {
        return this[privateKey];
      }, configurable: true
    });
  }

  private static definePropertyAutoDetection(key: string, getValue: () => any, target: Object3D, renderOnChange: boolean): void {
    const privateKey = `__bound__${key}`;
    const lastTickKey = `__lastTick_${key}`;

    if (renderOnChange === true) {

      Object.defineProperty(target, key, {
        get: function (this: any) {
          if (this[lastTickKey] !== Main.ticks) {  //TODO override with scene.ticks ?
            const value = getValue();
            this[lastTickKey] = Main.ticks;
            if (value !== this[privateKey]) {
              this[privateKey] = value;
              this.scene.needsRender = true;
            }
          }
          return this[privateKey];
        }, configurable: true
      });

    } else {

      Object.defineProperty(target, key, {
        get: function (this: any) {
          if (this[lastTickKey] !== Main.ticks) {  //TODO override with scene.ticks ?
            this[privateKey] = getValue();
            this[lastTickKey] = Main.ticks;
          }
          return this[privateKey];
        }, configurable: true
      });

    }
  }

  private static addToBoundCallbacks(key: string, getValue: () => any, target: Object3D, renderOnChange: boolean): void {
    const boundCallbacks = target.__boundCallbacks ?? (target.__boundCallbacks = []);
    const privateKey = `__bound__${key}`;
    let setValue: () => void;
    if (renderOnChange === true) {

      setValue = () => {
        const value = getValue();
        if (value !== (target as any)[privateKey]) {
          (target as any)[privateKey] = value;
          target.scene.needsRender = true;
        }
      };

    } else {

      setValue = () => { (target as any)[privateKey] = getValue() };
    }

    boundCallbacks.push({ key, setValue });
    if (target.__manualDetection === true) {
      setValue();
    }
  }

  /** @internal */
  public static bindToScene(target: Object3D): void {
    target.scene.__boundObjects.push(target);
  }

  /** @internal */
  public static unbindFromScene(target: Object3D): void {
    target.scene.__boundObjects.remove(target);
  }

  public static detectChanges(target: Object3D, resursive: boolean): void {
    if (target.__boundCallbacks !== undefined) {
      for (const bindingCallback of target.__boundCallbacks) {
        bindingCallback.setValue();
      }
    }
    if (resursive === true) {
      for (const child of target.children) {
        this.detectChanges(child, true);
      }
    }
  }

  public static unbindProperty(target: Object3D, key: string): void {
    const index = this.getIndexByKey(target, key);
    if (index !== -1) {
      target.__boundCallbacks.splice(index, 1);

      const privateKey = `__bound__${key}`;
      const lastTickKey = `__lastTick_${key}`;

      Object.defineProperty(target, key, {
        value: (target as any)[privateKey], writable: true, configurable: true
      });

      if (target.scene !== undefined) {
        this.unbindFromScene(target);
      }

      delete (target as any)[privateKey];
      delete (target as any)[lastTickKey];
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

  public static compute(scene: Scene): void {
    for (const object of scene.__boundObjects.data) {
      if (object.__boundCallbacks !== undefined) {
        for (const boundProperty of object.__boundCallbacks) {
          (object as any)[boundProperty.key]; //TODO mmm...
        }
      }
    }
  }

}

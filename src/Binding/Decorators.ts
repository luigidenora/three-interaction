import { Object3D } from 'three';

/**
 * A decorator that binds a property or callback of a Object3D to a function that returns its value.
 * @param bindAfterParentAdded An optional configuration object that specifies whether to bind the property after the parent is added.
 * @returns A function that applies the decorator to the target object, property key and descriptor.
 * @example
 * ```
 * class Box extends Mesh {
 *  @Bind() get myProperty() { return expression; }
 *  @Bind() myCallback() { code }
 * }
 * ```
 */
export const Bind = (): Function =>
  function (target: Object3D, key: string, descriptor: PropertyDescriptor) {
    if (descriptor.get) {
      const base = descriptor.get;
      delete (target as any)[key];
      delete descriptor.get; //to avoid to auto define property after decorator
      delete descriptor.set; //to avoid to auto define property after decorator
      descriptor.writable = true;
      target.bindProperty(key as keyof Object3D, base);
    } else if (descriptor.value) {
      target.bindCallback(key, descriptor.value);
    }
  };

  export const ManualDetectionMode = (): Function =>
  function (target: typeof Object3D, key: string, descriptor: PropertyDescriptor) {
    target.prototype.__manualDetection = true;
  };

import { Object3D } from 'three';

/**
 * Decorator function that binds a property to the target object with a callback function to retrieve the value.
 * @example
 * ```
 * class Box extends Mesh {
 *  @Bind() get myProperty() { return this.parent?.children.length > 1; }
 * }
 * ```
 */
export function Bind() {
  return function (target: Object3D, key: string, descriptor: PropertyDescriptor) {
    if (descriptor.get) {
      const base = descriptor.get;
      delete (target as any)[key];
      delete descriptor.get; // To avoid to auto define property after decorator
      delete descriptor.set;
      delete descriptor.configurable;
      target.bindProperty(key as keyof Object3D, base);
    }
  }
}

/**
 * Decorator function that enables manual detection mode for a target object.
 */
export function ManualDetection(target: typeof Object3D) {
  target.prototype.__manualDetection = true;
}

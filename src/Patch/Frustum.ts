// import { Frustum, Object3D } from "three";
// import { autoUpdateMatrix } from "./AutoUpdateMatrix";

// //todo RISCRIVERE
// const smartFrustum = true;

// if (autoUpdateMatrix && smartFrustum) {
//     const base = Frustum.prototype.intersectsObject;
//     Frustum.prototype.intersectsObject = function (object: Object3D) {
//         if (!object.frustumNeedsUpdate) return object.isInFrustum
//         object.frustumNeedsUpdate = false;
//         return object.isInFrustum = base.call(this, object);
//     };
// }
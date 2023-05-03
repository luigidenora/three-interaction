import { PerspectiveCamera as PerspectiveCameraBase } from "three";
/**
 * Important: adding camera to scene to trigger renderresize event.
 */
export declare class PerspectiveCamera extends PerspectiveCameraBase {
    constructor(fov?: number, near?: number, far?: number);
}

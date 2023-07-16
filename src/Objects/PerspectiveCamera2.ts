import { PerspectiveCamera as PerspectiveCameraBase } from "three";

/**
 * Important: adding camera to scene to trigger renderresize event.
 */
export class PerspectiveCamera2 extends PerspectiveCameraBase {
    
    constructor(fov?: number, near?: number, far?: number) {
        super(fov, undefined, near, far);
        
        this.on("rendererresize", (e) => {
            this.aspect = e.width / e.height;
            this.updateProjectionMatrix();
        });
    }
}

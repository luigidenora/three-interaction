import { PerspectiveCamera as PerspectiveCameraBase } from "three";

export class PerspectiveCamera extends PerspectiveCameraBase {
    
    constructor(fov?: number, near?: number, far?: number) {
        super(fov, undefined, near, far);
        
        this.bindEvent("rendererresize", (e) => {
            this.aspect = e.width / e.height;
            this.updateProjectionMatrix();
        });
    }
}

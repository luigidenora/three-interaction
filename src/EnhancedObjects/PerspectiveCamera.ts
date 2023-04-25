import { PerspectiveCamera as PerspectiveCameraBase } from "three";

export class PerspectiveCamera extends PerspectiveCameraBase {
    
    constructor(fov?: number, aspect?: number, near?: number, far?: number) {
        super(fov, aspect, near, far);
        this.bindEvent("rendererresize", (e) => {
            this.aspect = e.width / e.height;
            this.updateProjectionMatrix();
        });
    }
}

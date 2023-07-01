import { OrthographicCamera as OrthographicCameraBase } from "three";

/**
 * Important: adding camera to scene to trigger renderresize event.
 */
export class OrthographicCamera extends OrthographicCameraBase {

    //todo property frustum size
    constructor(frustumSize = 100, near?: number, far?: number) {
        super(undefined, undefined, undefined, undefined, near, far);

        this.on("rendererresize", (e) => {
            const aspect = e.width / e.height;
            this.left = -0.5 * frustumSize * aspect;
            this.right = 0.5 * frustumSize * aspect;
            this.top = frustumSize / 2;
            this.bottom = frustumSize / -2;
            this.updateProjectionMatrix();
        });
    }
}

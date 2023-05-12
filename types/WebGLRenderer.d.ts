import { WebGLRenderer as WebGLRendererBase } from "three/index";

export class WebGLRenderer extends WebGLRendererBase {
    /** @internal */
    _isGPUPicking: boolean;
}

import { WebGLRenderer as WebGLRendererBase } from "three/index";

export class WebGLRenderer extends WebGLRendererBase {
    /** @internal */
    __isGPUPicking: boolean;
}

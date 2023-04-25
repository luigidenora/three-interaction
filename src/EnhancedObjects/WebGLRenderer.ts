import { Scene, WebGLRenderer as WebGLRendererBase, WebGLRendererParameters } from "three";
import { applyWebGLRendererPatch } from "../Patch/WebGLRenderer";

export class FullScreenWebGLRenderer extends WebGLRendererBase {

    constructor(scenes: Scene[], parameters?: WebGLRendererParameters) {
        super(parameters);
        !parameters.canvas && document.body.appendChild(this.domElement);
        applyWebGLRendererPatch(this);
        this.addScene(...scenes);
        window.addEventListener("resize", () => this.setSize(window.innerWidth, window.innerHeight))
        this.setSize(window.innerWidth, window.innerHeight);
        this.setPixelRatio(window.devicePixelRatio);
    }
}

export class ResponsiveWebGLRenderer extends WebGLRendererBase {

    constructor(scenes: Scene[], parameters?: WebGLRendererParameters) {
        super(parameters);
        console.error("ResponsiveWebGLRenderer missing implementation.");
    }
}

import { Scene, WebGLRendererParameters } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { WebGLRenderer } from "./WebGLRenderer";

export class Main {
    public renderer: WebGLRenderer;
    public stats = new Stats();

    constructor(public scenes: Scene[], public animate?: XRFrameRequestCallback, fullscreen = true, parameters: WebGLRendererParameters = {}) {
        this.renderer = new WebGLRenderer(scenes, this.animateBase.bind(this), fullscreen, parameters);
        document.body.appendChild(this.stats.dom);
    }

    private animateBase(time: DOMHighResTimeStamp, frame: XRFrame): void {
        this.animate && this.animate(time, frame);
        this.renderer.render(this.renderer.activeScene, this.renderer.activeCamera);
        this.stats.update();
    }
}

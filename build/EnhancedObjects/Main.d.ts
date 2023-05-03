/// <reference types="webxr" />
/// <reference types="stats.js" />
import { Scene, WebGLRendererParameters } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { WebGLRenderer } from "./WebGLRenderer";
export declare class Main {
    scenes: Scene[];
    animate?: XRFrameRequestCallback;
    renderer: WebGLRenderer;
    stats: Stats;
    constructor(scenes: Scene[], animate?: XRFrameRequestCallback, fullscreen?: boolean, parameters?: WebGLRendererParameters);
    private animateBase;
}

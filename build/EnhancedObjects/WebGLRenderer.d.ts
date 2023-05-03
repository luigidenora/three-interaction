/// <reference types="webxr" />
import { Camera, Scene, WebGLRenderer as WebGLRendererBase, WebGLRendererParameters } from "three";
import { EventsManager } from "../Events/EventsManager";
export declare class WebGLRenderer extends WebGLRendererBase {
    eventsManager: EventsManager;
    activeScene: Scene;
    activeCamera: Camera;
    fullscreen: boolean;
    constructor(scenes: Scene[], animate: XRFrameRequestCallback, fullscreen?: boolean, parameters?: WebGLRendererParameters);
    setSizeByCanvas(): void;
}

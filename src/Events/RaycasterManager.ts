import { Object3D, OrthographicCamera, PerspectiveCamera, Raycaster, Scene, Vector2, WebGLRenderTarget, WebGLRenderer } from "three";
import { object3DList } from "../Patch/Object3D";
import { RenderManager } from "../Rendering/RenderManager";
import { IntersectionExt } from "./Events";

export class RaycasterManager {
    public raycaster = new Raycaster();
    public intersectionSortComparer = (a: IntersectionExt, b: IntersectionExt) => a.distance - b.distance;
    public raycastGPU = false; //todo capire se ha senso
    private _pickingTexture = new WebGLRenderTarget(1, 1); // todo move
    private _pointer = new Vector2();
    private _pointerNormalized = new Vector2();
    private _renderManager: RenderManager;
    private _renderer: WebGLRenderer;

    constructor(renderManager: RenderManager) {
        this._renderManager = renderManager;
        this._renderer = renderManager.renderer;
    }

    public getIntersections(event: PointerEvent, isDragging: boolean, excluded?: Object3D): IntersectionExt[] {
        const intersections: IntersectionExt[] = [];
        this._pointer.set(event.offsetX, event.offsetY);
        if (this._renderManager.getNormalizedMouse(this._pointer, this._pointerNormalized) === true) {
            const scene = this._renderManager.activeView.scene;
            const camera = this._renderManager.activeView.camera;
            this.raycaster.setFromCamera(this._pointerNormalized, camera);
            if (isDragging === false || excluded !== undefined) {
                this.raycastGPU ? this.raycastObjectsGPU(scene, camera as any, intersections, excluded) : this.raycastObjects(scene as unknown as Object3D, intersections, excluded);
            }
            intersections.sort(this.intersectionSortComparer);
        }
        return intersections;
    }

    private raycastObjects(object: Object3D, target: IntersectionExt[], excluded?: Object3D): IntersectionExt[] {
        if (object === excluded) return;

        if (object.interceptByRaycaster === true && object.visible === true) {

            for (const obj of object.children) {
                this.raycastObjects(obj, target, excluded);
            }

            let previousCount = target.length;

            if (object.objectsToRaycast !== undefined) {
                this.raycaster.intersectObjects(object.objectsToRaycast, false, target);
            } else {
                this.raycaster.intersectObject(object, false, target);
            }

            while (target.length > previousCount) {
                const intersection = target[previousCount];
                intersection.hitbox = intersection.object;
                intersection.object = object;
                previousCount++;
            }
        }

        return target;
    }

    private raycastObjectsGPU(scene: Scene, camera: PerspectiveCamera | OrthographicCamera, target: IntersectionExt[], excluded?: Object3D): IntersectionExt[] {
        const width = this._renderer.domElement.width;
        const height = this._renderer.domElement.height;
        camera.setViewOffset(width, height, this._pointer.x * devicePixelRatio, this._pointer.y * devicePixelRatio, 1, 1);
        this._renderer.setRenderTarget(this._pickingTexture);
        this._renderer.render(scene, camera);
        camera.clearViewOffset();
        const pixelBuffer = new Uint8Array(4);
        this._renderer.readRenderTargetPixels(this._pickingTexture, 0, 0, 1, 1, pixelBuffer);
        const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
        this._renderer.setRenderTarget(null);
        const object = object3DList[id];

        if (object) {
            if (object.objectsToRaycast) {
                this.raycaster.intersectObjects(object.objectsToRaycast, false, target);
            } else {
                this.raycaster.intersectObject(object, false, target);
            }

            for (const intersection of target) {
                intersection.hitbox = intersection.object;
                intersection.object = object;
            }
        }

        return target;
    }
}

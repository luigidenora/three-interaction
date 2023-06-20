import { Camera, Object3D, OrthographicCamera, PerspectiveCamera, Raycaster, Scene, Vector2, WebGLRenderTarget, WebGLRenderer } from "three";
import { IntersectionExt } from "./Events";
import { object3DList } from "../Patch/Object3D";

export class RaycasterManager {
    public raycaster = new Raycaster();
    public intersectionSortComparer = (a: IntersectionExt, b: IntersectionExt) => a.distance - b.distance;
    public raycastGPU = false; //todo capire se ha senso
    private _pickingTexture = new WebGLRenderTarget(1, 1); // todo move
    private _pointer = new Vector2();
    private _pointerNormalized = new Vector2();
    private _renderer: WebGLRenderer;

    constructor(renderer: WebGLRenderer) { 
        this._renderer = renderer;
    }

    public getIntersections(scene: Scene, camera: Camera, event: PointerEvent, isDragging: boolean, findDropTarget: boolean): IntersectionExt[] {
        const intersections: IntersectionExt[] = [];
        this.updateCanvasPointerPosition(event);
        this.raycaster.setFromCamera(this._pointerNormalized, camera);
        if (isDragging) {
            if (findDropTarget) {
                this.raycastGPU ? this.raycastObjectsGPU(scene, camera as any, intersections) : this.raycastObjectsDropTarget(scene, intersections);
            }
        } else {
            this.raycastGPU ? this.raycastObjectsGPU(scene, camera as any, intersections) : this.raycastObjects(scene, intersections);
        }
        intersections.sort(this.intersectionSortComparer);
        return intersections;
    }

    private updateCanvasPointerPosition(event: PointerEvent): void {
        this._pointerNormalized.x = event.offsetX / this._renderer.domElement.clientWidth * 2 - 1;
        this._pointerNormalized.y = event.offsetY / this._renderer.domElement.clientHeight * -2 + 1;
        this._pointer.set(event.offsetX, event.offsetY);
    }

    private raycastObjects(object: Object3D, target: IntersectionExt[] = []): IntersectionExt[] {
        if (object.interceptByRaycaster && object.visible) {

            for (const obj of object.children) {
                this.raycastObjects(obj, target);
            }

            let previousCount = target.length;

            if (object.objectsToRaycast) {
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

    private raycastObjectsDropTarget(scene: Scene, target: IntersectionExt[] = []): IntersectionExt[] {
        for (const object of scene.__dropTargets.data) {
            if (/* object.interceptByRaycaster &&  */object.visible) {

                // for (const obj of object.children) {
                //     this.raycastObjectsDropTarget(obj, target);
                // }

                let previousCount = target.length;

                if (object.objectsToRaycast) {
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
        }

        return target;
    }

    private raycastObjectsGPU(scene: Scene, camera: PerspectiveCamera | OrthographicCamera, target: IntersectionExt[] = []): IntersectionExt[] {
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
